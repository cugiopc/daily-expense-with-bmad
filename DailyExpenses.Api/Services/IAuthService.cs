using DailyExpenses.Api.DTOs;

namespace DailyExpenses.Api.Services;

/// <summary>
/// Service interface for authentication operations (registration, login, token refresh).
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user with email and password.
    /// </summary>
    /// <param name="email">User's email address (must be unique).</param>
    /// <param name="password">User's password (will be hashed with BCrypt).</param>
    /// <returns>
    /// RegistrationResult containing:
    /// - Success: True if registration succeeded
    /// - User: The created User object if successful
    /// - ErrorMessage: Error message for business logic failures (e.g., email exists)
    /// - ValidationError: Error message for validation failures (e.g., empty email)
    /// </returns>
    Task<RegistrationResult> RegisterAsync(string email, string password);

    /// <summary>
    /// Authenticates a user with email and password, generating JWT access and refresh tokens.
    /// </summary>
    /// <param name="email">User's email address.</param>
    /// <param name="password">User's plain text password.</param>
    /// <returns>
    /// LoginResult containing:
    /// - Success: True if login succeeded
    /// - User: The authenticated User object if successful
    /// - AccessToken: JWT access token (1-hour expiry)
    /// - RefreshToken: Refresh token (7-day expiry) for httpOnly cookie
    /// - ErrorMessage: Error message if login failed
    /// - ValidationError: True for validation errors (400), false for auth errors (401)
    /// </returns>
    Task<LoginResult> LoginAsync(string email, string password);

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token from httpOnly cookie.</param>
    /// <returns>
    /// LoginResult containing:
    /// - Success: True if refresh succeeded
    /// - AccessToken: New JWT access token (1-hour expiry)
    /// - RefreshToken: null (not rotating refresh tokens in this story)
    /// - ErrorMessage: Error message if refresh failed
    /// - ValidationError: True for validation errors, false for auth errors (invalid/expired token)
    /// </returns>
    Task<LoginResult> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Logs out a user by clearing their refresh token from the database.
    /// </summary>
    /// <param name="userId">The ID of the user to log out.</param>
    /// <returns>Task representing the logout operation.</returns>
    Task LogoutAsync(Guid userId);
}
