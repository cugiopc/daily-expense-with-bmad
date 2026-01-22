namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Request model for syncing offline-created expenses
/// Represents a single offline expense to be synced to server
/// </summary>
public class SyncExpenseRequest
{
    /// <summary>
    /// Temporary UUID generated on client-side when expense was created offline
    /// Used to map back to server-generated ID in response
    /// </summary>
    public required string TempId { get; set; }

    /// <summary>
    /// Expense amount (VND). Must be positive and less than 1 billion.
    /// </summary>
    public required decimal Amount { get; set; }

    /// <summary>
    /// Optional note describing the expense (max 500 characters)
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Date of the expense (YYYY-MM-DD format)
    /// </summary>
    public required DateTime Date { get; set; }

    /// <summary>
    /// Client-side timestamp when expense was created offline
    /// Used for Last-Write-Wins conflict resolution
    /// </summary>
    public required DateTime CreatedAt { get; set; }
}
