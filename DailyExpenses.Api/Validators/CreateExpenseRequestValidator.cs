using DailyExpenses.Api.DTOs;
using FluentValidation;

namespace DailyExpenses.Api.Validators;

/// <summary>
/// Validator for CreateExpenseRequest to ensure amount, note, and date meet requirements.
/// </summary>
public class CreateExpenseRequestValidator : AbstractValidator<CreateExpenseRequest>
{
    public CreateExpenseRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0")
            .PrecisionScale(10, 2, false)
            .WithMessage("Amount must have at most 2 decimal places");

        RuleFor(x => x.Note)
            .MaximumLength(500)
            .WithMessage("Note cannot exceed 500 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Note));

        RuleFor(x => x.Date)
            .LessThanOrEqualTo(DateTime.Now.Date)  // Use local time instead of UTC
            .WithMessage("Date cannot be in the future")
            .When(x => x.Date.HasValue);
    }
}
