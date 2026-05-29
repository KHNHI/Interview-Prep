namespace InterviewPlatform.Application.Common.Exceptions;

public class QuotaExceededException : Exception
{
    public QuotaExceededException(string feature)
        : base($"Daily quota exceeded for feature: {feature}.") { }
}
