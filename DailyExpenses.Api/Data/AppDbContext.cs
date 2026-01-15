using Microsoft.EntityFrameworkCore;

namespace DailyExpenses.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSets will be added in Story 1.3+ (Users, Expenses, Budgets, Goals)

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Fluent API configuration will be added in Story 1.3+
        // Entity relationships, indexes, constraints configured here
    }
}
