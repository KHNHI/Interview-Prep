FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
# Listen on 8080 (non-privileged port so we can run as the non-root `app` user).
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["InterviewPlatform.API/InterviewPlatform.API.csproj", "InterviewPlatform.API/"]
COPY ["InterviewPlatform.Application/InterviewPlatform.Application.csproj", "InterviewPlatform.Application/"]
COPY ["InterviewPlatform.Infrastructure/InterviewPlatform.Infrastructure.csproj", "InterviewPlatform.Infrastructure/"]
COPY ["InterviewPlatform.Domain/InterviewPlatform.Domain.csproj", "InterviewPlatform.Domain/"]
RUN dotnet restore "InterviewPlatform.API/InterviewPlatform.API.csproj"
COPY . .
WORKDIR "/src/InterviewPlatform.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Run as the built-in non-root user shipped in the .NET 8 runtime image.
USER app
ENTRYPOINT ["dotnet", "InterviewPlatform.API.dll"]
