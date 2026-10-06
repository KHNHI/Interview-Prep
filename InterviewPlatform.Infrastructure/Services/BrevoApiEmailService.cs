using System.Net.Http.Json;
using InterviewPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterviewPlatform.Infrastructure.Services;

// Sends email via Brevo's HTTP API over HTTPS (port 443), instead of SMTP.
// Many PaaS (Railway, Render, etc.) block outbound SMTP ports (25/465/587),
// so SMTP times out — the HTTP API avoids that entirely.
// Selected when Email:Provider = "brevo".
public class BrevoApiEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly string _fromAddress;
    private readonly string _fromName;

    public BrevoApiEmailService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://api.brevo.com/");
        _http.DefaultRequestHeaders.Add("api-key",
            config["Email:Brevo:ApiKey"]
            ?? throw new InvalidOperationException("Email:Brevo:ApiKey is not configured."));

        _fromAddress = config["Email:FromAddress"]
            ?? throw new InvalidOperationException("Email:FromAddress is not configured.");
        _fromName = config["Email:FromName"] ?? "InterviewPrep";
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var payload = new
        {
            sender      = new { name = _fromName, email = _fromAddress },
            to          = new[] { new { email = toEmail } },
            subject     = subject,
            htmlContent = htmlBody
        };

        var response = await _http.PostAsJsonAsync("v3/smtp/email", payload, ct);
        response.EnsureSuccessStatusCode();
    }
}
