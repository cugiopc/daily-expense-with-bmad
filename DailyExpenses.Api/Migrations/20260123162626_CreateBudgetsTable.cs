using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyExpenses.Api.Migrations
{
    /// <inheritdoc />
    public partial class CreateBudgetsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "budgets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    month = table.Column<DateTime>(type: "date", nullable: false, comment: "First day of the month (e.g., 2026-01-01)"),
                    amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_budgets", x => x.id);
                    table.ForeignKey(
                        name: "FK_budgets_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_budgets_user_id",
                table: "budgets",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "unique_user_month_budget",
                table: "budgets",
                columns: new[] { "user_id", "month" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "budgets");
        }
    }
}
