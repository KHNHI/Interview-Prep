using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StandaloneQuizQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizQuestions_Questions_QuestionId",
                table: "QuizQuestions");

            migrationBuilder.AlterColumn<Guid>(
                name: "QuestionId",
                table: "QuizQuestions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<string>(
                name: "ExplanationEn",
                table: "QuizQuestions",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "QuizQuestions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CodeSnippet",
                table: "QuizQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContextEn",
                table: "QuizQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CorrectOptionId",
                table: "QuizQuestions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Difficulty",
                table: "QuizQuestions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPro",
                table: "QuizQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OrderIndex",
                table: "QuizQuestions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleEn",
                table: "QuizQuestions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleVi",
                table: "QuizQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuizQuestions_Questions_QuestionId",
                table: "QuizQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuizQuestions_Questions_QuestionId",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "CodeSnippet",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "ContextEn",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "CorrectOptionId",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "IsPro",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "OrderIndex",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "TitleEn",
                table: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "TitleVi",
                table: "QuizQuestions");

            migrationBuilder.AlterColumn<Guid>(
                name: "QuestionId",
                table: "QuizQuestions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ExplanationEn",
                table: "QuizQuestions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_QuizQuestions_Questions_QuestionId",
                table: "QuizQuestions",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
