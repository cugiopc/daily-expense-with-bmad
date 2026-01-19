namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Request DTO for creating a new expense.
/// Amount is required and must be positive. Date defaults to today if not provided.
/// </summary>
public class CreateExpenseRequest
{
    /// <summary>
    /// Expense amount in VND. Must be greater than 0.
    /// Stored as DECIMAL(10,2) in database (max: 99,999,999.99).
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Optional note describing the expense (max 500 characters).
    /// Will be sanitized to prevent XSS attacks.
    /// Examples: "cafe", "lunch with team", "taxi to office"
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Date of the expense (optional).
    /// Defaults to today (UTC date) if not provided.
    /// Cannot be in the future.
    /// </summary>
    public DateTime? Date { get; set; }
}
