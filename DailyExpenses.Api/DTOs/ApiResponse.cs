namespace DailyExpenses.Api.DTOs;

/// <summary>
/// Standard API response wrapper for all endpoints.
/// All endpoints MUST return this format per project-context.md requirements.
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// The data payload. Contains the actual response object on success, or error details on failure.
    /// </summary>
    public T Data { get; set; }

    /// <summary>
    /// Indicates whether the operation was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Private constructor - use static factory methods instead.
    /// </summary>
    private ApiResponse(T data, bool success)
    {
        Data = data;
        Success = success;
    }

    /// <summary>
    /// Creates a successful API response.
    /// </summary>
    /// <param name="data">The data to return</param>
    /// <returns>ApiResponse with Success = true</returns>
    public static ApiResponse<T> SuccessResult(T data)
    {
        return new ApiResponse<T>(data, true);
    }

    /// <summary>
    /// Creates an error API response.
    /// </summary>
    /// <param name="errorData">Error details (typically an object with "message" and "code" properties)</param>
    /// <returns>ApiResponse with Success = false</returns>
    public static ApiResponse<T> ErrorResult(T errorData)
    {
        return new ApiResponse<T>(errorData, false);
    }
}

/// <summary>
/// Standard error response format for failed API requests.
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Human-readable error message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Machine-readable error code (e.g., "VALIDATION_ERROR", "UNAUTHORIZED").
    /// </summary>
    public string Code { get; set; } = string.Empty;

    public ErrorResponse(string message, string code)
    {
        Message = message;
        Code = code;
    }
}
