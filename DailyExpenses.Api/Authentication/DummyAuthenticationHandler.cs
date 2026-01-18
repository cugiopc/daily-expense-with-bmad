using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace DailyExpenses.Api.Authentication;

/// <summary>
/// Dummy authentication scheme for Testing environment (skips JWT validation).
/// Used to allow integration tests to run without JWT configuration.
/// </summary>
public class DummyAuthenticationOptions : AuthenticationSchemeOptions { }

/// <summary>
/// Dummy authentication handler that creates a test user for integration tests.
/// </summary>
public class DummyAuthenticationHandler : AuthenticationHandler<DummyAuthenticationOptions>
{
    public DummyAuthenticationHandler(
        IOptionsMonitor<DummyAuthenticationOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] {
            new Claim(ClaimTypes.NameIdentifier, "test-user"),
            new Claim(ClaimTypes.Email, "test@example.com")
        }, "test"));
        
        var ticket = new AuthenticationTicket(principal, "TestScheme");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
