using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SystemDesignReadingContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeepDiveEn",
                table: "SystemDesignCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HighLevelDesignEn",
                table: "SystemDesignCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrderIndex",
                table: "SystemDesignCases",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OverviewEn",
                table: "SystemDesignCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "SystemDesignCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string[]>(
                name: "Tags",
                table: "SystemDesignCases",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<string>(
                name: "TradeoffsEn",
                table: "SystemDesignCases",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeepDiveEn",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "HighLevelDesignEn",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "OrderIndex",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "OverviewEn",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "SystemDesignCases");

            migrationBuilder.DropColumn(
                name: "TradeoffsEn",
                table: "SystemDesignCases");
        }
    }
}
