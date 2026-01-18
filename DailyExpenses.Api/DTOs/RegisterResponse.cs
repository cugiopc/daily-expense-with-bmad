namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Response DTO for successful user registration.
/// Contains user ID and email (no password or hash).
/// </summary>
public class RegisterResponse
{
    /// <summary>
    /// Unique identifier for the newly created user.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's registered email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;
}
