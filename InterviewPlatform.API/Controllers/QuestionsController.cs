using InterviewPlatform.Application.Features.Questions.Queries.GetQuestionById;
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

    /// <summary>List questions with optional filters.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] string lang = "en",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetQuestionsQuery(category, difficulty, lang, page, pageSize), ct);

        return Ok(new
        {
            success = true,
            data    = result.Items,
            meta    = new { page, pageSize, total = result.Total }
        });
    }

    /// <summary>Get a single question with full answer.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        [FromQuery] string lang = "en",
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetQuestionByIdQuery(id, lang), ct);
        return Ok(new { success = true, data = result });
    }
}
