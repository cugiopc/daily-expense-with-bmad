using Microsoft.EntityFrameworkCore;
using DailyExpenses.Api.Models;

namespace DailyExpenses.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            // Table name: users (lowercase plural per project-context)
            entity.ToTable("users");
            
            // Primary key configuration
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("user_id")
                .HasDefaultValueSql("gen_random_uuid()");
            
            // Email configuration
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();
            
            // Unique index on email
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            // CRITICAL FIX: Add index on RefreshToken for fast token refresh queries
            // Without this, GetByRefreshTokenAsync does full table scan on every refresh
            // Performance degrades linearly with user count (100ms+ per refresh at 1M users)
            entity.HasIndex(e => e.RefreshToken)
                .IsUnique(false) // Multiple users can have null, but active tokens should be unique
                .HasDatabaseName("idx_user_refresh_token");
            
            // PasswordHash configuration
            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(100) // BCrypt hash is 60 chars, giving buffer
                .IsRequired();
            
            // RefreshToken configuration
            entity.Property(e => e.RefreshToken)
                .HasColumnName("refresh_token")
                .HasMaxLength(255)
                .IsRequired(false);
            
            // RefreshTokenExpiresAt configuration
            entity.Property(e => e.RefreshTokenExpiresAt)
                .HasColumnName("refresh_token_expires_at")
                .HasColumnType("timestamp with time zone")
                .IsRequired(false);
            
            // CreatedAt configuration
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // UpdatedAt configuration
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamp with time zone")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}

