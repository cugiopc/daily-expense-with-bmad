namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Request DTO for creating or updating a monthly budget.
/// Month defaults to current month if not provided. Amount must be positive.
/// </summary>
public class CreateBudgetRequest
{
    /// <summary>
    /// Month for which this budget applies (first day of month, e.g., 2026-01-01).
    /// Defaults to current month if not provided.
    /// IMPORTANT: Will be normalized to first day of month in controller (defensive programming).
    /// Example: If user sends 2026-01-15, it will be normalized to 2026-01-01.
    /// </summary>
    public DateTime Month { get; set; }

    /// <summary>
    /// Budget amount in VND. Must be greater than 0.
    /// Stored as DECIMAL(18,2) in database (max: 9,999,999,999,999,999.99).
    /// Higher precision than Expense to support large savings goals.
    /// Example: 15000000 (15 million VND)
    /// </summary>
    public decimal Amount { get; set; }
}
