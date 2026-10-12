using InterviewPlatform.Application.Features.SystemDesign;
using InterviewPlatform.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/system-design")]
public class SystemDesignController : ControllerBase
{
    private readonly ISystemDesignService _service;
    public SystemDesignController(ISystemDesignService service) => _service = service;

    /// <summary>List system design study cases (reading reference).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? difficulty, CancellationToken ct)
    {
        var result = await _service.GetSystemDesignCasesAsync(new GetSystemDesignCasesRequest(difficulty), ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Get a single system design case with full worked-answer content.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _service.GetSystemDesignCaseByIdAsync(new GetSystemDesignCaseByIdRequest(id), ct);
        return Ok(new { success = true, data = result });
    }
}



