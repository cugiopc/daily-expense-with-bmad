using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Integration tests for health check endpoints.
/// Verifies /health, /health/ready, and /health/live endpoints.
/// Note: /health may return Unhealthy (503) if database is not available in test environment.
/// </summary>
public class HealthCheckTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public HealthCheckTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_Endpoint_Returns_Response()
    {
        // Arrange
        var endpoint = "/health";

        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert - Health endpoint should respond (OK if DB available, ServiceUnavailable if not)
        Assert.True(
            response.StatusCode == HttpStatusCode.OK || 
            response.StatusCode == HttpStatusCode.ServiceUnavailable,
            $"Expected OK or ServiceUnavailable, got {response.StatusCode}");
        
        var content = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(content);
    }

    [Fact]
    public async Task HealthReady_Endpoint_Returns_Success()
    {
        // Arrange
        var endpoint = "/health/ready";

        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert - Ready endpoint has no checks, always returns OK
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(content);
    }

    [Fact]
    public async Task HealthLive_Endpoint_Returns_Success()
    {
        // Arrange
        var endpoint = "/health/live";

        // Act
        var response = await _client.GetAsync(endpoint);

        // Assert - Liveness endpoint has no checks, always returns OK
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.NotEmpty(content);
    }

    [Fact]
    public async Task Health_Endpoint_Contains_Status_Message()
    {
        // Arrange
        var endpoint = "/health";

        // Act
        var response = await _client.GetAsync(endpoint);
        var content = await response.Content.ReadAsStringAsync();

        // Assert - Content should contain status ("Healthy" or "Unhealthy")
        Assert.True(
            content.Contains("Healthy") || content.Contains("Unhealthy"),
            "Response should contain health status");
    }

    [Fact]
    public async Task Health_Endpoint_Responds_With_Content()
    {
        // Arrange
        var endpoint = "/health";

        // Act
        var response = await _client.GetAsync(endpoint);
        var content = await response.Content.ReadAsStringAsync();

        // Assert - Response should have status content (Healthy or Unhealthy)
        Assert.True(
            !string.IsNullOrWhiteSpace(content),
            "Health endpoint should return non-empty response");
    }
}
