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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;
        
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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;
        
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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;
        
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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;

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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;
        
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
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var expenseResponse = apiResponse.Data;
        
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

    #region GET /api/expenses Tests (Story 2.3)

    [Fact]
    public async Task GetExpenses_WithValidDateRange_ReturnsFilteredExpenses()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        // Create fresh client for better test isolation (avoids shared state from _client)
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create test expenses with different dates (use past dates)
        var expense1 = new CreateExpenseRequest { Amount = 45000, Note = "jan 10", Date = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) };
        var expense2 = new CreateExpenseRequest { Amount = 50000, Note = "jan 15", Date = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) };
        var expense3 = new CreateExpenseRequest { Amount = 30000, Note = "dec 25", Date = new DateTime(2025, 12, 25, 0, 0, 0, DateTimeKind.Utc) };

        var response1 = await client.PostAsJsonAsync("/api/expenses", expense1);
        var response2 = await client.PostAsJsonAsync("/api/expenses", expense2);
        var response3 = await client.PostAsJsonAsync("/api/expenses", expense3);
        
        Assert.Equal(HttpStatusCode.Created, response1.StatusCode);
        Assert.Equal(HttpStatusCode.Created, response2.StatusCode);
        Assert.Equal(HttpStatusCode.Created, response3.StatusCode);

        // Act - Query for January expenses only
        var response = await client.GetAsync("/api/expenses?startDate=2026-01-01&endDate=2026-01-31");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data.Count); // Only Jan expenses
        Assert.All(result.Data, e => Assert.True(e.Date >= new DateTime(2026, 1, 1) && e.Date <= new DateTime(2026, 1, 31)));
    }

    [Fact]
    public async Task GetExpenses_WithoutDateParams_DefaultsToCurrentMonth()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create expense for current month
        var now = DateTime.UtcNow;
        var currentMonthExpense = new CreateExpenseRequest
        {
            Amount = 25000,
            Note = "current month",
            Date = now.Date
        };
        await _client.PostAsJsonAsync("/api/expenses", currentMonthExpense);

        // Create expense for previous month
        var previousMonthExpense = new CreateExpenseRequest
        {
            Amount = 35000,
            Note = "previous month",
            Date = now.AddMonths(-1).Date
        };
        await _client.PostAsJsonAsync("/api/expenses", previousMonthExpense);

        // Act - Query without date parameters
        var response = await _client.GetAsync("/api/expenses");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        
        // Should return at least the current month expense
        Assert.Contains(result.Data, e => e.Note == "current month");
        
        // All expenses should be in current month
        var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);
        Assert.All(result.Data, e => Assert.True(e.Date >= firstDayOfMonth && e.Date <= lastDayOfMonth));
    }

    [Fact]
    public async Task GetExpenses_WithEmptyResult_ReturnsEmptyArray()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - Query for a date range with no expenses
        var response = await _client.GetAsync("/api/expenses?startDate=2020-01-01&endDate=2020-01-31");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task GetExpenses_OrdersByDateDescThenCreatedAtDesc()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        // Create fresh client for better test isolation (avoids shared state from _client)
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create expenses with same date but different creation times (use past dates)
        var expense1 = new CreateExpenseRequest { Amount = 10000, Note = "first", Date = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) };
        var resp1 = await client.PostAsJsonAsync("/api/expenses", expense1);
        Assert.Equal(HttpStatusCode.Created, resp1.StatusCode);
        await Task.Delay(100); // Ensure different CreatedAt timestamps

        var expense2 = new CreateExpenseRequest { Amount = 20000, Note = "second", Date = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) };
        var resp2 = await client.PostAsJsonAsync("/api/expenses", expense2);
        Assert.Equal(HttpStatusCode.Created, resp2.StatusCode);

        // Create expense with newer date
        var expense3 = new CreateExpenseRequest { Amount = 30000, Note = "newer date", Date = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc) };
        var resp3 = await client.PostAsJsonAsync("/api/expenses", expense3);
        Assert.Equal(HttpStatusCode.Created, resp3.StatusCode);

        // Act
        var response = await client.GetAsync("/api/expenses?startDate=2026-01-01&endDate=2026-01-31");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(3, result.Data.Count);

        // Verify ordering: newest date first
        Assert.Equal("newer date", result.Data[0].Note);
        Assert.Equal(new DateTime(2026, 1, 15), result.Data[0].Date.Date);

        // For same date (Jan 10), newest CreatedAt first
        Assert.Equal("second", result.Data[1].Note);
        Assert.Equal("first", result.Data[2].Note);
        Assert.True(result.Data[1].CreatedAt > result.Data[2].CreatedAt);
    }

    [Fact]
    public async Task GetExpenses_OnlyReturnsAuthenticatedUsersExpenses()
    {
        // Arrange - Create two different users
        var token1 = await GetAuthTokenAsync();
        var token2 = await GetAuthTokenAsync();

        // User 1 creates expense
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);
        var user1Expense = new CreateExpenseRequest { Amount = 10000, Note = "user 1 expense", Date = DateTime.UtcNow.Date };
        await _client.PostAsJsonAsync("/api/expenses", user1Expense);

        // User 2 creates expense
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token2);
        var user2Expense = new CreateExpenseRequest { Amount = 20000, Note = "user 2 expense", Date = DateTime.UtcNow.Date };
        await _client.PostAsJsonAsync("/api/expenses", user2Expense);

        // Act - User 1 queries expenses
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);
        var response = await _client.GetAsync("/api/expenses");

        // Assert - User 1 should only see their own expenses
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.All(result.Data, e => Assert.Equal("user 1 expense", e.Note));
        Assert.DoesNotContain(result.Data, e => e.Note == "user 2 expense");
    }

    [Fact]
    public async Task GetExpenses_WithoutAuthentication_Returns401()
    {
        // Arrange - No Authorization header

        // Act
        var response = await _client.GetAsync("/api/expenses");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetExpenses_WithStartDateGreaterThanEndDate_Returns400()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - Invalid date range
        var response = await _client.GetAsync("/api/expenses?startDate=2026-01-31&endDate=2026-01-01");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid date range", content);
        Assert.Contains("INVALID_DATE_RANGE", content);
    }

    [Fact]
    public async Task GetExpenses_WithInvalidDateFormat_Returns400()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - Invalid date format
        var response = await _client.GetAsync("/api/expenses?startDate=invalid-date");

        // Assert
        // ASP.NET Core model binding returns 400 for invalid DateTime format
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetExpenses_PerformanceWithManyExpenses_RespondsUnder200ms()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create 100+ expenses
        for (int i = 0; i < 100; i++)
        {
            var expense = new CreateExpenseRequest
            {
                Amount = 10000 + i,
                Note = $"expense {i}",
                Date = DateTime.UtcNow.Date.AddDays(-i % 30)
            };
            await _client.PostAsJsonAsync("/api/expenses", expense);
        }

        // Act - Measure response time
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var response = await _client.GetAsync("/api/expenses");
        stopwatch.Stop();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(stopwatch.ElapsedMilliseconds < 200, 
            $"Response time {stopwatch.ElapsedMilliseconds}ms exceeded 200ms threshold");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotEmpty(result.Data);
    }

    [Fact]
    public async Task GetExpenses_WithSameDateExpenses_OrdersByCreatedAtDesc()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create multiple expenses on the same date
        var sameDate = new DateTime(2026, 1, 15);
        
        var expense1 = new CreateExpenseRequest { Amount = 10000, Note = "morning", Date = sameDate };
        await _client.PostAsJsonAsync("/api/expenses", expense1);
        await Task.Delay(50);

        var expense2 = new CreateExpenseRequest { Amount = 20000, Note = "noon", Date = sameDate };
        await _client.PostAsJsonAsync("/api/expenses", expense2);
        await Task.Delay(50);

        var expense3 = new CreateExpenseRequest { Amount = 30000, Note = "evening", Date = sameDate };
        await _client.PostAsJsonAsync("/api/expenses", expense3);

        // Act
        var response = await _client.GetAsync("/api/expenses?startDate=2026-01-15&endDate=2026-01-15");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ExpenseResponse>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(3, result.Data.Count);

        // Should be ordered by CreatedAt DESC (newest first)
        Assert.Equal("evening", result.Data[0].Note);
        Assert.Equal("noon", result.Data[1].Note);
        Assert.Equal("morning", result.Data[2].Note);
    }

    #endregion

    #region PUT /api/expenses/{id} Tests

    [Fact]
    public async Task UpdateExpense_WithValidData_Returns200OK()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create an expense first
        var createRequest = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "original note",
            Date = new DateTime(2026, 1, 15)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", createRequest);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdExpense = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(createContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })?.Data;

        Assert.NotNull(createdExpense);

        // Update the expense
        var updateRequest = new UpdateExpenseRequest
        {
            Amount = 75000,
            Note = "updated note",
            Date = new DateTime(2026, 1, 16)
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/expenses/{createdExpense.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(createdExpense.Id, result.Data.Id);
        Assert.Equal(75000, result.Data.Amount);
        Assert.Equal("updated note", result.Data.Note);
        Assert.Equal(new DateTime(2026, 1, 16), result.Data.Date.Date);
        Assert.True(result.Data.UpdatedAt > createdExpense.UpdatedAt); // UpdatedAt should be newer
    }

    [Fact]
    public async Task UpdateExpense_WithInvalidAmount_Returns400BadRequest()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create an expense first
        var createRequest = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "test",
            Date = new DateTime(2026, 1, 15)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", createRequest);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdExpense = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(createContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })?.Data;

        Assert.NotNull(createdExpense);

        // Try to update with invalid amount
        var updateRequest = new UpdateExpenseRequest
        {
            Amount = 0, // Invalid: must be > 0
            Note = "test note",
            Date = new DateTime(2026, 1, 15)
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/expenses/{createdExpense.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(result);
        Assert.False(result.Success);
    }

    [Fact]
    public async Task UpdateExpense_NotOwner_Returns403Forbidden()
    {
        // Arrange - User 1 creates an expense
        var token1 = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);

        var createRequest = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "user 1 expense",
            Date = new DateTime(2026, 1, 15)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", createRequest);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdExpense = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(createContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })?.Data;

        Assert.NotNull(createdExpense);

        // User 2 tries to update User 1's expense
        var token2 = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token2);

        var updateRequest = new UpdateExpenseRequest
        {
            Amount = 99999,
            Note = "trying to hack",
            Date = new DateTime(2026, 1, 15)
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/expenses/{createdExpense.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task UpdateExpense_NonExistentExpense_Returns404NotFound()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var nonExistentId = Guid.NewGuid();
        var updateRequest = new UpdateExpenseRequest
        {
            Amount = 50000,
            Note = "test",
            Date = new DateTime(2026, 1, 15)
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/expenses/{nonExistentId}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateExpense_WithoutAuthentication_Returns401Unauthorized()
    {
        // Arrange
        _client.DefaultRequestHeaders.Clear(); // Remove auth header

        var updateRequest = new UpdateExpenseRequest
        {
            Amount = 50000,
            Note = "test",
            Date = new DateTime(2026, 1, 15)
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/expenses/{Guid.NewGuid()}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    #endregion

    #region DELETE /api/expenses/{id} Tests (Story 2.9)

    [Fact]
    public async Task DeleteExpense_ValidRequest_Returns200OK()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create an expense first
        var createRequest = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "expense to delete",
            Date = new DateTime(2026, 1, 15)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", createRequest);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdExpense = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(createContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })?.Data;

        Assert.NotNull(createdExpense);

        // Act
        var response = await _client.DeleteAsync($"/api/expenses/{createdExpense.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Expense deleted successfully", content);
        Assert.Contains(createdExpense.Id.ToString(), content);

        // Verify expense is actually deleted from database
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var deletedExpense = await context.Expenses.FindAsync(createdExpense.Id);
        Assert.Null(deletedExpense);
    }

    [Fact]
    public async Task DeleteExpense_NotOwner_Returns403Forbidden()
    {
        // Arrange - User 1 creates an expense
        var token1 = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token1);

        var createRequest = new CreateExpenseRequest
        {
            Amount = 50000,
            Note = "user 1 expense",
            Date = new DateTime(2026, 1, 15)
        };
        var createResponse = await _client.PostAsJsonAsync("/api/expenses", createRequest);
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdExpense = JsonSerializer.Deserialize<ApiResponse<ExpenseResponse>>(createContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })?.Data;

        Assert.NotNull(createdExpense);

        // User 2 tries to delete User 1's expense
        var token2 = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token2);

        // Act
        var response = await _client.DeleteAsync($"/api/expenses/{createdExpense.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        // Verify expense still exists
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var expense = await context.Expenses.FindAsync(createdExpense.Id);
        Assert.NotNull(expense);
    }

    [Fact]
    public async Task DeleteExpense_NonExistentExpense_Returns404NotFound()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/expenses/{nonExistentId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Expense not found", content);
        Assert.Contains("NOT_FOUND", content);
    }

    [Fact]
    public async Task DeleteExpense_WithoutAuthentication_Returns401Unauthorized()
    {
        // Arrange - No Authorization header
        _client.DefaultRequestHeaders.Clear();

        // Act
        var response = await _client.DeleteAsync($"/api/expenses/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    #endregion
}
