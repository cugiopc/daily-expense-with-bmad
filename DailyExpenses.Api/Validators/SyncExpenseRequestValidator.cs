using DailyExpenses.Api.DTOs;
using FluentValidation;

namespace DailyExpenses.Api.Validators;

/// <summary>
/// Validator for SyncExpenseRequest
/// Validates individual expense in sync batch
/// </summary>
public class SyncExpenseRequestValidator : AbstractValidator<SyncExpenseRequest>
{
    public SyncExpenseRequestValidator()
    {
        RuleFor(x => x.TempId)
            .NotEmpty().WithMessage("TempId is required")
            .Must(BeValidUuid).WithMessage("TempId must be a valid UUID");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0")
            .LessThan(1_000_000_000).WithMessage("Amount must be less than 1 billion VND");

        RuleFor(x => x.Note)
            .MaximumLength(500).WithMessage("Note must be at most 500 characters");

        RuleFor(x => x.Date)
            .LessThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Date cannot be in the future");

        RuleFor(x => x.CreatedAt)
            .NotEmpty().WithMessage("CreatedAt is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(5)) // Allow 5 min clock skew
            .WithMessage("CreatedAt cannot be in the future");
    }

    private bool BeValidUuid(string tempId)
    {
        return Guid.TryParse(tempId, out _);
    }
}
