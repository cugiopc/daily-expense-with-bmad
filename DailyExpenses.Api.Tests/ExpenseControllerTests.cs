using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DailyExpenses.Api.Data;
using DailyExpenses.Api.DTOs;
using DailyExpenses.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Integration tests for ExpenseController.
/// Tests POST /api/expenses endpoint with authentication, validation, and data persistence.
/// </summary>
public class ExpenseControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ExpenseControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    /// <summary>
    /// Helper method to register a test user and get JWT access token
    /// </summary>
    private async Task<string> GetAuthTokenAsync()
    {
        // Register a test user
        var registerRequest = new RegisterRequest
        {
            Email = $"test_{Guid.NewGuid()}@example.com",
            Password = "SecurePass123"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        // Login to get access token
        var loginRequest = new LoginRequest
        {
            Email = registerRequest.Email,
            Password = registerRequest.Password
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginResult = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(loginResult?.Data?.AccessToken);
        return loginResult.Data.AccessToken;
    }

    [Fact]
    public async Task CreateExpense_WithValidData_Returns201Created()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 45000,
            Note = "cafe",
            Date = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(expenseResponse);
        Assert.NotEqual(Guid.Empty, expenseResponse.Id);
        Assert.NotEqual(Guid.Empty, expenseResponse.UserId);
        Assert.Equal(45000, expenseResponse.Amount);
        Assert.Equal("cafe", expenseResponse.Note);
        Assert.Equal(new DateTime(2026, 1, 15), expenseResponse.Date.Date);
        Assert.True(expenseResponse.CreatedAt <= DateTime.UtcNow);
        Assert.True(expenseResponse.UpdatedAt <= DateTime.UtcNow);

        // Verify Location header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains(expenseResponse.Id.ToString(), response.Headers.Location.ToString());
    }

    [Fact]
    public async Task CreateExpense_WithZeroAmount_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 0,
            Note = "invalid amount",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Amount must be greater than 0", content);
    }

    [Fact]
    public async Task CreateExpense_WithNegativeAmount_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = -100,
            Note = "negative amount",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Amount must be greater than 0", content);
    }

    [Fact]
    public async Task CreateExpense_WithoutAuthentication_Returns401Unauthorized()
    {
        // Arrange - No Authorization header set
        var request = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "test expense",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateExpense_WithoutDate_DefaultsToToday()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 30000,
            Note = "no date provided",
            Date = null // Explicitly null
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(expenseResponse);
        Assert.Equal(DateTime.UtcNow.Date, expenseResponse.Date.Date);
    }

    [Fact]
    public async Task CreateExpense_WithXssAttemptInNote_SanitizesNote()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 25000,
            Note = "<script>alert('XSS')</script>malicious note",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(expenseResponse);
        // Verify that Note is HTML encoded
        Assert.DoesNotContain("<script>", expenseResponse.Note);
        Assert.Contains("&lt;script&gt;", expenseResponse.Note); // HTML encoded
    }

    [Fact]
    public async Task CreateExpense_WithNoteTooLong_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 10000,
            Note = new string('x', 501), // 501 characters (max is 500)
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Note cannot exceed 500 characters", content);
    }

    [Fact]
    public async Task CreateExpense_WithFutureDate_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 15000,
            Note = "future expense",
            Date = DateTime.UtcNow.Date.AddDays(1) // Tomorrow
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Date cannot be in the future", content);
    }

    [Fact]
    public async Task CreateExpense_VerifiesDatabasePersistence()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 75000,
            Note = "database persistence test",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Verify in database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var savedExpense = await context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseResponse!.Id);

        Assert.NotNull(savedExpense);
        Assert.Equal(expenseResponse!.Amount, savedExpense.Amount);
        Assert.Equal(expenseResponse.Note, savedExpense.Note);
        Assert.Equal(expenseResponse.Date.Date, savedExpense.Date.Date);
        Assert.Equal(expenseResponse.UserId, savedExpense.UserId);
    }

    [Fact]
    public async Task CreateExpense_WithEmptyNote_AllowsNullNote()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 20000,
            Note = null, // Null note
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(expenseResponse);
        Assert.Null(expenseResponse.Note);
    }

    [Fact]
    public async Task CreateExpense_WithWhitespaceNote_TrimsCorrectly()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 15000,
            Note = "  test note with spaces  ", // Note with leading/trailing whitespace
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var expenseResponse = JsonSerializer.Deserialize<ExpenseResponse>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(expenseResponse);
        // Verify that Note is trimmed and HTML encoded (no leading/trailing spaces)
        Assert.Equal("test note with spaces", expenseResponse.Note);
    }

    [Fact]
    public async Task CreateExpense_WithDecimalPrecisionExceeded_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateExpenseRequest
        {
            Amount = 45000.12345m, // More than 2 decimal places
            Note = "precision test",
            Date = DateTime.UtcNow.Date
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/expenses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Amount must have at most 2 decimal places", content);
    }
}
