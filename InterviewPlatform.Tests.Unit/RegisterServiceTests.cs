using FluentAssertions;
using FluentValidation;
using InterviewPlatform.Application.Features.Auth;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Application.Services;
using InterviewPlatform.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace InterviewPlatform.Tests.Unit;

public class RegisterServiceTests
{
    [Fact]
    public async Task Weak_password_is_rejected_before_saving_or_sending_email()
    {
        using var db = TestDb.Create();
        var email = new Mock<IEmailService>(MockBehavior.Strict);
        var service = new AuthService(db, Mock.Of<ITokenService>(), email.Object,
            new ConfigurationBuilder().Build(), NullLogger<AuthService>.Instance);

        var act = () => service.RegisterAsync(new RegisterRequest("test@example.com", "Test", "weak"), default);

        await act.Should().ThrowAsync<ValidationException>();
        db.Users.Should().BeEmpty();
        email.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Email_failure_still_creates_unverified_account()
    {
        using var db = TestDb.Create();
        var email = new Mock<IEmailService>();
        email.Setup(x => x.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Provider unavailable"));
        var service = new AuthService(db, Mock.Of<ITokenService>(), email.Object,
            new ConfigurationBuilder().Build(), NullLogger<AuthService>.Instance);

        var result = await service.RegisterAsync(new RegisterRequest("test@example.com", "Test", "Strong1!"), default);

        result.Email.Should().Be("test@example.com");
        db.Users.Single().IsEmailVerified.Should().BeFalse();
        db.Users.Single().EmailVerificationToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_again_updates_pending_account_and_reissues_token()
    {
        using var db = TestDb.Create();
        var user = new User { Email = "test@example.com", Name = "Old", EmailVerificationToken = "old-token" };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        var email = new Mock<IEmailService>();
        var service = new AuthService(db, Mock.Of<ITokenService>(), email.Object,
            new ConfigurationBuilder().Build(), NullLogger<AuthService>.Instance);

        await service.RegisterAsync(new RegisterRequest(user.Email, "Updated", "Strong1!"), default);

        db.Users.Should().ContainSingle();
        user.Name.Should().Be("Updated");
        user.EmailVerificationToken.Should().NotBe("old-token");
        BCrypt.Net.BCrypt.Verify("Strong1!", user.PasswordHash).Should().BeTrue();
        email.Verify(x => x.SendAsync(user.Email, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
