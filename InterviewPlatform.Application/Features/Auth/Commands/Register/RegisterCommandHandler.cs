using System.Security.Cryptography;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InterviewPlatform.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private readonly IApplicationDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext db,
        IEmailService email,
        IConfiguration config,
        ILogger<RegisterCommandHandler> logger)
    {
        _db = db;
        _email = email;
        _config = config;
        _logger = logger;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var expiresAt = DateTime.UtcNow.AddHours(24);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);

        if (user is not null && user.IsEmailVerified)
            throw new UnauthorizedException("Email already registered.");

        if (user is null)
        {
            user = new User { Email = request.Email };
            _db.Users.Add(user);
        }
        // else: the email exists but is UNVERIFIED (unclaimed) — re-registering just
        // updates the pending account and re-issues a verification link, instead of
        // failing with "already registered".

        user.Name = request.Name;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.IsEmailVerified = false;
        user.EmailVerificationToken = token;
        user.EmailVerificationTokenExpiresAt = expiresAt;

        await _db.SaveChangesAsync(ct);

        // Send the email but DON'T fail registration if the provider errors — the
        // account is created and the user can request a new link via "resend".
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
            _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
        }

        return new RegisterResult(user.Email,
            "Account created. Check your email for a verification link to activate your account.");
    }
}
