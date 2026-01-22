namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Request DTO for updating an existing expense.
/// All fields are required for a complete update.
/// </summary>
public class UpdateExpenseRequest
{
    /// <summary>
    /// Updated expense amount in VND. Must be greater than 0.
    /// Stored as DECIMAL(10,2) in database (max: 99,999,999.99).
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Updated note describing the expense (max 500 characters).
    /// Will be sanitized to prevent XSS attacks.
    /// Examples: "cafe", "lunch with team", "taxi to office"
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Updated date of the expense.
    /// Cannot be in the future.
    /// </summary>
    public DateTime Date { get; set; }
}
