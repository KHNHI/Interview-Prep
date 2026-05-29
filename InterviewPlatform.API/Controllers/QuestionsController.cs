using InterviewPlatform.Application.Features.Questions.Queries.GetQuestions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public QuestionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] string lang = "en",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetQuestionsQuery(category, difficulty, lang, page, pageSize), ct);
        return Ok(new { success = true, data = result.Items, meta = new { page, total = result.Total } });
    }
}
