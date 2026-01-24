using DailyExpenses.Api.DTOs;
using FluentValidation;

namespace DailyExpenses.Api.Validators;

/// <summary>
/// Validator for CreateBudgetRequest to ensure amount and month meet requirements.
/// Enforces business rules: amount > 0, max 2 decimal places, month is first day of month.
/// </summary>
public class CreateBudgetRequestValidator : AbstractValidator<CreateBudgetRequest>
{
    public CreateBudgetRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Budget amount must be greater than 0")
            .PrecisionScale(18, 2, false)
            .WithMessage("Budget amount must have at most 2 decimal places");

        RuleFor(x => x.Month)
            .Must(BeFirstDayOfMonth)
            .WithMessage("Month must be the first day of the month (e.g., 2026-01-01)")
            .When(x => x.Month != default);
    }

    /// <summary>
    /// Validates that the month is the first day of the month.
    /// This ensures consistency in database unique constraint and querying.
    /// </summary>
    private bool BeFirstDayOfMonth(DateTime month)
    {
        return month.Day == 1;
    }
}
