using InterviewPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterviewPlatform.Infrastructure.Persistence.Configurations;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.HasKey(up => new { up.UserId, up.QuestionId });
        builder.Property(up => up.Status).HasConversion<string>();
        builder.HasIndex(up => up.UserId);
    }
}
