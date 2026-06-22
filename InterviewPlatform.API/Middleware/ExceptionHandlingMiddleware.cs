using FluentValidation;
using InterviewPlatform.Application.Common.Exceptions;
using System.Net;
using System.Text.Json;

namespace InterviewPlatform.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(ctx, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext ctx, Exception ex)
    {
        var (status, message) = ex switch
        {
            ValidationException ve => (HttpStatusCode.BadRequest,
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            NotFoundException nfe => (HttpStatusCode.NotFound, nfe.Message),
            EmailNotVerifiedException enve => (HttpStatusCode.Forbidden, enve.Message),
            UnauthorizedException ue => (HttpStatusCode.Unauthorized, ue.Message),
            QuotaExceededException qe => (HttpStatusCode.TooManyRequests, qe.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
        };

        if (status == HttpStatusCode.InternalServerError)
            _logger.LogError(ex, "Unhandled exception");

        ctx.Response.StatusCode = (int)status;
        ctx.Response.ContentType = "application/json";

        var body = JsonSerializer.Serialize(new { success = false, error = message, data = (object?)null });
        await ctx.Response.WriteAsync(body);
    }
}
