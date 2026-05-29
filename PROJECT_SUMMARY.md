# InterviewPrep — Project Summary

## What Was Built

A production-grade fullstack monorepo for a bilingual (EN/VI) software engineering interview practice platform.

---

## Architecture Overview

```
InterviewPrep/
├── InterviewPlatform.Domain          # Core entities, enums — no dependencies
├── InterviewPlatform.Application     # CQRS handlers, interfaces, validation
├── InterviewPlatform.Infrastructure  # EF Core, Redis, JWT, AI, Stripe
├── InterviewPlatform.API             # ASP.NET Core Web API entry point
├── InterviewPlatform.Tests.Unit      # xUnit unit test project
├── InterviewPlatform.Tests.Integration  # Testcontainers integration tests
└── interview-platform-web            # React 18 + TypeScript frontend
```

The backend follows **Clean Architecture** — dependency rules flow inward only:
```
API → Infrastructure → Application → Domain
```

---

## Backend

### Tech Stack
| Package | Version | Purpose |
|---|---|---|
| .NET / ASP.NET Core | 8 (LTS) | Runtime + Web API |
| Entity Framework Core | 8 | ORM |
| Npgsql | 8 | PostgreSQL provider |
| MediatR | 12 | CQRS pattern |
| FluentValidation | 11 | Input validation pipeline |
| JwtBearer | 8 | JWT authentication |
| StackExchange.Redis | latest | Cache + daily quota |
| Swashbuckle | 6 | Swagger UI |
| BCrypt.Net-Next | 4 | Password hashing |
| Stripe.net | latest | Payment integration |
| xUnit + Moq + FluentAssertions | latest | Unit testing |
| Testcontainers | latest | Integration testing |

### Domain Entities
- `User` — auth, plan tier, locale, Stripe customer
- `Question` — bilingual content (EN/VI), difficulty, tags, pro gate
- `QuizQuestion` — multiple choice options + explanation
- `UserProgress` — per-user question status tracking
- `UserQuizAttempt` — SM-2 spaced repetition fields (ease factor, interval, next review)
- `Subscription` — Stripe subscription lifecycle
- `SystemDesignCase` — mock interview cases with hints + scoring rubric
- `SystemDesignAttempt` — user solutions + AI feedback

### Application Layer — CQRS with MediatR
Every operation is a `Command` (write) or `Query` (read):
```
Request → Controller → MediatR → ValidationBehaviour → Handler → DB
```

Implemented features:
- `GetQuestionsQuery` — filtered, paginated, bilingual question list
- `RegisterCommand` — create account with BCrypt password hash
- `LoginCommand` — verify credentials, return JWT + refresh token

### Infrastructure Services
| Service | Implementation |
|---|---|
| `ITokenService` | JWT with HS256, configurable expiry |
| `ICacheService` | Redis wrapper (get/set/increment/expire) |
| `QuotaService` | Daily limits per feature per user (Vietnam UTC+7 reset) |
| `IAiFeedbackService` | Anthropic Claude API for system design scoring |

### API Layer
- `AuthController` — `POST /api/auth/register`, `POST /api/auth/login`
- `QuestionsController` — `GET /api/questions` with category/difficulty/lang/page filters
- `ExceptionHandlingMiddleware` — maps domain exceptions to correct HTTP status codes
- Swagger UI with Bearer token support
- CORS configured per environment

### Request Pipeline Order
```
ExceptionHandlingMiddleware
  → CORS
  → HTTPS Redirect
  → Authentication (JWT)
  → Authorization
  → Controller
```

---

## Frontend

### Tech Stack
| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool (dev server on :5173) |
| React Router 6 | Client-side routing with lazy loading |
| TanStack Query 5 | Server state, caching, background sync |
| Zustand 4 | Global auth state with localStorage persistence |
| Tailwind CSS 3 | Utility-first styling |
| React Hook Form + Zod | Forms with schema validation |
| Axios | HTTP client with JWT interceptor + 401 redirect |

### Pages Scaffolded
| Route | Status |
|---|---|
| `/register` | Fully wired — calls API, stores JWT, redirects |
| `/login` | Fully wired — calls API, stores JWT, redirects |
| `/questions` | Wired — fetches from API with category/difficulty filters |
| `/quiz` | Placeholder — Phase 2 |
| `/flashcard` | Placeholder — Phase 2 |
| `/system-design` | Placeholder — Phase 2 |
| `/progress` | Placeholder — Phase 2 |
| `/pricing` | Static tier comparison (Free / Pro / Team) |

