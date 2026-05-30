using MediatR;

namespace InterviewPlatform.Application.Features.Questions.Queries.GetQuestionById;

public record GetQuestionByIdQuery(Guid Id, string Lang = "en") : IRequest<QuestionDetailDto>;
