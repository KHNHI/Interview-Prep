using InterviewPlatform.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace InterviewPlatform.Infrastructure.Services;

// Sends email over SMTP. Works with any SMTP provider — Brevo, SendGrid, Gmail,
// Mailgun, etc. — just point the config at their host/credentials. Selected when
// Email:Provider = "smtp".
public class SmtpEmailService : IEmailService
{
    private readonly string _host;
    private readonly int    _port;
    private readonly string _user;
    private readonly string _password;
    private readonly string _fromAddress;
    private readonly string _fromName;

    public SmtpEmailService(IConfiguration config)
    {
        _host = config["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("Email:Smtp:Host is not configured.");
        _port = int.TryParse(config["Email:Smtp:Port"], out var p) ? p : 587;
        _user     = config["Email:Smtp:User"] ?? "";
        _password = config["Email:Smtp:Password"] ?? "";
        _fromAddress = config["Email:FromAddress"]
            ?? throw new InvalidOperationException("Email:FromAddress is not configured.");
        _fromName = config["Email:FromName"] ?? "InterviewPrep";
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient { Timeout = 10000 }; // 10s — fail fast instead of hanging ~2 min
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls, ct);
        if (!string.IsNullOrEmpty(_user))
            await client.AuthenticateAsync(_user, _password, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}
