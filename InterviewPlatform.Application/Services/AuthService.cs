using FluentValidation;
using InterviewPlatform.Application.Common.Exceptions;
using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace InterviewPlatform.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokens;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IApplicationDbContext db, ITokenService tokens, IEmailService email,
        IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _tokens = tokens;
        _email = email;
        _config = config;
        _logger = logger;
    }

    public async Task<RegisterResult> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        await new RegisterRequestValidator().ValidateAndThrowAsync(request, ct);

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

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        if (!user.IsEmailVerified)
            throw new EmailNotVerifiedException("Please verify your email before signing in.");

        return new AuthResult(
            _tokens.GenerateAccessToken(user),
            _tokens.GenerateRefreshToken(),
            user.Id
        );
    }

    public async Task<AuthResult> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == request.Token, ct);

        // Token already consumed but account verified → just issue a session.
        if (user is null)
            throw new UnauthorizedException("Invalid or expired verification link.");

        if (!user.IsEmailVerified)
        {
            if (user.EmailVerificationTokenExpiresAt is null ||
                user.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
                throw new UnauthorizedException("This verification link has expired. Please request a new one.");

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiresAt = null;
            await _db.SaveChangesAsync(ct);
        }

        return new AuthResult(
            _tokens.GenerateAccessToken(user),
            _tokens.GenerateRefreshToken(),
            user.Id
        );
    }

    public async Task ResendVerificationAsync(ResendVerificationRequest request, CancellationToken ct)
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

        return;
    }
}


