using System.ComponentModel.DataAnnotations;

namespace DailyExpenses.Api.Models;

/// <summary>
/// Budget entity representing monthly budget settings for users.
/// Maps to 'budgets' table in PostgreSQL database.
/// Core domain model for Epic 3: Budget Management & Alerts.
/// </summary>
public class Budget
{
    /// <summary>
    /// Unique identifier for the budget (UUID).
    /// Maps to 'id' column with database-generated UUID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to User entity (owner of this budget).
    /// Maps to 'user_id' column.
    /// Part of unique constraint (user_id, month) - one budget per user per month.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Month for which this budget applies (first day of month, e.g., 2026-01-01).
    /// Maps to 'month' column (DATE type).
    /// IMPORTANT: Always stores first day of month for consistent querying and unique constraint.
    /// Example: For January 2026 budget, this value is DateTime(2026, 1, 1).
    /// Part of unique constraint (user_id, month) - prevents duplicate budgets for same month.
    /// </summary>
    public DateTime Month { get; set; }

    /// <summary>
    /// Budget amount in currency (DECIMAL 18,2 precision).
    /// Maps to 'amount' column.
    /// Must be positive value (validated at API layer with check constraint).
    /// Higher precision than Expense (18,2 vs 10,2) to support large savings goals.
    /// </summary>
    [Range(0.01, double.MaxValue, ErrorMessage = "Budget amount must be greater than zero.")]
    public decimal Amount { get; set; }

    /// <summary>
    /// UTC timestamp when budget was created.
    /// Maps to 'created_at' column (TIMESTAMPTZ).
    /// Auto-set to CURRENT_TIMESTAMP on insertion.
    /// Immutable - never updated after creation.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Navigation property to User entity (owner).
    /// Configured with CASCADE delete: deleting user deletes their budgets.
    /// </summary>
    public User User { get; set; } = null!;
}
