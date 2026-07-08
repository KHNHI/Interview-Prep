using System.Security.Cryptography;
using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InterviewPlatform.Application.Features.Auth.Commands.ResendVerification;

public class ResendVerificationCommandHandler : IRequestHandler<ResendVerificationCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<ResendVerificationCommandHandler> _logger;

    public ResendVerificationCommandHandler(
        IApplicationDbContext db,
        IEmailService email,
        IConfiguration config,
        ILogger<ResendVerificationCommandHandler> logger)
    {
        _db = db;
        _email = email;
        _config = config;
        _logger = logger;
    }

    public async Task<Unit> Handle(ResendVerificationCommand request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);

        // Only act for an unverified, existing account — but always return success
        // so we don't reveal whether an email is registered (account enumeration).
        if (user is not null && !user.IsEmailVerified)
        {
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
            user.EmailVerificationToken = token;
            user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
            await _db.SaveChangesAsync(ct);

            var baseUrl = (_config["App:FrontendBaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var link = $"{baseUrl}/verify-email?token={token}";
            try
            {
                await _email.SendAsync(
                    user.Email,
                    "Verify your InterviewPrep account",
                    EmailTemplates.Verification(user.Name, link),
                    ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
            }
        }

        return Unit.Value;
    }
}
