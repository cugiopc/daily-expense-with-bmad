using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using DailyExpenses.Api.DTOs;
using Microsoft.IdentityModel.Tokens;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Integration tests for protected endpoints using JWT authentication.
/// Tests the complete authentication flow with protected endpoints.
/// </summary>
public class ProtectedEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ProtectedEndpointTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidToken_Returns200Ok()
    {
        // Arrange - Register and login to get access token
        var registerRequest = new RegisterRequest
        {
            Email = "protected@example.com",
            Password = "SecurePass123"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "protected@example.com",
            Password = "SecurePass123"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginApiResponse = JsonSerializer.Deserialize<ApiResponse<LoginResponse>>(loginContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(loginApiResponse?.Data?.AccessToken);
        var accessToken = loginApiResponse.Data.AccessToken;

        // Create request with Authorization header
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/test/protected");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Assert.NotNull(apiResponse);
        Assert.True(apiResponse.Success);
        Assert.Contains("protected@example.com", content);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401Unauthorized()
    {
        // Arrange - No Authorization header

        // Act
        var response = await _client.GetAsync("/api/test/protected");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithExpiredToken_Returns401Unauthorized()
    {
        // Arrange - Generate an expired token manually
        var expiredToken = GenerateExpiredToken();

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/test/protected");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", expiredToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithInvalidToken_Returns401Unauthorized()
    {
        // Arrange - Use a malformed token
        var invalidToken = "invalid.token.string";

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/test/protected");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", invalidToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    /// <summary>
    /// Helper method to generate an expired JWT token for testing.
    /// </summary>
    private string GenerateExpiredToken()
    {
        var jwtSecret = "ThisIsATestSecretKeyForGeneratingExpiredTokens12345";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Email, "expired@example.com")
        };

        var token = new JwtSecurityToken(
            issuer: "DailyExpenses.Api",
            audience: "DailyExpenses.Client",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(-1), // Expired 1 hour ago
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
