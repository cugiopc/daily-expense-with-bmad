using DailyExpenses.Api.Models;

namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Result object for user registration operations.
/// Encapsulates success/failure state with appropriate data.
/// </summary>
/// <param name="Success">True if registration succeeded, false otherwise.</param>
/// <param name="User">The created User object if successful, null otherwise.</param>
/// <param name="ErrorMessage">Error message if failed (e.g., "Email already registered"), null on success.</param>
/// <param name="ValidationError">Validation error message if input validation failed (e.g., "Email cannot be empty"), null otherwise.</param>
public record RegistrationResult(
    bool Success,
    User? User,
    string? ErrorMessage,
    string? ValidationError)
{
    /// <summary>
    /// Indicates whether the registration failed due to validation error.
    /// </summary>
    public bool HasValidationError => !Success && ValidationError != null;

    /// <summary>
    /// Indicates whether the registration failed due to business logic error (e.g., duplicate email).
    /// </summary>
    public bool HasBusinessError => !Success && ErrorMessage != null && ValidationError == null;

    /// <summary>
    /// Creates a successful registration result.
    /// </summary>
    public static RegistrationResult CreateSuccess(User user) =>
        new(Success: true, User: user, ErrorMessage: null, ValidationError: null);

    /// <summary>
    /// Creates a validation error result.
    /// </summary>
    public static RegistrationResult CreateValidationError(string validationError) =>
        new(Success: false, User: null, ErrorMessage: null, ValidationError: validationError);

    /// <summary>
    /// Creates a business logic error result (e.g., email already exists).
    /// </summary>
    public static RegistrationResult CreateBusinessError(string errorMessage) =>
        new(Success: false, User: null, ErrorMessage: errorMessage, ValidationError: null);
}
