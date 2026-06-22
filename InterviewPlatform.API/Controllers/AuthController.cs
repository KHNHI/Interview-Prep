using InterviewPlatform.Application.Features.Auth.Commands.Login;
using InterviewPlatform.Application.Features.Auth.Commands.Register;
using InterviewPlatform.Application.Features.Auth.Commands.ResendVerification;
using InterviewPlatform.Application.Features.Auth.Commands.VerifyEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]   // 5 requests/min per IP on register + login
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Activate an account from the link in the verification email.</summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Re-send the verification email for an unverified account.</summary>
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true, data = (object?)null });
    }
}
