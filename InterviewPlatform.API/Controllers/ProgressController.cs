using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InterviewPlatform.Application.Features.Progress.Queries.GetDashboard;
using InterviewPlatform.Application.Features.Progress.Queries.GetRadar;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProgressController(IMediator mediator) => _mediator = mediator;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _mediator.Send(new GetDashboardQuery(userId), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("radar")]
    public async Task<IActionResult> GetRadar(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _mediator.Send(new GetRadarQuery(userId), ct);
        return Ok(new { success = true, data = result });
    }
}
