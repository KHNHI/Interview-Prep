namespace InterviewPlatform.Application.Features.Questions;

public record AnswerFeedbackRequest(string Answer);

public record AnswerFeedback(
    string Summary,
    string[] Strengths,
    string[] Improvements,
    string EnglishFeedback,
    string SampleAnswer,
    string FollowUpQuestion);

public record AnswerFeedbackStatus(bool Available, int DailyLimit, int MaxAnswerLength);
