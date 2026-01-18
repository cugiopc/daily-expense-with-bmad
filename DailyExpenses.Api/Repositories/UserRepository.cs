using DailyExpenses.Api.Data;
using DailyExpenses.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DailyExpenses.Api.Repositories;

/// <summary>
/// Repository implementation for User entity data access operations.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    /// <inheritdoc />
    public async Task<User> CreateAsync(User user)
    {
        try
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }
        catch (DbUpdateException ex)
        {
            // Handle database constraint violations (e.g., duplicate key)
            throw new InvalidOperationException("Failed to create user. The email might already exist or database constraint was violated.", ex);
        }
    }

    /// <inheritdoc />
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    /// <inheritdoc />
    public async Task<User> UpdateAsync(User user)
    {
        try
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException("Failed to update user. Database update error occurred.", ex);
        }
    }

    /// <inheritdoc />
    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        try
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to query user by refresh token", ex);
        }
    }

    /// <inheritdoc />
    public async Task<User?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to query user by ID", ex);
        }
    }
}
