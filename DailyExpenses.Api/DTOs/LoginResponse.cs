namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Response model for successful user login.
/// Contains only the access token - refresh token is sent via httpOnly cookie.
/// </summary>
public record LoginResponse
{
    /// <summary>
    /// JWT access token with 1-hour expiry.
    /// Client should store in memory (NOT localStorage) and send via Authorization header.
    /// </summary>
    public required string AccessToken { get; init; }

    /// <summary>
    /// Optional: Expiration timestamp for the refresh token (UTC).
    /// Clients can use this to implement intelligent token refresh scheduling
    /// or display session expiry information to users.
    /// Only populated on login, not on token refresh (refresh doesn't rotate tokens).
    /// </summary>
    public DateTime? RefreshTokenExpiresAt { get; init; }
}
