using DailyExpenses.Api.Models;

namespace DailyExpenses.Api.Repositories;

/// <summary>
/// Repository interface for User entity data access operations.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Retrieves a user by their email address (case-insensitive comparison).
    /// </summary>
    /// <param name="email">The email address to search for.</param>
    /// <returns>The user if found, null otherwise.</returns>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Creates a new user in the database.
    /// </summary>
    /// <param name="user">The user entity to create.</param>
    /// <returns>The created user with generated ID.</returns>
    /// <exception cref="InvalidOperationException">Thrown when database constraint is violated (e.g., duplicate email).</exception>
    Task<User> CreateAsync(User user);

    /// <summary>
    /// Checks if a user with the given email exists in the database (case-insensitive comparison).
    /// </summary>
    /// <param name="email">The email address to check.</param>
    /// <returns>True if a user with this email exists, false otherwise.</returns>
    Task<bool> EmailExistsAsync(string email);

    /// <summary>
    /// Updates an existing user in the database.
    /// </summary>
    /// <param name="user">The user entity with updated values.</param>
    /// <returns>The updated user entity.</returns>
    /// <exception cref="InvalidOperationException">Thrown when database update fails.</exception>
    Task<User> UpdateAsync(User user);

    /// <summary>
    /// Retrieves a user by their refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token to search for.</param>
    /// <returns>The user if found, null otherwise.</returns>
    Task<User?> GetByRefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Retrieves a user by their ID.
    /// </summary>
    /// <param name="id">The user ID to search for.</param>
    /// <returns>The user if found, null otherwise.</returns>
    Task<User?> GetByIdAsync(Guid id);
}
