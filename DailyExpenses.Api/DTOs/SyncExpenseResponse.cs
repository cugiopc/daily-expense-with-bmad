namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Response model for bulk expense sync operation
/// Contains mapping of temporary client IDs to server-generated IDs
/// </summary>
public class SyncExpenseResponse
{
    /// <summary>
    /// List of successfully synced expenses with ID mapping
    /// </summary>
    public required List<SyncedExpenseMapping> Synced { get; set; }
}

/// <summary>
/// Represents the mapping between client-side temporary ID and server-side generated ID
/// </summary>
public class SyncedExpenseMapping
{
    /// <summary>
    /// Temporary UUID that was generated on client-side
    /// </summary>
    public required string TempId { get; set; }

    /// <summary>
    /// Server-generated Guid ID for the expense
    /// </summary>
    public required Guid ServerId { get; set; }
}
