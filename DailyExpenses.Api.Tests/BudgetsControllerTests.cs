using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DailyExpenses.Api.DTOs;
using Microsoft.Extensions.DependencyInjection;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Integration tests for BudgetsController.
/// Tests budget CRUD operations with authentication, validation, and UPSERT logic.
/// Story 3.2: Set Monthly Budget API and UI
/// </summary>
public class BudgetsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public BudgetsControllerTests(CustomWebApplicationFactory factory)
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
    public async Task CreateBudget_ValidData_Returns201Created()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 15000000
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<BudgetResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var budgetResponse = apiResponse.Data;

        Assert.NotEqual(Guid.Empty, budgetResponse.Id);
        Assert.NotEqual(Guid.Empty, budgetResponse.UserId);
        Assert.Equal(15000000, budgetResponse.Amount);
        Assert.Equal(new DateTime(2026, 1, 1), budgetResponse.Month);
        Assert.True(budgetResponse.CreatedAt <= DateTime.UtcNow);

        // Verify Location header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains(budgetResponse.Id.ToString(), response.Headers.Location.ToString());
    }

    [Fact]
    public async Task CreateBudget_ExistingBudget_Updates200OK()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create initial budget
        var initialRequest = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 15000000
        };
        await _client.PostAsJsonAsync("/api/budgets", initialRequest);

        // Update with new amount
        var updateRequest = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 18000000
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<BudgetResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var budgetResponse = apiResponse.Data;

        Assert.Equal(18000000, budgetResponse.Amount); // Updated amount
        Assert.Equal(new DateTime(2026, 1, 1), budgetResponse.Month);
    }

    [Fact]
    public async Task CreateBudget_NegativeAmount_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = -1000
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Budget amount must be greater than 0", content);
    }

    [Fact]
    public async Task CreateBudget_ZeroAmount_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Budget amount must be greater than 0", content);
    }

    [Fact]
    public async Task CreateBudget_ExcessiveDecimalPlaces_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 15000000.999m // 3 decimal places (exceeds max 2)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("at most 2 decimal places", content);
    }

    [Fact]
    public async Task CreateBudget_NoAuthToken_Returns401Unauthorized()
    {
        // Arrange - No Authorization header set
        var request = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 15000000
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/budgets", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentBudget_BudgetExists_Returns200OK()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create budget for current month
        var now = DateTime.UtcNow;
        var currentMonth = new DateTime(now.Year, now.Month, 1);

        var createRequest = new CreateBudgetRequest
        {
            Month = currentMonth,
            Amount = 15000000
        };
        await _client.PostAsJsonAsync("/api/budgets", createRequest);

        // Act
        var response = await _client.GetAsync("/api/budgets/current");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<BudgetResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal(15000000, apiResponse.Data.Amount);
        Assert.Equal(currentMonth, apiResponse.Data.Month);
    }

    [Fact]
    public async Task GetCurrentBudget_NoBudget_Returns404NotFound()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - Don't create budget, just try to get current
        var response = await _client.GetAsync("/api/budgets/current");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("No budget set for current month", content);
    }

    [Fact]
    public async Task GetBudgets_ReturnsUserBudgetsOnly()
    {
        // Arrange - Create two users
        var token1 = await GetAuthTokenAsync();
        var token2 = await GetAuthTokenAsync();

        // User 1 creates a budget
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);
        var budget1 = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 15000000
        };
        await _client.PostAsJsonAsync("/api/budgets", budget1);

        // User 2 creates a budget
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token2);
        var budget2 = new CreateBudgetRequest
        {
            Month = new DateTime(2026, 1, 1),
            Amount = 20000000
        };
        await _client.PostAsJsonAsync("/api/budgets", budget2);

        // Act - User 1 retrieves their budgets
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);
        var response = await _client.GetAsync("/api/budgets");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<BudgetResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);

        // User 1 should only see their own budget
        Assert.Single(apiResponse.Data);
        Assert.Equal(15000000, apiResponse.Data[0].Amount);

        // Verify User 2's budget is not in User 1's results (security isolation test)
        Assert.DoesNotContain(apiResponse.Data, b => b.Amount == 20000000);
    }
}
