namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Internal model for refresh token information.
/// Used for token refresh flow (Story 1.5+).
/// </summary>
public record RefreshTokenInfo
{
    /// <summary>
    /// The refresh token string (Base64-encoded 64-byte random value).
    /// </summary>
    public required string Token { get; init; }

    /// <summary>
    /// UTC timestamp when the refresh token expires (7 days from creation).
    /// </summary>
    public required DateTime ExpiresAt { get; init; }

    /// <summary>
    /// User ID associated with this refresh token.
    /// </summary>
    public required Guid UserId { get; init; }
}
