using DailyExpenses.Api.Data;
using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DailyExpenses.Api.Controllers;

/// <summary>
/// Controller for budget management operations.
/// All endpoints require JWT authentication.
/// Implements UPSERT pattern: create if not exists, update if exists for a given month.
/// </summary>
[ApiController]
[Route("api/budgets")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IValidator<CreateBudgetRequest> _validator;
    private readonly ILogger<BudgetsController> _logger;

    public BudgetsController(
        AppDbContext context,
        IValidator<CreateBudgetRequest> validator,
        ILogger<BudgetsController> logger)
    {
        _context = context;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new budget or updates existing budget for the authenticated user (UPSERT pattern).
    /// If a budget already exists for the given month, it will be updated.
    /// Security: userId extracted from JWT token - never trusts client-provided user ID.
    /// </summary>
    /// <param name="request">Budget creation request with month and amount.</param>
    /// <returns>
    /// 201 Created: Budget created successfully (new budget)
    /// 200 OK: Budget updated successfully (existing budget)
    /// 400 Bad Request: Validation failed (amount <= 0 or month not first day)
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpPost]
    public async Task<ActionResult<BudgetResponse>> CreateBudget([FromBody] CreateBudgetRequest request)
    {
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

        // Normalize month to first day of month (defensive programming)
        var normalizedMonth = new DateTime(request.Month.Year, request.Month.Month, 1);
        request.Month = normalizedMonth;

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

        // Check if budget already exists for (userId, month) - UPSERT logic
        var existingBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Month == normalizedMonth);

        BudgetResponse response;
        bool isUpdate = false;

        if (existingBudget != null)
        {
            // Update existing budget
            existingBudget.Amount = request.Amount;
            await _context.SaveChangesAsync();

            isUpdate = true;

            _logger.LogInformation(
                "Budget updated: Id={BudgetId}, UserId={UserId}, Month={Month}, Amount={Amount}",
                existingBudget.Id, existingBudget.UserId, existingBudget.Month, existingBudget.Amount);

            response = new BudgetResponse
            {
                Id = existingBudget.Id,
                UserId = existingBudget.UserId,
                Month = existingBudget.Month,
                Amount = existingBudget.Amount,
                CreatedAt = existingBudget.CreatedAt
            };
        }
        else
        {
            // Create new budget
            var budget = new Budget
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Month = normalizedMonth,
                Amount = request.Amount,
                CreatedAt = DateTime.UtcNow
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Budget created: Id={BudgetId}, UserId={UserId}, Month={Month}, Amount={Amount}",
                budget.Id, budget.UserId, budget.Month, budget.Amount);

            response = new BudgetResponse
            {
                Id = budget.Id,
                UserId = budget.UserId,
                Month = budget.Month,
                Amount = budget.Amount,
                CreatedAt = budget.CreatedAt
            };
        }

        // Return 200 OK for update, 201 Created for new budget
        if (isUpdate)
        {
            return Ok(ApiResponse<BudgetResponse>.SuccessResult(response));
        }
        else
        {
            return CreatedAtAction(
                nameof(GetBudgetById),
                new { id = response.Id },
                ApiResponse<BudgetResponse>.SuccessResult(response));
        }
    }

    /// <summary>
    /// Gets all budgets for the authenticated user, ordered by month descending.
    /// Security: Returns only budgets owned by authenticated user.
    /// </summary>
    /// <returns>
    /// 200 OK: List of budgets for the user
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpGet]
    public async Task<IActionResult> GetBudgets()
    {
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

        var budgets = await _context.Budgets
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.Month)
            .Select(b => new BudgetResponse
            {
                Id = b.Id,
                UserId = b.UserId,
                Month = b.Month,
                Amount = b.Amount,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        _logger.LogInformation(
            "Budgets retrieved: UserId={UserId}, Count={Count}",
            userId, budgets.Count);

        return Ok(ApiResponse<List<BudgetResponse>>.SuccessResult(budgets));
    }

    /// <summary>
    /// Gets the budget for the current month for the authenticated user.
    /// Security: Returns only budget owned by authenticated user.
    /// </summary>
    /// <returns>
    /// 200 OK: Budget for current month
    /// 404 Not Found: No budget set for current month
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpGet("current")]
    public async Task<ActionResult<BudgetResponse>> GetCurrentBudget()
    {
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

        // Calculate first day of current month
        var now = DateTime.UtcNow;
        var currentMonth = new DateTime(now.Year, now.Month, 1);

        // Query budget for current month
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Month == currentMonth);

        if (budget == null)
        {
            return NotFound(ApiResponse<object>.ErrorResult(new
            {
                Message = "No budget set for current month",
                Code = "NOT_FOUND"
            }));
        }

        var response = new BudgetResponse
        {
            Id = budget.Id,
            UserId = budget.UserId,
            Month = budget.Month,
            Amount = budget.Amount,
            CreatedAt = budget.CreatedAt
        };

        _logger.LogInformation(
            "Current budget retrieved: UserId={UserId}, Month={Month}, Amount={Amount}",
            userId, budget.Month, budget.Amount);

        return Ok(ApiResponse<BudgetResponse>.SuccessResult(response));
    }

    /// <summary>
    /// Gets a single budget by ID for the authenticated user.
    /// Security: Filters by both ID and userId to prevent accessing other users' budgets.
    /// </summary>
    /// <param name="id">ID of the budget to retrieve</param>
    /// <returns>
    /// 200 OK: Budget details
    /// 404 Not Found: Budget not found or not owned by user
    /// 401 Unauthorized: Missing or invalid JWT token
    /// </returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetResponse>> GetBudgetById(Guid id)
    {
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

        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (budget == null)
        {
            return NotFound(ApiResponse<object>.ErrorResult(new
            {
                Message = "Budget not found",
                Code = "NOT_FOUND"
            }));
        }

        var response = new BudgetResponse
        {
            Id = budget.Id,
            UserId = budget.UserId,
            Month = budget.Month,
            Amount = budget.Amount,
            CreatedAt = budget.CreatedAt
        };

        _logger.LogInformation(
            "Budget retrieved: Id={BudgetId}, UserId={UserId}, Month={Month}",
            budget.Id, budget.UserId, budget.Month);

        return Ok(ApiResponse<BudgetResponse>.SuccessResult(response));
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
