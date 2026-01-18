using DailyExpenses.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DailyExpenses.Api.Controllers;

/// <summary>
/// Test controller for verifying JWT authentication.
/// This controller contains protected endpoints to test authentication middleware.
/// </summary>
[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    /// <summary>
    /// Protected endpoint requiring valid JWT authentication.
    /// Returns the authenticated user's email from JWT claims.
    /// </summary>
    /// <returns>
    /// 200 OK: Authentication successful with user email
    /// 401 Unauthorized: No token provided, invalid token, or expired token
    /// </returns>
    [HttpGet("protected")]
    [Authorize]
    public ActionResult<ApiResponse<object>> ProtectedEndpoint()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Ok(ApiResponse<object>.SuccessResult(new
        {
            Message = "You are authenticated!",
            Email = userEmail,
            UserId = userId
        }));
    }
}
