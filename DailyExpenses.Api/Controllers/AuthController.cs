using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace DailyExpenses.Api.Controllers;

/// <summary>
/// Controller for authentication operations (registration, login, token refresh).
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService, 
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user with email and password.
    /// </summary>
    /// <param name="request">Registration request containing email and password.</param>
    /// <returns>
    /// 201 Created: User registered successfully with user ID and email
    /// 400 Bad Request: Validation failed (invalid email or password too short)
    /// 409 Conflict: Email already registered
    /// </returns>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<object>>> Register([FromBody] RegisterRequest request)
    {
        // Validate request with FluentValidation
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Validation failed",
                Code = "VALIDATION_ERROR",
                Errors = errors
            }));
        }

        // Call service to register user
        var result = await _authService.RegisterAsync(request.Email, request.Password);

        // HIGH-1 & HIGH-2: Handle validation errors from service (defensive validation)
        if (result.HasValidationError)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = result.ValidationError,
                Code = "VALIDATION_ERROR"
            }));
        }

        // Handle business logic errors (e.g., email already exists)
        if (result.HasBusinessError)
        {
            var errorResponse = new ErrorResponse(result.ErrorMessage ?? "Registration failed", "EMAIL_EXISTS");
            return Conflict(ApiResponse<ErrorResponse>.ErrorResult(errorResponse));
        }

        // Success - return 201 Created with user info
        if (result.User == null)
        {
            throw new InvalidOperationException("User object should not be null when registration succeeds");
        }

        var response = new RegisterResponse
        {
            Id = result.User.Id,
            Email = result.User.Email
        };

        // Return 201 Created with Location header pointing to the registered user resource
        var locationUri = $"/api/auth/register/{response.Id}";
        return Created(locationUri, ApiResponse<RegisterResponse>.SuccessResult(response));
    }

    /// <summary>
    /// Authenticates a user with email and password, returning JWT access token.
    /// </summary>
    /// <param name="request">Login request containing email and password.</param>
    /// <returns>
    /// 200 OK: Login successful with access token in body and refresh token in httpOnly cookie
    /// 400 Bad Request: Validation failed (empty email/password or invalid format)
    /// 401 Unauthorized: Invalid credentials (email not found or password incorrect)
    /// </returns>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        // Validate request with FluentValidation
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Validation failed",
                Code = "VALIDATION_ERROR",
                Errors = errors
            }));
        }

        // Call service to authenticate user
        LoginResult result;
        try
        {
            result = await _authService.LoginAsync(request.Email, request.Password);
        }
        catch (Exception)
        {
            // Handle unexpected errors during login
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Login failed due to unexpected error",
                Code = "LOGIN_ERROR"
            }));
        }

        // Handle validation errors from service
        if (result.HasValidationError)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = result.ErrorMessage,
                Code = "VALIDATION_ERROR"
            }));
        }

        // Handle authentication errors (invalid credentials)
        if (result.HasAuthError)
        {
            var errorResponse = new ErrorResponse(result.ErrorMessage ?? "Invalid credentials", "INVALID_CREDENTIALS");
            return Unauthorized(ApiResponse<ErrorResponse>.ErrorResult(errorResponse));
        }

        // Success - set httpOnly refresh token cookie
        // Defensive check: if refresh token generation failed unexpectedly, return proper error response
        if (string.IsNullOrEmpty(result.RefreshToken))
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Refresh token generation failed",
                Code = "TOKEN_GENERATION_ERROR"
            }));
        }

        var refreshTokenExpirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, // Prevents JavaScript access (XSS protection)
            Secure = true, // Always require HTTPS in production (Railway/Vercel)
            SameSite = SameSiteMode.None, // Required for cross-origin requests (Vercel → Railway)
            Expires = DateTimeOffset.UtcNow.AddDays(refreshTokenExpirationDays)
        };

        Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);

        // Return 200 OK with access token in body
        // Defensive check: if token generation failed unexpectedly, return proper error response
        if (string.IsNullOrEmpty(result.AccessToken))
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Token generation failed",
                Code = "TOKEN_GENERATION_ERROR"
            }));
        }

        // Calculate refresh token expiration for response (optional transparency for clients)
        var refreshTokenExpiresAt = DateTimeOffset.UtcNow.AddDays(refreshTokenExpirationDays).UtcDateTime;

        var loginResponse = new LoginResponse
        {
            AccessToken = result.AccessToken,
            RefreshTokenExpiresAt = refreshTokenExpiresAt
        };

        return Ok(ApiResponse<LoginResponse>.SuccessResult(loginResponse));
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token from httpOnly cookie.
    /// </summary>
    /// <returns>
    /// 200 OK: Refresh successful with new access token in body
    /// 401 Unauthorized: No refresh token provided, or token is invalid/expired
    /// 400 Bad Request: HTTPS required (production security)
    /// </returns>
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Refresh()
    {
        try
        {
            // CRITICAL SECURITY: Enforce HTTPS for refresh token endpoint
            // Refresh tokens transmitted over HTTP are vulnerable to man-in-the-middle attacks
            // Allow localhost for development, but enforce HTTPS in production
            if (!HttpContext.Request.IsHttps && 
                !HttpContext.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(ApiResponse<object>.ErrorResult(new
                {
                    Message = "HTTPS is required for token refresh",
                    Code = "HTTPS_REQUIRED"
                }));
            }

            // Read refresh token from cookie
            if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                var errorResponse = new ErrorResponse("No refresh token provided", "NO_REFRESH_TOKEN");
                return Unauthorized(ApiResponse<ErrorResponse>.ErrorResult(errorResponse));
            }

            // Call service layer to validate and refresh token
            var result = await _authService.RefreshTokenAsync(refreshToken);

            // Handle validation errors
            if (result.HasValidationError)
            {
                return BadRequest(ApiResponse<object>.ErrorResult(new
                {
                    Message = result.ErrorMessage,
                    Code = "VALIDATION_ERROR"
                }));
            }

            // Handle auth errors (invalid/expired token)
            if (result.HasAuthError)
            {
                var errorResponse = new ErrorResponse(
                    result.ErrorMessage ?? "Invalid or expired refresh token",
                    "INVALID_REFRESH_TOKEN"
                );
                return Unauthorized(ApiResponse<ErrorResponse>.ErrorResult(errorResponse));
            }

            // Success - return new access token
            // Defensive check: if token generation failed unexpectedly, return proper error response
            if (string.IsNullOrEmpty(result.AccessToken))
            {
                return BadRequest(ApiResponse<object>.ErrorResult(new
                {
                    Message = "Token generation failed",
                    Code = "TOKEN_GENERATION_ERROR"
                }));
            }

            var loginResponse = new LoginResponse
            {
                AccessToken = result.AccessToken
            };

            return Ok(ApiResponse<LoginResponse>.SuccessResult(loginResponse));
        }
        catch (Exception ex)
        {
            // OBSERVABILITY FIX: Log unexpected errors for debugging production issues
            _logger.LogError(ex, "Unexpected error during token refresh");
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Token refresh failed due to unexpected error",
                Code = "REFRESH_ERROR"
            }));
        }
    }

    /// <summary>
    /// Logs out the authenticated user by clearing refresh token from database and cookie.
    /// </summary>
    /// <returns>
    /// 200 OK: Logout successful
    /// 401 Unauthorized: User not authenticated
    /// </returns>
    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        try
        {
            // Get userId from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(ApiResponse<ErrorResponse>.ErrorResult(
                    new ErrorResponse("User ID not found in token", "INVALID_TOKEN")
                ));
            }

            // Clear refresh token from database
            await _authService.LogoutAsync(userId);

            // Clear refresh token cookie
            Response.Cookies.Delete("refreshToken");

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                Message = "Logged out successfully"
            }));
        }
        catch (Exception)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Logout failed due to unexpected error",
                Code = "LOGOUT_ERROR"
            }));
        }
    }
}
