using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;
using InterviewPlatform.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace InterviewPlatform.Infrastructure.Services;

// Sends real email via Amazon SES. Used in production (Email:Provider = "ses").
// Credentials come from the default AWS chain — the EC2 instance role in prod,
// or your local `aws configure` profile. The From address must be a SES-verified
// identity, and (until you leave the SES sandbox) recipients must be verified too.
public class SesEmailService : IEmailService
{
    private readonly IAmazonSimpleEmailServiceV2 _ses;
    private readonly string _fromAddress;

    public SesEmailService(IAmazonSimpleEmailServiceV2 ses, IConfiguration config)
    {
        _ses = ses;
        _fromAddress = config["Email:FromAddress"]
            ?? throw new InvalidOperationException("Email:FromAddress is not configured.");
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var request = new SendEmailRequest
        {
            FromEmailAddress = _fromAddress,
            Destination = new Destination { ToAddresses = new List<string> { toEmail } },
            Content = new EmailContent
            {
                Simple = new Message
                {
                    Subject = new Content { Data = subject },
                    Body = new Body { Html = new Content { Data = htmlBody } }
                }
            }
        };

        await _ses.SendEmailAsync(request, ct);
    }
}
