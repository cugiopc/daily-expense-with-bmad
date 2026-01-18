namespace DailyExpenses.Api.Models;

/// <summary>
/// User entity representing registered users in the system.
/// Maps to 'users' table in PostgreSQL database.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user (UUID).
    /// Maps to 'user_id' column with database-generated UUID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's email address (unique, used for login).
    /// Maps to 'email' column.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// BCrypt hashed password (never store plain text).
    /// Maps to 'password_hash' column.
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token for JWT authentication (Base64 string, 64 bytes).
    /// Maps to 'refresh_token' column.
    /// Null if user has never logged in or token has been revoked.
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// UTC timestamp when the refresh token expires (7 days from creation).
    /// Maps to 'refresh_token_expires_at' column (TIMESTAMPTZ).
    /// Null if no refresh token is set.
    /// </summary>
    public DateTime? RefreshTokenExpiresAt { get; set; }

    /// <summary>
    /// UTC timestamp when user was created.
    /// Maps to 'created_at' column (TIMESTAMPTZ).
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UTC timestamp when user was last updated.
    /// Maps to 'updated_at' column (TIMESTAMPTZ).
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
