using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyExpenses.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "idx_user_refresh_token",
                table: "users",
                column: "refresh_token");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_user_refresh_token",
                table: "users");
        }
    }
}
