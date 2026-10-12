using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using InterviewPlatform.Application.Features.Progress;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _service;
    public ProgressController(IProgressService service) => _service = service;

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _service.GetDashboardAsync(new GetDashboardRequest(userId), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("radar")]
    public async Task<IActionResult> GetRadar(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
            return Unauthorized();

        var result = await _service.GetRadarAsync(new GetRadarRequest(userId), ct);
        return Ok(new { success = true, data = result });
    }
}



