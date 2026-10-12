using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InterviewPlatform.Application.Features.Flashcards;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/flashcards")]
[Authorize]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardsService _service;
    public FlashcardsController(IFlashcardsService service) => _service = service;

    /// <summary>Return cards due for review today (max 20, deduplicated by question).</summary>
    [HttpGet]
    public async Task<IActionResult> GetCards(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _service.GetFlashcardsAsync(new GetFlashcardsRequest(userId), ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Submit a SM-2 rating (0-5) for a flashcard attempt.</summary>
    [HttpPost("{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewRequest body, CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _service.ReviewFlashcardAsync(new ReviewFlashcardRequest(id, userId, body.Rating), ct);
        return Ok(new { success = true, data = result });
    }
}

public record ReviewRequest(int Rating);



