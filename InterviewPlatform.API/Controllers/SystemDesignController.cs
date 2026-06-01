using InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCaseById;
using InterviewPlatform.Application.Features.SystemDesign.Queries.GetSystemDesignCases;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPlatform.API.Controllers;

[ApiController]
[Route("api/system-design")]
public class SystemDesignController : ControllerBase
{
    private readonly IMediator _mediator;
    public SystemDesignController(IMediator mediator) => _mediator = mediator;

    /// <summary>List system design study cases (reading reference).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? difficulty, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSystemDesignCasesQuery(difficulty), ct);
        return Ok(new { success = true, data = result });
    }

    /// <summary>Get a single system design case with full worked-answer content.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSystemDesignCaseByIdQuery(id), ct);
        return Ok(new { success = true, data = result });
    }
}
