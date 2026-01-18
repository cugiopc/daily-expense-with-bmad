using System.Security.Claims;
using DailyExpenses.Api.Models;

namespace DailyExpenses.Api.Services;

/// <summary>
/// Service for generating and validating JWT access and refresh tokens.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a JWT access token for the specified user.
    /// Token includes userId and email claims with 1-hour expiry.
    /// </summary>
    /// <param name="user">User to generate token for</param>
    /// <returns>JWT access token string</returns>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Generates a secure random refresh token.
    /// Token is a 64-byte Base64 string for database storage.
    /// </summary>
    /// <returns>Refresh token string</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates a JWT access token and returns claims if valid.
    /// Checks signature, issuer, audience, and expiry.
    /// </summary>
    /// <param name="token">JWT token to validate</param>
    /// <returns>ClaimsPrincipal if valid, null if invalid</returns>
    ClaimsPrincipal? ValidateAccessToken(string token);
}
