namespace InterviewPlatform.Application.Common.Exceptions;

public class EmailNotVerifiedException : Exception
{
    public EmailNotVerifiedException(string message = "Email not verified.") : base(message) { }
}
