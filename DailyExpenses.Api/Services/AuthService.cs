using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Models;
using DailyExpenses.Api.Repositories;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace DailyExpenses.Api.Services;

/// <summary>
/// Service implementation for authentication operations.
/// Handles user registration with BCrypt password hashing and login with JWT tokens.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository, 
        ITokenService tokenService,
        ILogger<AuthService> logger,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <inheritdoc />
    public async Task<RegistrationResult> RegisterAsync(string email, string password)
    {
        // CRITICAL-2: Trim whitespace from inputs
        email = email?.Trim() ?? string.Empty;
        password = password?.Trim() ?? string.Empty;

        // CRITICAL-3 & HIGH-2: Defensive validation - return validation errors instead of throwing exceptions
        if (string.IsNullOrWhiteSpace(email))
        {
            return RegistrationResult.CreateValidationError("Email cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            return RegistrationResult.CreateValidationError("Password cannot be empty");
        }

        if (password.Length < 8)
        {
            return RegistrationResult.CreateValidationError("Password must be at least 8 characters");
        }

        // MEDIUM-1: Log registration attempt
        _logger.LogInformation("Registration attempt for email: {Email}", email);

        // Check if email already exists (optimization - avoid hashing if email exists)
        if (await _userRepository.EmailExistsAsync(email))
        {
            // MEDIUM-1: Log duplicate email attempt
            _logger.LogWarning("Registration failed - duplicate email: {Email}", email);
            return RegistrationResult.CreateBusinessError("Email already registered");
        }

        // Hash password using BCrypt with work factor 12 (as specified in architecture)
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

        // Create user entity with UTC timestamps
        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Save user to database
        var createdUser = await _userRepository.CreateAsync(user);

        // MEDIUM-1: Log successful registration
        _logger.LogInformation("User registered successfully. UserId: {UserId}, Email: {Email}", createdUser.Id, createdUser.Email);

        return RegistrationResult.CreateSuccess(createdUser);
    }

    /// <inheritdoc />
    public async Task<LoginResult> LoginAsync(string email, string password)
    {
        // Trim and normalize email for lookup
        email = email?.Trim()?.ToLower() ?? string.Empty;
        password = password?.Trim() ?? string.Empty;

        // Defensive validation
        if (string.IsNullOrWhiteSpace(email))
        {
            return LoginResult.CreateValidationError("Email cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            return LoginResult.CreateValidationError("Password cannot be empty");
        }

        _logger.LogInformation("Login attempt for email: {Email}", email);

        // Retrieve user by email
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("Login failed - user not found: {Email}", email);
            // Use same error message for email and password failures (security best practice)
            return LoginResult.CreateAuthError("Invalid credentials");
        }

        // Verify password using BCrypt
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login failed - invalid password for user: {UserId}", user.Id);
            // Use same error message for email and password failures (security best practice)
            return LoginResult.CreateAuthError("Invalid credentials");
        }

        // Generate access token (1-hour expiry)
        var accessToken = _tokenService.GenerateAccessToken(user);

        // Generate refresh token (for 7-day expiry)
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Update user with refresh token and expiry
        var refreshTokenExpirationDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);
        user.UpdatedAt = DateTime.UtcNow;

        // Persist refresh token to database
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation("User logged in successfully. UserId: {UserId}, Email: {Email}", user.Id, user.Email);

        return LoginResult.CreateSuccess(user, accessToken, refreshToken);
    }

    /// <inheritdoc />
    public async Task<LoginResult> RefreshTokenAsync(string refreshToken)
    {
        // Defensive validation
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return LoginResult.CreateValidationError("Refresh token is required");
        }

        // Find user by refresh token
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
        if (user == null)
        {
            _logger.LogWarning("Refresh failed - token not found in database");
            return LoginResult.CreateAuthError("Invalid or expired refresh token");
        }

        // Check expiry
        if (user.RefreshTokenExpiresAt == null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh failed - token expired for user: {UserId}", user.Id);
            return LoginResult.CreateAuthError("Invalid or expired refresh token");
        }

        // Validate refresh token is not null before comparison (fail fast for edge cases)
        if (string.IsNullOrEmpty(user.RefreshToken))
        {
            _logger.LogWarning("Refresh failed - stored token is null for user: {UserId}", user.Id);
            return LoginResult.CreateAuthError("Invalid or expired refresh token");
        }

        // Validate refresh token matches using constant-time comparison (security hardening against timing attacks)
        // Using CryptographicOperations.FixedTimeEquals prevents attackers from inferring token values
        // by measuring response times for different input prefixes
        var storedTokenBytes = Encoding.UTF8.GetBytes(user.RefreshToken);
        var providedTokenBytes = Encoding.UTF8.GetBytes(refreshToken);
        if (!CryptographicOperations.FixedTimeEquals(storedTokenBytes, providedTokenBytes))
        {
            _logger.LogWarning("Refresh failed - token mismatch for user: {UserId}", user.Id);
            return LoginResult.CreateAuthError("Invalid or expired refresh token");
        }

        // Generate new access token
        var newAccessToken = _tokenService.GenerateAccessToken(user);

        _logger.LogInformation("Token refreshed successfully for user: {UserId}, Email: {Email}", user.Id, user.Email);

        // Return success with new access token (null refresh token = no rotation)
        return LoginResult.CreateSuccess(user, newAccessToken, null);
    }

    /// <inheritdoc />
    public async Task LogoutAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiresAt = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User logged out successfully. UserId: {UserId}, Email: {Email}", user.Id, user.Email);
        }
        else
        {
            _logger.LogWarning("Logout attempted for non-existent user: {UserId}", userId);
        }
    }
}
