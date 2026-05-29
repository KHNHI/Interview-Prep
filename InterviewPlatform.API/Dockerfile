FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

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
ENTRYPOINT ["dotnet", "InterviewPlatform.API.dll"]
