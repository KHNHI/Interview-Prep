using System.Security.Cryptography;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace InterviewPlatform.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private readonly IApplicationDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;

    public RegisterCommandHandler(IApplicationDbContext db, IEmailService email, IConfiguration config)
    {
        _db = db;
        _email = email;
        _config = config;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email, ct);
        if (exists) throw new UnauthorizedException("Email already registered.");

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

        var user = new User
        {
            Email                           = request.Email,
            Name                            = request.Name,
            PasswordHash                    = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsEmailVerified                 = false,
            EmailVerificationToken          = token,
            EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var baseUrl = (_config["App:FrontendBaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var link = $"{baseUrl}/verify-email?token={token}";
        await _email.SendAsync(
            user.Email,
            "Verify your InterviewPrep account",
            EmailTemplates.Verification(user.Name, link),
            ct);

        return new RegisterResult(user.Email,
            "Account created. Check your email for a verification link to activate your account.");
    }
}
