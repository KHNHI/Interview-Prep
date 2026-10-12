using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]   // 5 requests/min per IP on register + login
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;
    public AuthController(IAuthService service) => _service = service;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest command, CancellationToken ct)
    {
        var result = await _service.RegisterAsync(command, ct);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest command, CancellationToken ct)
    {
        var result = await _service.LoginAsync(command, ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Activate an account from the link in the verification email.</summary>
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest command, CancellationToken ct)
    {
        var result = await _service.VerifyEmailAsync(command, ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Re-send the verification email for an unverified account.</summary>
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest command, CancellationToken ct)
    {
        await _service.ResendVerificationAsync(command, ct);
        return Ok(new { success = true, data = (object?)null });
    }
}



