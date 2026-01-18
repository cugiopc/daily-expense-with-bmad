using DailyExpenses.Api.Repositories;
using DailyExpenses.Api.Services;
using FluentValidation;

namespace DailyExpenses.Api.Extensions;

/// <summary>
/// Extension methods for IServiceCollection to organize service registrations.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers authentication-related services and validators.
    /// </summary>
    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services)
    {
        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Register services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenService, TokenService>();

        // Register FluentValidation validators
        services.AddValidatorsFromAssemblyContaining<Program>();

        return services;
    }
}
