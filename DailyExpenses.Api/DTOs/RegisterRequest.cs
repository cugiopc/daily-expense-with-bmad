namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Request DTO for user registration.
/// Contains email and password for creating a new user account.
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// User's email address (must be unique and valid format).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password (minimum 8 characters, will be hashed with BCrypt).
    /// </summary>
    public string Password { get; set; } = string.Empty;
}
