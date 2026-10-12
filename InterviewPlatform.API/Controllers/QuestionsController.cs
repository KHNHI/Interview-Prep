using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionsService _service;
    public QuestionsController(IQuestionsService service) => _service = service;

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
        var result = await _service.GetQuestionsAsync(new GetQuestionsRequest(category, difficulty, lang, page, pageSize), ct);

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
        var result = await _service.GetQuestionByIdAsync(new GetQuestionByIdRequest(id, lang), ct);
        return Ok(new { success = true, data = result });
    }
}



