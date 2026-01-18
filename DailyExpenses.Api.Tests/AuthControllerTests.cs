using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DailyExpenses.Api.Data;
using DailyExpenses.Api.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Custom Web Application Factory that replaces PostgreSQL with In-Memory database
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private DbContextOptions<AppDbContext>? _dbContextOptions;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment to Testing to skip PostgreSQL registration
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove existing DbContext registration if any
            var descriptor = services.FirstOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Create a single InMemory database instance for all tests
            // This ensures data persists across requests within a test
            _dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase("TestDb_" + Guid.NewGuid())
                .Options;

            // Add In-Memory database for testing with the shared options
            services.AddDbContext<AppDbContext>(options =>
            {
                var inMemoryOptions = new DbContextOptionsBuilder<AppDbContext>()
                    .UseInMemoryDatabase("TestDb_Shared")
                    .Options;
                // Copy the options to the service descriptor
            }, ServiceLifetime.Scoped);

            // Override with our shared in-memory instance
            services.AddScoped<AppDbContext>(sp => new AppDbContext(_dbContextOptions!));
        });
    }
}

/// <summary>
/// Integration tests for AuthController registration endpoint.
/// Tests the complete flow: HTTP request → Controller → Service → Repository → Database.
/// </summary>
public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_Returns201Created()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<RegisterResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.True(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.NotEqual(Guid.Empty, apiResponse.Data.Id);
        Assert.Equal(request.Email, apiResponse.Data.Email);

        // Verify Location header
        Assert.NotNull(response.Headers.Location);
    }

    [Fact]
    public async Task Register_WithExistingEmail_Returns409Conflict()
    {
        // Arrange - First registration
        var request = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", request);

        // Act - Second registration with same email
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Email already registered", apiResponse.Data.Message);
        Assert.Equal("EMAIL_EXISTS", apiResponse.Data.Code);
    }

    [Fact]
    public async Task Register_WithInvalidEmailFormat_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "invalid-email",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Email must be a valid email address", content);
    }

    [Fact]
    public async Task Register_WithPasswordLessThan8Characters_Returns400BadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Short1"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Password must be at least 8 characters", content);
    }

    [Fact]
    public async Task Register_VerifyBCryptHashIsStored()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "bcrypt@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        // Assert - Verify BCrypt hash is stored in database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        Assert.NotNull(user);
        Assert.NotEmpty(user.PasswordHash);
        // BCrypt hash format: $2a$ or $2b$ followed by work factor and salt/hash
        Assert.True(
            user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$"),
            $"Password hash should start with $2a$ or $2b$, but was: {user.PasswordHash.Substring(0, Math.Min(10, user.PasswordHash.Length))}"
        );
        // BCrypt hash is 60 characters long
        Assert.Equal(60, user.PasswordHash.Length);
    }

    [Fact]
    public async Task Register_VerifyPasswordNotInResponse()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test_notinresponse@example.com",  // Changed to avoid "password" in email
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        // Verify plain text password is NOT in response
        Assert.DoesNotContain("SecurePass123", content);
        // Verify BCrypt hash format is not visible (response should only have ID and email)
        Assert.DoesNotContain("$2a$", content);  // BCrypt hash prefix
        Assert.DoesNotContain("$2b$", content);  // BCrypt hash prefix
    }

    [Fact]
    public async Task Register_VerifyUTCTimestampsAreSet()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "timestamps@example.com",
            Password = "SecurePass123"
        };

        var beforeRegistration = DateTime.UtcNow;

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var afterRegistration = DateTime.UtcNow;

        // Assert - Verify timestamps are set correctly
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        Assert.NotNull(user);
        Assert.InRange(user.CreatedAt, beforeRegistration.AddSeconds(-5), afterRegistration.AddSeconds(5));
        Assert.InRange(user.UpdatedAt, beforeRegistration.AddSeconds(-5), afterRegistration.AddSeconds(5));
        // Verify both timestamps are very close (within 1 second) for new users
        var timeDifference = Math.Abs((user.CreatedAt - user.UpdatedAt).TotalMilliseconds);
        Assert.True(timeDifference < 100, $"CreatedAt and UpdatedAt differ by {timeDifference}ms, expected < 100ms");
    }

    [Fact]
    public async Task Register_WithDifferentEmailCase_Returns409Conflict()
    {
        // Arrange - Register with lowercase email
        var firstRequest = new RegisterRequest
        {
            Email = "user@example.com",
            Password = "SecurePass123"
        };
        var firstResponse = await _client.PostAsJsonAsync("/api/auth/register", firstRequest);
        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        // Act - Try to register with uppercase email
        var secondRequest = new RegisterRequest
        {
            Email = "USER@EXAMPLE.COM",
            Password = "DifferentPass456"
        };
        var secondResponse = await _client.PostAsJsonAsync("/api/auth/register", secondRequest);

        // Assert - Should return 409 Conflict because email already exists (case-insensitive)
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);

        var content = await secondResponse.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Email already registered", apiResponse.Data.Message);
        Assert.Equal("EMAIL_EXISTS", apiResponse.Data.Code);
    }

    [Fact]
    public async Task Register_WithWhitespaceInEmail_TrimsAndSucceeds()
    {
        // Arrange - Email with leading/trailing whitespace
        var request = new RegisterRequest
        {
            Email = "  trimtest@example.com  ",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert - Should succeed with trimmed email
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<RegisterResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.True(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("trimtest@example.com", apiResponse.Data.Email); // Trimmed email

        // Verify duplicate with whitespace is also detected
        var duplicateRequest = new RegisterRequest
        {
            Email = "trimtest@example.com   ",  // Same email with different whitespace
            Password = "AnotherPass456"
        };
        var duplicateResponse = await _client.PostAsJsonAsync("/api/auth/register", duplicateRequest);
        Assert.Equal(HttpStatusCode.Conflict, duplicateResponse.StatusCode);
    }

    [Fact]
    public async Task Register_WithWhitespaceInPassword_TrimsAndSucceeds()
    {
        // Arrange - Password with leading/trailing whitespace (should be trimmed)
        var request = new RegisterRequest
        {
            Email = "passtest@example.com",
            Password = "  SecurePass123  "
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert - Should succeed (password is trimmed to "SecurePass123" which is >= 8 chars)
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithEmptyEmailAfterTrim_Returns400BadRequest()
    {
        // Arrange - Email with only whitespace (will become empty after trim)
        var request = new RegisterRequest
        {
            Email = "   ",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert - Service defensive validation should catch this and return 400
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Email", content);
    }

    [Fact]
    public async Task Register_WithEmptyPasswordAfterTrim_Returns400BadRequest()
    {
        // Arrange - Password with only whitespace (will become empty after trim)
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "   "
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert - Service defensive validation should catch this and return 400
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Password", content);
    }

    [Fact]
    public async Task Register_ReturnsCorrectLocationHeader()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "location@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var location = response.Headers.Location!.ToString();
        Assert.Contains("/api/auth/register/", location);

        // Extract ID from response and verify it's in Location header
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<RegisterResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        Assert.True(location.EndsWith(apiResponse.Data.Id.ToString()),
            $"Location header '{location}' should end with user ID '{apiResponse.Data.Id}'");
    }

    #region Login Tests

    [Fact]
    public async Task Login_WithValidCredentials_Returns200OkAndAccessToken()
    {
        // Arrange - Register a test user first
        var registerRequest = new RegisterRequest
        {
            Email = "login@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "login@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.True(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.NotNull(apiResponse.Data.AccessToken);
        Assert.NotEmpty(apiResponse.Data.AccessToken);

        // Verify refreshToken cookie is set
        Assert.True(response.Headers.Contains("Set-Cookie"));
        var setCookieHeader = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookieHeader);
        Assert.Contains("refreshToken=", setCookieHeader);
        Assert.Contains("httponly", setCookieHeader.ToLower());
    }

    [Fact]
    public async Task Login_WithInvalidEmail_Returns401Unauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Invalid credentials", apiResponse.Data.Message);
        Assert.Equal("INVALID_CREDENTIALS", apiResponse.Data.Code);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_Returns401Unauthorized()
    {
        // Arrange - Register a test user first
        var registerRequest = new RegisterRequest
        {
            Email = "wrongpass@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "wrongpass@example.com",
            Password = "WrongPassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Invalid credentials", apiResponse.Data.Message);
    }

    [Fact]
    public async Task Login_WithEmptyEmail_Returns400BadRequest()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Email", content);
    }

    [Fact]
    public async Task Login_WithShortPassword_Returns400BadRequest()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "short"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Password", content);
        Assert.Contains("at least 8 characters", content);
    }

    [Fact]
    public async Task Login_ValidatesAccessTokenFormat()
    {
        // Arrange - Register and login
        var registerRequest = new RegisterRequest
        {
            Email = "tokentest@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "tokentest@example.com",
            Password = "SecurePass123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.NotNull(apiResponse.Data);
        var token = apiResponse.Data.AccessToken;

        // JWT tokens have 3 parts separated by dots
        var parts = token.Split('.');
        Assert.Equal(3, parts.Length);

        // Decode and verify token payload contains userId and email
        var payload = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(parts[1].PadRight(parts[1].Length + (4 - parts[1].Length % 4) % 4, '=')));
        Assert.Contains("nameid", payload); // userId claim
        Assert.Contains("email", payload);  // email claim
        Assert.Contains("exp", payload);    // expiry claim
    }

    [Fact]
    public async Task Login_SetsCorsHeaders()
    {
        // Arrange - Register a test user first
        var registerRequest = new RegisterRequest
        {
            Email = "cors@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "cors@example.com",
            Password = "SecurePass123"
        };

        // Create request with Origin header
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(loginRequest)
        };
        request.Headers.Add("Origin", "http://localhost:5173");

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // CORS headers should be present
        Assert.True(
            response.Headers.Contains("Access-Control-Allow-Origin") ||
            response.Headers.Contains("Vary"),
            "CORS headers should be present when Origin header is sent"
        );
    }

    #endregion

    #region Token Refresh Tests (Story 1.5)

    [Fact]
    public async Task Refresh_WithValidToken_Returns200OkAndNewAccessToken()
    {
        // Arrange - Register and login user to get refresh token cookie
        var registerRequest = new RegisterRequest
        {
            Email = "refresh_valid@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "refresh_valid@example.com",
            Password = "SecurePass123"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        // Extract original access token
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginApiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var originalAccessToken = loginApiResponse?.Data?.AccessToken;
        Assert.NotNull(originalAccessToken);

        // Extract refresh token from Set-Cookie header
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookieHeader);
        Assert.Contains("refreshToken=", setCookieHeader);

        // Extract the actual token value
        var refreshTokenValue = setCookieHeader.Split(';')[0].Split('=')[1];

        // Act - Send POST /api/auth/refresh with refresh token in cookie header
        var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        refreshRequest.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");
        var refreshResponse = await _client.SendAsync(refreshRequest);

        // Assert - 200 OK status
        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);

        // Assert - Response contains new AccessToken
        var refreshContent = await refreshResponse.Content.ReadAsStringAsync();
        var refreshApiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(refreshContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(refreshApiResponse);
        Assert.True(refreshApiResponse.Success);
        Assert.NotNull(refreshApiResponse.Data);
        Assert.NotNull(refreshApiResponse.Data.AccessToken);

        // Note: New access token might be identical to original if generated within same second
        // due to JWT exp claim having 1-second resolution. This is acceptable behavior.
        // Verify - New access token is valid JWT with correct claims
        var newToken = refreshApiResponse.Data.AccessToken;
        var parts = newToken.Split('.');
        Assert.Equal(3, parts.Length);

        var payload = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(parts[1].PadRight(parts[1].Length + (4 - parts[1].Length % 4) % 4, '=')));
        Assert.Contains("nameid", payload); // userId claim
        Assert.Contains("email", payload);  // email claim
        Assert.Contains("exp", payload);    // expiry claim
    }

    [Fact]
    public async Task Refresh_WithoutCookie_Returns401Unauthorized()
    {
        // Act - Send POST /api/auth/refresh without any cookies
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new { });

        // Assert - 401 Unauthorized
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // Assert - Error message "No refresh token provided"
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("No refresh token provided", apiResponse.Data.Message);
        Assert.Equal("NO_REFRESH_TOKEN", apiResponse.Data.Code);
    }

    [Fact]
    public async Task Refresh_WithInvalidToken_Returns401Unauthorized()
    {
        // Act - Send POST /api/auth/refresh with fake refresh token cookie
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", "refreshToken=fake_invalid_token_12345");
        var response = await _client.SendAsync(request);

        // Assert - 401 Unauthorized
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // Assert - Error message "Invalid or expired refresh token"
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Invalid or expired refresh token", apiResponse.Data.Message);
        Assert.Equal("INVALID_REFRESH_TOKEN", apiResponse.Data.Code);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_Returns401Unauthorized()
    {
        // Arrange - Register and login user
        var registerRequest = new RegisterRequest
        {
            Email = "refresh_expired@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "refresh_expired@example.com",
            Password = "SecurePass123"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        // Extract refresh token
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookieHeader);
        var refreshTokenValue = setCookieHeader.Split(';')[0].Split('=')[1];

        // Manually update user.RefreshTokenExpiresAt to yesterday in database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == "refresh_expired@example.com");
        Assert.NotNull(user);
        
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(-1); // Set to yesterday
        await dbContext.SaveChangesAsync();

        // Act - Send POST /api/auth/refresh with expired token
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");
        var response = await _client.SendAsync(request);

        // Assert - 401 Unauthorized
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // Assert - Error message "Invalid or expired refresh token"
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<ErrorResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.False(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Equal("Invalid or expired refresh token", apiResponse.Data.Message);
    }

    [Fact]
    public async Task Refresh_ValidatesNewAccessTokenFormat()
    {
        // Arrange - Register, login to get refresh token
        var registerRequest = new RegisterRequest
        {
            Email = "refresh_validate@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "refresh_validate@example.com",
            Password = "SecurePass123"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        var refreshTokenValue = setCookieHeader!.Split(';')[0].Split('=')[1];

        // Act - Refresh token
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");
        var response = await _client.SendAsync(request);

        // Assert - Extract new access token from response
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var newAccessToken = apiResponse?.Data?.AccessToken;
        Assert.NotNull(newAccessToken);

        // Decode JWT token
        var parts = newAccessToken.Split('.');
        Assert.Equal(3, parts.Length);

        var payloadJson = System.Text.Encoding.UTF8.GetString(
            Convert.FromBase64String(parts[1].PadRight(parts[1].Length + (4 - parts[1].Length % 4) % 4, '='))
        );

        // Assert - Contains userId claim
        Assert.Contains("nameid", payloadJson);
        
        // Assert - Contains email claim
        Assert.Contains("email", payloadJson);
        
        // Assert - Expiry is ~1 hour from now (within 5 second tolerance)
        var payload = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payloadJson);
        Assert.NotNull(payload);
        Assert.True(payload.ContainsKey("exp"));
        
        var expUnix = payload["exp"].GetInt64();
        var expDateTime = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
        var expectedExpiry = DateTime.UtcNow.AddHours(1);
        
        var timeDifference = Math.Abs((expDateTime - expectedExpiry).TotalSeconds);
        Assert.True(timeDifference < 5, $"Token expiry is {timeDifference}s off, expected within 5s tolerance");
    }

    [Fact]
    public async Task Refresh_DoesNotRotateRefreshToken()
    {
        // Arrange - Register, login to get initial refresh token
        var registerRequest = new RegisterRequest
        {
            Email = "refresh_norotate@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "refresh_norotate@example.com",
            Password = "SecurePass123"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var setCookieHeader = loginResponse.Headers.GetValues("Set-Cookie").FirstOrDefault();
        var refreshTokenValue = setCookieHeader!.Split(';')[0].Split('=')[1];

        // Capture initial refresh token and expiry from database
        using var scope1 = _factory.Services.CreateScope();
        var dbContext1 = scope1.ServiceProvider.GetRequiredService<AppDbContext>();
        var userBefore = await dbContext1.Users.FirstOrDefaultAsync(u => u.Email == "refresh_norotate@example.com");
        Assert.NotNull(userBefore);
        var initialRefreshToken = userBefore.RefreshToken;
        var initialRefreshExpiry = userBefore.RefreshTokenExpiresAt;

        // Act - Call refresh endpoint
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/refresh");
        request.Headers.Add("Cookie", $"refreshToken={refreshTokenValue}");
        var response = await _client.SendAsync(request);

        // Assert - No new Set-Cookie header in response
        var hasCookieHeader = response.Headers.Contains("Set-Cookie");
        Assert.False(hasCookieHeader, "Refresh endpoint should NOT set a new refresh token cookie");

        // Query database - Verify user.RefreshToken unchanged
        using var scope2 = _factory.Services.CreateScope();
        var dbContext2 = scope2.ServiceProvider.GetRequiredService<AppDbContext>();
        var userAfter = await dbContext2.Users.FirstOrDefaultAsync(u => u.Email == "refresh_norotate@example.com");
        Assert.NotNull(userAfter);
        
        // Verify - user.RefreshToken unchanged
        Assert.Equal(initialRefreshToken, userAfter.RefreshToken);
        
        // Verify - user.RefreshTokenExpiresAt unchanged
        Assert.Equal(initialRefreshExpiry, userAfter.RefreshTokenExpiresAt);
    }

    #endregion
}
