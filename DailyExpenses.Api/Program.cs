using DailyExpenses.Api.Authentication;
using DailyExpenses.Api.Data;
using DailyExpenses.Api.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add Controllers
builder.Services.AddControllers();

// Register authentication services and validators (LOW-2: Extracted to extension method)
builder.Services.AddAuthenticationServices();

// Configure PostgreSQL Database
// Skip database configuration in Testing environment (tests use InMemory database)
if (builder.Environment.EnvironmentName != "Testing")
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "Database connection string 'DefaultConnection' is not configured. " +
            "Set it in appsettings.Development.json for local dev or as environment variable for production.");
    }

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// Configure CORS for frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Environment-driven CORS origins (production-safe)
        var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(";") ?? new[] { "http://localhost:5173" };
        policy.WithOrigins(allowedOrigins)
              .WithHeaders("Content-Type", "Authorization") // Whitelist specific headers
              .AllowAnyMethod()
              .AllowCredentials(); // Required for httpOnly cookies
    });
});

// Configure JWT Authentication
// In Testing environment, add test JWT configuration
if (builder.Environment.EnvironmentName == "Testing")
{
    var testConfig = new Dictionary<string, string?>
    {
        ["Jwt:Secret"] = "ThisIsATestSecretKeyForUnitTestingPurposesOnly12345",
        ["Jwt:Issuer"] = "DailyExpenses.Api",
        ["Jwt:Audience"] = "DailyExpenses.Client",
        ["Jwt:AccessTokenExpirationMinutes"] = "60",
        ["Jwt:RefreshTokenExpirationDays"] = "7"
    };
    builder.Configuration.AddInMemoryCollection(testConfig);
}

var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "JWT Secret is not configured. " +
        "Set 'Jwt:Secret' in appsettings.Development.json for local dev or as environment variable for production. " +
        "Secret must be at least 256 bits (32 characters).");
}

if (jwtSecret.Length < 32)
{
    throw new InvalidOperationException(
        $"JWT Secret is too short ({jwtSecret.Length} characters). " +
        "Secret must be at least 256 bits (32 characters) for HS256 algorithm. " +
        $"Current secret length: {jwtSecret.Length} chars. Required: 32+ chars. " +
        "Example: Set environment variable 'Jwt__Secret' with a 32+ character random string.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
if (string.IsNullOrWhiteSpace(jwtIssuer))
{
    throw new InvalidOperationException("JWT Issuer is not configured. Set 'Jwt:Issuer' in appsettings.json.");
}

var jwtAudience = builder.Configuration["Jwt:Audience"];
if (string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException("JWT Audience is not configured. Set 'Jwt:Audience' in appsettings.json.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment() && builder.Environment.EnvironmentName != "Testing";
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero // No grace period for token expiry
    };
});

builder.Services.AddAuthorization();

// Add health checks (skip database check in Testing environment)
if (builder.Environment.EnvironmentName != "Testing")
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString, name: "database", timeout: TimeSpan.FromSeconds(3));
}
else
{
    builder.Services.AddHealthChecks();
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Trust proxy headers from Railway/cloud providers (HTTPS forwarding)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor
});

// Only use HTTPS redirection in Development
// In Production (Railway/cloud), the proxy/edge handles HTTPS termination
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // Liveness check - no health checks run, just returns OK if app is responsive
});

// ========================================
// DEMO ENDPOINT (from .NET template)
// TODO: Remove before production deployment
// This endpoint is for testing API functionality during Story 1.2 initialization only
// ========================================
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, WeatherForecastConstants.ForecastDays).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(index)),
            Random.Shared.Next(WeatherForecastConstants.MinTemperatureC, WeatherForecastConstants.MaxTemperatureC),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

// WeatherForecast constants
static class WeatherForecastConstants
{
    public const int ForecastDays = 5;
    public const int MinTemperatureC = -20;
    public const int MaxTemperatureC = 55;
    public const int FahrenheitFreezingPoint = 32;
    public const double CelsiusToFahrenheitMultiplier = 1.8;
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => WeatherForecastConstants.FahrenheitFreezingPoint + 
        (int)(TemperatureC * WeatherForecastConstants.CelsiusToFahrenheitMultiplier);
}

// Make Program class accessible to test project
public partial class Program { }
