using InterviewPlatform.Application.Services;
using FluentAssertions;
using InterviewPlatform.Application.Features.Auth;

namespace InterviewPlatform.Tests.Unit;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    private static RegisterRequest WithPassword(string password) =>
        new("user@example.com", "Test User", password);

    [Theory]
    [InlineData("Short1!")]        // 7 chars — too short
    [InlineData("alllower1!")]     // no uppercase
    [InlineData("NoSpecial123")]   // no special character
    [InlineData("")]               // empty
    public void Rejects_weak_passwords(string password)
    {
        _validator.Validate(WithPassword(password)).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("Strong1!")]       // 8 chars, uppercase, special
    [InlineData("MyP@ssw0rd")]
    public void Accepts_strong_passwords(string password)
    {
        _validator.Validate(WithPassword(password)).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Rejects_invalid_email()
    {
        _validator.Validate(new RegisterRequest("not-an-email", "Test User", "Strong1!"))
            .IsValid.Should().BeFalse();
    }

    [Fact]
    public void Rejects_short_name()
    {
        _validator.Validate(new RegisterRequest("user@example.com", "A", "Strong1!"))
            .IsValid.Should().BeFalse();
    }
}



