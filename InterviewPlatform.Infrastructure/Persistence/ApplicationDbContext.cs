using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InterviewPlatform.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<UserQuizAttempt> UserQuizAttempts => Set<UserQuizAttempt>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<SystemDesignCase> SystemDesignCases => Set<SystemDesignCase>();
    public DbSet<SystemDesignAttempt> SystemDesignAttempts => Set<SystemDesignAttempt>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(builder);
    }
}
