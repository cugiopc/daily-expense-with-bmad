using DailyExpenses.Api.Data;
using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Models;
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
    private readonly IValidator<CreateExpenseRequest> _validator;
    private readonly ILogger<ExpenseController> _logger;

    public ExpenseController(
        AppDbContext context,
        IValidator<CreateExpenseRequest> validator,
        ILogger<ExpenseController> logger)
    {
        _context = context;
        _validator = validator;
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
        var validationResult = await _validator.ValidateAsync(request);
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

        // Default Date to today (UTC) if not provided
        var expenseDate = request.Date ?? DateTime.UtcNow.Date;

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

        // Return 201 Created with Location header
        return CreatedAtAction(
            nameof(GetExpenseById),
            new { id = expense.Id },
            response);
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
        var now = DateTime.UtcNow;
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
