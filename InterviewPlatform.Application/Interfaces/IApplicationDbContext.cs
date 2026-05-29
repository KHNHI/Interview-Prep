using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Question> Questions { get; }
    DbSet<QuizQuestion> QuizQuestions { get; }
    DbSet<UserProgress> UserProgress { get; }
    DbSet<UserQuizAttempt> UserQuizAttempts { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<SystemDesignCase> SystemDesignCases { get; }
    DbSet<SystemDesignAttempt> SystemDesignAttempts { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
