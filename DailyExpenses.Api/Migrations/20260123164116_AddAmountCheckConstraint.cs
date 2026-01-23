using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyExpenses.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAmountCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "amount_positive",
                table: "budgets",
                sql: "amount > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "amount_positive",
                table: "budgets");
        }
    }
}
