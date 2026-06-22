using InterviewPlatform.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace InterviewPlatform.Infrastructure.Services;

// Local-dev email "sender": just logs the message (including the verification link)
// to the server console so you can test the flow without configuring SES.
// Selected when Email:Provider is anything other than "ses" (the default).
public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger) => _logger = logger;

    public Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "\n===== [DEV EMAIL] =====\nTo: {To}\nSubject: {Subject}\n{Body}\n=======================",
            toEmail, subject, htmlBody);
        return Task.CompletedTask;
    }
}