### Key Frontend Patterns
- **Lazy routing** — each page is code-split via `lazy: () => import(...)`
- **Axios interceptor** — auto-attaches `Authorization: Bearer <token>` to every request
- **Zustand + persist** — auth state survives page refresh via `localStorage`
- **Zod schemas** — all forms validated before submission reaches the API

---

## Infrastructure & DevOps

### Docker Compose (local dev)
```
postgres:16-alpine  — port 5433 (offset to avoid local PG conflict)
redis:7-alpine      — port 6379
api                 — port 5000 (built from Dockerfile)
web                 — port 3000 (Nginx serving React SPA)
```

### Dockerfiles
- **API** — multi-stage: `sdk:8.0` build → `aspnet:8.0` runtime
- **Web** — multi-stage: `node:20-alpine` build → `nginx:alpine` serve

### Environment Config
- Dev secrets in `appsettings.Development.json` (git-ignored)
- Production secrets → AWS Secrets Manager
- Frontend env vars via `.env.development` / `.env.production`

---

## Security Assessment

### What Is Implemented Correctly

| Area | Implementation |
|---|---|
| Password storage | BCrypt with work factor (never plain text or MD5) |
| JWT | HS256, issuer/audience validation, configurable expiry |
| Input validation | FluentValidation pipeline runs before every handler |
| CORS | Origin whitelist — not wildcard `*` |
| SQL injection | EF Core parameterised queries — no raw SQL |
| Exception handling | Generic messages returned to client, full detail logged server-side |
| Secrets | Never committed — `appsettings.Development.json` is git-ignored |

### What Still Needs To Be Done Before Production

| Gap | Risk | Fix |
|---|---|---|
| No refresh token rotation | Medium — refresh tokens not stored or validated | Store hashed refresh tokens in DB with expiry |
| No rate limiting on auth endpoints | High — brute force on `/auth/login` | Add ASP.NET Core rate limiting middleware |
| JWT secret is weak placeholder | Critical | Use AWS Secrets Manager with a 256-bit random key |
| No HTTPS enforcement in prod | High | CloudFront + ACM handles this — ensure HTTP→HTTPS redirect |
| `RequiresPlan` attribute not yet wired to all pro endpoints | Medium | Add to Quiz, SystemDesign, Progress controllers in Phase 2 |
| No refresh token endpoint | Medium | Implement `POST /auth/refresh` |
| CORS allows localhost in prod config | Low | Ensure `appsettings.json` AllowedOrigins is overridden by env var in prod |

---

## Code Quality Assessment

### Strengths
- Clean separation of concerns — controllers are thin (delegate to MediatR)
- Testable by design — handlers depend on interfaces, not concrete classes
- Consistent API response envelope `{ success, data, error, meta }`
- Bilingual support baked into the data model from day one
- Docker Compose makes local setup reproducible

### Known Technical Debt
- `Class1.cs` placeholder files exist in Domain, Application, Infrastructure (delete these)
- No logging strategy yet (only default ASP.NET Core logging)
- No health check endpoints (`/health`) — needed for ALB in AWS
- `AiFeedbackService` uses raw `HttpClient` — should use typed client with retry policy (Polly)
- Tests projects have only placeholder `UnitTest1.cs` — no actual tests written yet

---

## How To Run Locally

```powershell
# 1. Start Docker services
cd D:\InterviewPrep
docker compose up postgres redis -d

# 2. Run DB migrations
cd InterviewPlatform.API
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update `
  --project ..\InterviewPlatform.Infrastructure\InterviewPlatform.Infrastructure.csproj `
  --startup-project InterviewPlatform.API.csproj

# 3. Start API (terminal 1)
dotnet watch run --launch-profile http
# → http://localhost:5000/swagger

# 4. Start frontend (terminal 2)
cd D:\InterviewPrep\interview-platform-web
npm run dev
# → http://localhost:5173
```

---

## Roadmap Status

### Phase 1 — MVP
- [x] Project scaffolding (Clean Architecture + React)
- [x] Auth (register, login, JWT)
- [x] Q&A module with bilingual support
- [ ] Basic quiz (multiple choice + explanation)
- [ ] Subscription tiers + Stripe integration
- [ ] Deploy to AWS
- [ ] CI/CD pipeline

### Phase 2 — Core Features
- [ ] Flashcard mode with flip animation
- [ ] Spaced repetition (SM-2 algorithm)
- [ ] Progress dashboard (streak, heatmap)
- [ ] System Design cases
- [ ] Skill radar chart

### Phase 3 — Advanced
- [ ] Mock interview mode (timed, phased)
- [ ] AI feedback for System Design (Anthropic API)
- [ ] Interview readiness score
- [ ] Team plan + member management
