namespace DailyExpenses.Api.Models;

/// <summary>
/// Expense entity representing user's daily expenses.
/// Maps to 'expenses' table in PostgreSQL database.
/// Core domain model for Epic 2: Ultra-Fast Expense Tracking.
/// </summary>
public class Expense
{
    /// <summary>
    /// Unique identifier for the expense (UUID).
    /// Maps to 'id' column with database-generated UUID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to User entity (owner of this expense).
    /// Maps to 'user_id' column.
    /// Indexed as part of composite index (user_id, date DESC) for fast queries.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Expense amount in currency (DECIMAL 10,2 precision).
    /// Maps to 'amount' column.
    /// Must be positive value (validated at API layer).
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Optional note describing the expense.
    /// Maps to 'note' column (TEXT).
    /// Free-text field - sanitized at API layer for security.
    /// Used for category auto-detection in Story 5.1.
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Date of the expense (DATE column, no time component).
    /// Maps to 'date' column.
    /// Indexed as part of composite index (user_id, date DESC) for newest-first queries.
    /// Used for daily/monthly aggregations (NFR6: &lt;50ms performance).
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// UTC timestamp when expense was created.
    /// Maps to 'created_at' column (TIMESTAMPTZ).
    /// Indexed as part of (user_id, created_at DESC) for recent notes quick selection.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UTC timestamp when expense was last updated.
    /// Maps to 'updated_at' column (TIMESTAMPTZ).
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Navigation property to User entity (owner).
    /// Configured with CASCADE delete: deleting user deletes their expenses.
    /// </summary>
    public User User { get; set; } = null!;
}
