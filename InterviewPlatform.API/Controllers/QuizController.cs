using InterviewPlatform.Application.Features.Quiz.Queries.GetQuizQuestions;
using MediatR;
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
        var result = await _mediator.Send(
            new GetQuizQuestionsQuery(category, difficulty, capped), ct);

        return Ok(new { success = true, data = result });
    }
}
