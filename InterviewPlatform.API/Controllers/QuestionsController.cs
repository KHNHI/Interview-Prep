using InterviewPlatform.Application.Features.Questions;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/questions")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionsService _service;
    public QuestionsController(IQuestionsService service) => _service = service;

    [HttpGet("feedback-status")]
    public IActionResult FeedbackStatus([FromServices] IAnswerFeedbackService feedback) =>
        Ok(new { success = true, data = feedback.GetStatus() });

    [HttpPost("{id:guid}/feedback")]
    [Authorize]
    [EnableRateLimiting("ai-feedback")]
    [RequestSizeLimit(20_000)]
    public async Task<IActionResult> Feedback(Guid id, [FromBody] AnswerFeedbackRequest request,
        [FromServices] IAnswerFeedbackService feedback, CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();
        var result = await feedback.ReviewAsync(id, userId, request, ct);
        Response.Headers.CacheControl = "no-store";
        return Ok(new { success = true, data = result });
    }

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



