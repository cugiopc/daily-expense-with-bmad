using DailyExpenses.Api.Models;

namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Result object for login operation, containing user, tokens, and error information.
/// Uses factory pattern to create success or error results.
/// </summary>
public record LoginResult
{
    /// <summary>
    /// Indicates whether the login operation succeeded.
    /// </summary>
    public required bool Success { get; init; }

    /// <summary>
    /// The authenticated user (null if login failed).
    /// </summary>
    public User? User { get; init; }

    /// <summary>
    /// JWT access token (null if login failed).
    /// </summary>
    public string? AccessToken { get; init; }

    /// <summary>
    /// Refresh token for obtaining new access tokens (null if login failed).
    /// </summary>
    public string? RefreshToken { get; init; }

    /// <summary>
    /// Error message if login failed (null if successful).
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Indicates whether the error is a validation error (400) or authentication error (401).
    /// </summary>
    public required bool ValidationError { get; init; }

    /// <summary>
    /// Convenience property to check if error is a validation error.
    /// </summary>
    public bool HasValidationError => !Success && ValidationError;

    /// <summary>
    /// Convenience property to check if error is an authentication error.
    /// </summary>
    public bool HasAuthError => !Success && !ValidationError;

    /// <summary>
    /// Creates a successful login result with user and tokens.
    /// </summary>
    public static LoginResult CreateSuccess(User user, string accessToken, string? refreshToken)
    {
        return new LoginResult
        {
            Success = true,
            User = user,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ValidationError = false
        };
    }

    /// <summary>
    /// Creates a validation error result (400 Bad Request).
    /// </summary>
    public static LoginResult CreateValidationError(string message)
    {
        return new LoginResult
        {
            Success = false,
            ErrorMessage = message,
            ValidationError = true
        };
    }

    /// <summary>
    /// Creates an authentication error result (401 Unauthorized).
    /// </summary>
    public static LoginResult CreateAuthError(string message)
    {
        return new LoginResult
        {
            Success = false,
            ErrorMessage = message,
            ValidationError = false
        };
    }
}
