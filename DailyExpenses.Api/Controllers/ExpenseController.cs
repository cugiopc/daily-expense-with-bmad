using DailyExpenses.Api.Data;
using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Models;
using DailyExpenses.Api.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;

namespace DailyExpenses.Api.Controllers;

/// <summary>
/// Controller for expense management operations.
/// All endpoints require JWT authentication.
/// </summary>
[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IValidator<CreateExpenseRequest> _createValidator;
    private readonly IValidator<UpdateExpenseRequest> _updateValidator;
    private readonly IValidator<SyncExpenseRequest> _syncValidator;
    private readonly ILogger<ExpenseController> _logger;

    public ExpenseController(
        AppDbContext context,
        IValidator<CreateExpenseRequest> createValidator,
        IValidator<UpdateExpenseRequest> updateValidator,
        IValidator<SyncExpenseRequest> syncValidator,
        ILogger<ExpenseController> logger)
    {
        _context = context;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _syncValidator = syncValidator;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new expense for the authenticated user.
    /// </summary>
    /// <param name="request">Expense creation request with amount, note, and optional date.</param>
    /// <returns>
    /// 201 Created: Expense created successfully with Location header
    /// 400 Bad Request: Validation failed (amount <= 0, note too long, or date in future)
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpPost]
    public async Task<ActionResult<ExpenseResponse>> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        // Validate request with FluentValidation
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Validation failed",
                Code = "VALIDATION_ERROR",
                Errors = errors
            }));
        }

        // Extract userId from JWT token claims
        var userIdResult = GetUserIdFromToken();
        if (userIdResult == null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(new
            {
                Message = "User ID not found in token",
                Code = "INVALID_TOKEN"
            }));
        }
        var userId = userIdResult.Value;

        // Sanitize Note field to prevent XSS attacks
        var sanitizedNote = string.IsNullOrWhiteSpace(request.Note)
            ? null
            : WebUtility.HtmlEncode(request.Note.Trim());

        // Default Date to today (local timezone) if not provided  
        var expenseDate = request.Date?.Date ?? DateTime.Now.Date;

        // Create new Expense entity
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = request.Amount,
            Note = sanitizedNote,
            Date = expenseDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Save to database
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Expense created: Id={ExpenseId}, UserId={UserId}, Amount={Amount}, Date={Date}",
            expense.Id, expense.UserId, expense.Amount, expense.Date);

        // Build response
        var response = new ExpenseResponse
        {
            Id = expense.Id,
            UserId = expense.UserId,
            Amount = expense.Amount,
            Note = expense.Note,
            Date = expense.Date,
            CreatedAt = expense.CreatedAt,
            UpdatedAt = expense.UpdatedAt
        };

        // Return 201 Created with Location header and ApiResponse wrapper
        return CreatedAtAction(
            nameof(GetExpenseById),
            new { id = expense.Id },
            ApiResponse<ExpenseResponse>.SuccessResult(response));
    }

    /// <summary>
    /// Gets a list of expenses for the authenticated user, filtered by date range.
    /// If no date range is provided, defaults to the current month.
    /// </summary>
    /// <param name="startDate">Start date of the range (inclusive). Defaults to first day of current month if not provided.</param>
    /// <param name="endDate">End date of the range (inclusive). Defaults to last day of current month if not provided.</param>
    /// <returns>
    /// 200 OK: List of expenses filtered by date range, ordered by date DESC then createdAt DESC
    /// 400 Bad Request: Invalid date range (startDate > endDate)
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpGet]
    public async Task<IActionResult> GetExpenses(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        // Extract userId from JWT token claims
        var userIdResult = GetUserIdFromToken();
        if (userIdResult == null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(new
            {
                Message = "User ID not found in token",
                Code = "INVALID_TOKEN"
            }));
        }
        var userId = userIdResult.Value;

        // Default to current month if no dates provided
        // Normalize all dates to day boundaries (00:00:00) for consistent date-only comparisons
        var now = DateTime.Now; // Use local time instead of UTC
        var effectiveStartDate = (startDate?.Date ?? new DateTime(now.Year, now.Month, 1));
        var effectiveEndDate = (endDate?.Date ?? effectiveStartDate.AddMonths(1).AddDays(-1));

        // Validate date range
        if (effectiveStartDate > effectiveEndDate)
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Invalid date range: startDate must be less than or equal to endDate",
                Code = "INVALID_DATE_RANGE"
            }));
        }

        // Query expenses with optimized database query
        // Filter by UserId first to leverage (UserId, Date) index
        // Project to DTO in database query for memory efficiency (avoids double materialization)
        var response = await _context.Expenses
            .Where(e => e.UserId == userId)
            .Where(e => e.Date >= effectiveStartDate && e.Date <= effectiveEndDate)
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                UserId = e.UserId,
                Amount = e.Amount,
                Note = e.Note,
                Date = e.Date,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .ToListAsync();

        _logger.LogInformation(
            "Expenses retrieved: UserId={UserId}, StartDate={StartDate}, EndDate={EndDate}, Count={Count}",
            userId, effectiveStartDate, effectiveEndDate, response.Count);

        return Ok(ApiResponse<List<ExpenseResponse>>.SuccessResult(response));
    }

    /// <summary>
    /// Gets a single expense by ID (placeholder for future implementation).
    /// This endpoint is referenced by CreatedAtAction in CreateExpense.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseResponse>> GetExpenseById(Guid id)
    {
        // TODO: Implement in Story 2.3
        return NotFound(new { Message = "Endpoint not yet implemented. Coming in Story 2.3." });
    }

    /// <summary>
    /// Updates an existing expense for the authenticated user.
    /// </summary>
    /// <param name="id">ID of the expense to update</param>
    /// <param name="request">Updated expense data (amount, note, date)</param>
    /// <returns>
    /// 200 OK: Expense updated successfully
    /// 400 Bad Request: Validation failed (amount <= 0, note too long, or date in future)
    /// 401 Unauthorized: Missing or invalid JWT token
    /// 403 Forbidden: User is not the owner of this expense
    /// 404 Not Found: Expense with given ID does not exist
    /// </returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseResponse>> UpdateExpense(Guid id, [FromBody] UpdateExpenseRequest request)
    {
        // Validate request with FluentValidation
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Validation failed",
                Code = "VALIDATION_ERROR",
                Errors = errors
            }));
        }

        // Extract userId from JWT token claims
        var userIdResult = GetUserIdFromToken();
        if (userIdResult == null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(new
            {
                Message = "User ID not found in token",
                Code = "INVALID_TOKEN"
            }));
        }
        var userId = userIdResult.Value;

        // Find existing expense
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(ApiResponse<object>.ErrorResult(new
            {
                Message = "Expense not found",
                Code = "NOT_FOUND"
            }));
        }

        // Authorization check: only owner can edit
        if (expense.UserId != userId)
        {
            _logger.LogWarning(
                "Forbidden: User {RequestUserId} attempted to edit expense {ExpenseId} owned by {OwnerUserId}",
                userId, id, expense.UserId);

            return Forbid();
        }

        // Sanitize Note field to prevent XSS attacks
        var sanitizedNote = string.IsNullOrWhiteSpace(request.Note)
            ? null
            : WebUtility.HtmlEncode(request.Note.Trim());

        // Update expense fields
        expense.Amount = request.Amount;
        expense.Note = sanitizedNote;
        expense.Date = request.Date.Date; // Normalize to date only
        expense.UpdatedAt = DateTime.UtcNow;

        // Save changes to database
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Expense updated: Id={ExpenseId}, UserId={UserId}, Amount={Amount}, Date={Date}",
            expense.Id, expense.UserId, expense.Amount, expense.Date);

        // Build response
        var response = new ExpenseResponse
        {
            Id = expense.Id,
            UserId = expense.UserId,
            Amount = expense.Amount,
            Note = expense.Note,
            Date = expense.Date,
            CreatedAt = expense.CreatedAt,
            UpdatedAt = expense.UpdatedAt
        };

        return Ok(ApiResponse<ExpenseResponse>.SuccessResult(response));
    }

    /// <summary>
    /// Deletes an expense by ID for the authenticated user.
    /// </summary>
    /// <param name="id">ID of the expense to delete</param>
    /// <returns>
    /// 200 OK: Expense deleted successfully
    /// 401 Unauthorized: Missing or invalid JWT token
    /// 403 Forbidden: User is not the owner of this expense
    /// 404 Not Found: Expense with given ID does not exist
    /// </returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(Guid id)
    {
        // Extract userId from JWT token claims
        var userIdResult = GetUserIdFromToken();
        if (userIdResult == null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(new
            {
                Message = "User ID not found in token",
                Code = "INVALID_TOKEN"
            }));
        }
        var userId = userIdResult.Value;

        // Find existing expense
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(ApiResponse<object>.ErrorResult(new
            {
                Message = "Expense not found",
                Code = "NOT_FOUND"
            }));
        }

        // Authorization check: only owner can delete
        if (expense.UserId != userId)
        {
            _logger.LogWarning(
                "Forbidden: User {RequestUserId} attempted to delete expense {ExpenseId} owned by {OwnerUserId}",
                userId, id, expense.UserId);

            return Forbid();
        }

        // Delete from database
        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Expense deleted: Id={ExpenseId}, UserId={UserId}, Amount={Amount}",
            expense.Id, expense.UserId, expense.Amount);

        // Return 200 OK with success message
        return Ok(ApiResponse<object>.SuccessResult(new
        {
            Message = "Expense deleted successfully",
            DeletedId = id
        }));
    }

    /// <summary>
    /// Syncs multiple offline-created expenses to the server in a batch.
    /// Used for offline-first functionality with IndexedDB.
    /// </summary>
    /// <param name="requests">Array of offline expenses to sync</param>
    /// <returns>
    /// 200 OK: All expenses synced successfully with temp ID to server ID mapping
    /// 400 Bad Request: Validation failed for one or more expenses
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpPost("sync")]
    public async Task<ActionResult<SyncExpenseResponse>> SyncExpenses([FromBody] List<SyncExpenseRequest> requests)
    {
        // Validate that at least one expense is provided
        if (requests == null || !requests.Any())
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "At least one expense is required for sync",
                Code = "EMPTY_SYNC_BATCH"
            }));
        }

        // Extract userId from JWT token claims
        var userIdResult = GetUserIdFromToken();
        if (userIdResult == null)
        {
            return Unauthorized(ApiResponse<object>.ErrorResult(new
            {
                Message = "User ID not found in token",
                Code = "INVALID_TOKEN"
            }));
        }
        var userId = userIdResult.Value;

        // Validate all expenses in batch
        var allErrors = new Dictionary<string, string[]>();
        for (int i = 0; i < requests.Count; i++)
        {
            var validationResult = await _syncValidator.ValidateAsync(requests[i]);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToArray();
                allErrors[$"[{i}] {requests[i].TempId}"] = errors;
            }
        }

        // Return validation errors if any
        if (allErrors.Any())
        {
            return BadRequest(ApiResponse<object>.ErrorResult(new
            {
                Message = "Validation failed for one or more expenses",
                Code = "BATCH_VALIDATION_ERROR",
                Errors = allErrors
            }));
        }

        // Create expense entities and track mappings
        var syncedMappings = new List<SyncedExpenseMapping>();
        var expenses = new List<Expense>();

        foreach (var request in requests)
        {
            // Sanitize Note field to prevent XSS attacks
            var sanitizedNote = string.IsNullOrWhiteSpace(request.Note)
                ? null
                : WebUtility.HtmlEncode(request.Note.Trim());

            // Create new Expense entity with server-generated ID
            var serverId = Guid.NewGuid();
            var expense = new Expense
            {
                Id = serverId,
                UserId = userId,
                Amount = request.Amount,
                Note = sanitizedNote,
                Date = request.Date.Date, // Normalize to date only
                CreatedAt = request.CreatedAt, // Use client timestamp for Last-Write-Wins
                UpdatedAt = DateTime.UtcNow
            };

            expenses.Add(expense);

            // Track mapping
            syncedMappings.Add(new SyncedExpenseMapping
            {
                TempId = request.TempId,
                ServerId = serverId
            });
        }

        // Bulk insert expenses
        _context.Expenses.AddRange(expenses);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Sync completed: UserId={UserId}, BatchSize={BatchSize}, TotalAmount={TotalAmount}",
            userId, expenses.Count, expenses.Sum(e => e.Amount));

        // Build response with ID mappings
        var response = new SyncExpenseResponse
        {
            Synced = syncedMappings
        };

        return Ok(ApiResponse<SyncExpenseResponse>.SuccessResult(response));
    }

    /// <summary>
    /// Extracts user ID from JWT token claims.
    /// </summary>
    /// <returns>User ID as Guid, or null if not found or invalid</returns>
    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            _logger.LogWarning("User ID not found in JWT token claims");
            return null;
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("Invalid user ID format in JWT token: {UserIdClaim}", userIdClaim);
            return null;
        }

        return userId;
    }
}
