using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InterviewPlatform.Application.Features.Quiz.Commands.SubmitQuiz;
using InterviewPlatform.Application.Features.Quiz.Queries.GetQuizQuestions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly IMediator _mediator;
    public QuizController(IMediator mediator) => _mediator = mediator;

    /// <summary>Return N random quiz questions, optionally filtered by category and difficulty.</summary>
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] int count = 15,
        CancellationToken ct = default)
    {
        var capped = Math.Clamp(count, 5, 50);
        var result = await _mediator.Send(new GetQuizQuestionsQuery(category, difficulty, capped), ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Save quiz results for authenticated users.</summary>
    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitQuizRequest body, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var command = new SubmitQuizCommand(
            userId,
            body.Answers.Select(a => new QuizAnswerItem(a.QuizQuestionId, a.SelectedOptionId, a.TimeTakenMs)).ToList()
        );

        var result = await _mediator.Send(command, ct);
        return Ok(new { success = true, data = result });
    }
}

public record SubmitAnswerDto(Guid QuizQuestionId, string? SelectedOptionId, int TimeTakenMs);
public record SubmitQuizRequest(List<SubmitAnswerDto> Answers);
