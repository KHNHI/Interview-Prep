using Amazon.SimpleEmailV2;
using InterviewPlatform.Application.Interfaces;
using InterviewPlatform.Infrastructure.Persistence;
using InterviewPlatform.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

// DataSeeder is registered here so Program.cs can resolve it

namespace InterviewPlatform.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<ApplicationDbContext>(opts =>
            opts.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(p => p.GetRequiredService<ApplicationDbContext>());

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(config.GetConnectionString("Redis")!));

        services.AddScoped<ICacheService, CacheService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<QuotaService>();
        services.AddScoped<IAiFeedbackService, AiFeedbackService>();

        services.AddHttpClient<AiFeedbackService>();
        services.AddScoped<DataSeeder>();

        // Email provider by config: "ses" (Amazon SES), "smtp" (Brevo/SendGrid/
        // Gmail/etc.), or "console" (local dev — logs the link, zero setup).
        var emailProvider = config["Email:Provider"]?.Trim().ToLowerInvariant() ?? "console";
        if (emailProvider == "ses")
        {
            var region = config["AWS:Region"] ?? "ap-southeast-2";
            services.AddSingleton<IAmazonSimpleEmailServiceV2>(_ =>
                new AmazonSimpleEmailServiceV2Client(Amazon.RegionEndpoint.GetBySystemName(region)));
            services.AddScoped<IEmailService, SesEmailService>();
        }
        else if (emailProvider == "smtp")
        {
            services.AddScoped<IEmailService, SmtpEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, ConsoleEmailService>();
        }

        return services;
    }
}
