using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InterviewPlatform.Application.Features.Quiz;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _service;
    public QuizController(IQuizService service) => _service = service;

    /// <summary>Return N random quiz questions, optionally filtered by category and difficulty.</summary>
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] int count = 15,
        CancellationToken ct = default)
    {
        var capped = Math.Clamp(count, 5, 50);
        var result = await _service.GetQuizQuestionsAsync(new GetQuizQuestionsRequest(category, difficulty, capped), ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Save quiz results for authenticated users.</summary>
    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitQuizBody body, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var command = new SubmitQuizRequest(
            userId,
            body.Answers.Select(a => new QuizAnswerItem(a.QuizQuestionId, a.SelectedOptionId, a.TimeTakenMs)).ToList()
        );

        var result = await _service.SubmitQuizAsync(command, ct);
        return Ok(new { success = true, data = result });
    }
}

public record SubmitAnswerDto(Guid QuizQuestionId, string? SelectedOptionId, int TimeTakenMs);
public record SubmitQuizBody(List<SubmitAnswerDto> Answers);



