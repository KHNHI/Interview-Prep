namespace InterviewPlatform.Application.Common.Exceptions;

public class AiUnavailableException : Exception
{
    public AiUnavailableException(string message = "AI feedback is temporarily unavailable. Your answer has not been lost. Try again later or read the reference answer.")
        : base(message) { }
}
