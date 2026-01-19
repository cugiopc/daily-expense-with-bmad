using DailyExpenses.Api.Data;
using DailyExpenses.Api.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DailyExpenses.Api.Tests;

/// <summary>
/// Integration tests for Expense entity.
/// Tests database operations, indexes, foreign key constraints, and data types.
/// </summary>
public class ExpenseEntityTests : IDisposable
{
    private readonly AppDbContext _context;

    public ExpenseEntityTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CanInsertExpenseRecord()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 49.99m,
            Note = "Lunch at restaurant",
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Assert
        var savedExpense = await _context.Expenses.FindAsync(expense.Id);
        Assert.NotNull(savedExpense);
        Assert.Equal(expense.UserId, savedExpense.UserId);
        Assert.Equal(49.99m, savedExpense.Amount);
        Assert.Equal("Lunch at restaurant", savedExpense.Note);
        Assert.Equal(expense.Date, savedExpense.Date);
    }

    [Fact]
    public async Task CanQueryExpensesByUserId()
    {
        // Arrange
        var user1 = new User
        {
            Id = Guid.NewGuid(),
            Email = "user1@example.com",
            PasswordHash = "hash1",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var user2 = new User
        {
            Id = Guid.NewGuid(),
            Email = "user2@example.com",
            PasswordHash = "hash2",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.AddRange(user1, user2);

        var expense1 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user1.Id,
            Amount = 10.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var expense2 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user1.Id,
            Amount = 20.00m,
            Date = DateTime.UtcNow.Date.AddDays(-1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var expense3 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user2.Id,
            Amount = 30.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Expenses.AddRange(expense1, expense2, expense3);
        await _context.SaveChangesAsync();

        // Act
        var user1Expenses = await _context.Expenses
            .Where(e => e.UserId == user1.Id)
            .ToListAsync();

        // Assert
        Assert.Equal(2, user1Expenses.Count);
        Assert.All(user1Expenses, e => Assert.Equal(user1.Id, e.UserId));
    }

    [Fact]
    public async Task ExpensesOrderedByDateDescending()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var today = DateTime.UtcNow.Date;
        var expense1 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 10.00m,
            Date = today.AddDays(-2),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var expense2 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 20.00m,
            Date = today,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var expense3 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 30.00m,
            Date = today.AddDays(-1),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Expenses.AddRange(expense1, expense2, expense3);
        await _context.SaveChangesAsync();

        // Act - Query ordered by date DESC (newest first)
        var expenses = await _context.Expenses
            .Where(e => e.UserId == user.Id)
            .OrderByDescending(e => e.Date)
            .ToListAsync();

        // Assert - Should be in order: today, yesterday, 2 days ago
        Assert.Equal(3, expenses.Count);
        Assert.Equal(today, expenses[0].Date);
        Assert.Equal(today.AddDays(-1), expenses[1].Date);
        Assert.Equal(today.AddDays(-2), expenses[2].Date);
    }

    [Fact]
    public async Task RecentExpensesOrderedByCreatedAtDescending()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var now = DateTime.UtcNow;
        var expense1 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 10.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = now.AddMinutes(-10),
            UpdatedAt = now.AddMinutes(-10)
        };
        var expense2 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 20.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = now,
            UpdatedAt = now
        };
        var expense3 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 30.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = now.AddMinutes(-5),
            UpdatedAt = now.AddMinutes(-5)
        };
        _context.Expenses.AddRange(expense1, expense2, expense3);
        await _context.SaveChangesAsync();

        // Act - Query ordered by CreatedAt DESC (most recent first)
        var expenses = await _context.Expenses
            .Where(e => e.UserId == user.Id)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();

        // Assert - Should be in order: now, 5 min ago, 10 min ago
        Assert.Equal(3, expenses.Count);
        Assert.Equal(expense2.Id, expenses[0].Id);
        Assert.Equal(expense3.Id, expenses[1].Id);
        Assert.Equal(expense1.Id, expenses[2].Id);
    }

    [Fact(Skip = "In-memory database does not enforce foreign key constraints. Test with real PostgreSQL database instead.")]
    public async Task ForeignKeyConstraintEnforced()
    {
        // Arrange
        var nonExistentUserId = Guid.NewGuid();
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = nonExistentUserId,
            Amount = 49.99m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act & Assert
        _context.Expenses.Add(expense);
        await Assert.ThrowsAnyAsync<Exception>(() => _context.SaveChangesAsync());
    }

    [Fact]
    public async Task CascadeDeleteWorks()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var expense1 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 10.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var expense2 = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 20.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Expenses.AddRange(expense1, expense2);
        await _context.SaveChangesAsync();

        // Act - Delete the user
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        // Assert - Expenses should be deleted automatically
        var remainingExpenses = await _context.Expenses
            .Where(e => e.UserId == user.Id)
            .ToListAsync();
        Assert.Empty(remainingExpenses);
    }

    [Fact]
    public async Task AmountPrecisionPreserved()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 123.45m, // DECIMAL(10,2)
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Assert
        var savedExpense = await _context.Expenses.FindAsync(expense.Id);
        Assert.NotNull(savedExpense);
        Assert.Equal(123.45m, savedExpense.Amount);
    }

    [Fact]
    public async Task DateOnlyStoredCorrectly()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var dateOnly = new DateTime(2026, 1, 18, 0, 0, 0, DateTimeKind.Utc);
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 50.00m,
            Date = dateOnly,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Assert
        var savedExpense = await _context.Expenses.FindAsync(expense.Id);
        Assert.NotNull(savedExpense);
        Assert.Equal(dateOnly.Date, savedExpense.Date.Date);
    }

    [Fact]
    public async Task NoteCanBeNull()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 25.00m,
            Note = null, // Note is optional
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Assert
        var savedExpense = await _context.Expenses.FindAsync(expense.Id);
        Assert.NotNull(savedExpense);
        Assert.Null(savedExpense.Note);
    }

    [Fact]
    public async Task CanLoadUserNavigationProperty()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(user);

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Amount = 30.00m,
            Date = DateTime.UtcNow.Date,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Act - Load expense with User navigation property
        var loadedExpense = await _context.Expenses
            .Include(e => e.User)
            .FirstAsync(e => e.Id == expense.Id);

        // Assert
        Assert.NotNull(loadedExpense);
        Assert.NotNull(loadedExpense.User);
        Assert.Equal(user.Email, loadedExpense.User.Email);
    }
}
