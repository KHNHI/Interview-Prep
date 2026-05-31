# InterviewPrep — Developer Context File
> Read this at the start of every new session. It contains all decisions, structure, and state of the project.

---

## 1. What Is This Project

A bilingual (EN/VI) fullstack interview prep platform for software engineers.
Features: Q&A bank, quizzes, flashcards (SM-2), system design mock interviews, AI feedback, progress analytics, subscription tiers.

**Live target:** `https://interviewprep.vn` (not deployed yet)
**Local frontend:** `http://localhost:5173`
**Local API:** `http://localhost:5000`
**Swagger:** `http://localhost:5000/swagger`

---

## 2. Monorepo Structure

```
D:\InterviewPrep\
├── InterviewPlatform.sln
├── InterviewPlatform.Domain/          ← Entities, Enums, BaseEntity
├── InterviewPlatform.Application/     ← CQRS handlers, interfaces, validation
├── InterviewPlatform.Infrastructure/  ← EF Core, Redis, JWT, Stripe, Anthropic
├── InterviewPlatform.API/             ← ASP.NET Core Web API
├── InterviewPlatform.Tests.Unit/      ← xUnit + Moq stubs (not yet written)
├── InterviewPlatform.Tests.Integration/ ← Testcontainers stubs (not yet written)
├── interview-platform-web/            ← React 18 + TypeScript + Vite frontend
├── docker-compose.yml
├── PROJECT_SUMMARY.md
└── CONTEXT.md                         ← this file
```

---

## 3. Backend — Tech Stack

| Package | Version | Purpose |
|---|---|---|
| .NET / ASP.NET Core | 8 (LTS) | Runtime + Web API |
| Entity Framework Core | 8 | ORM |
| Npgsql.EF | 8 | PostgreSQL provider |
| MediatR | 12 | CQRS |
| FluentValidation | 11 | Validation pipeline |
| JwtBearer | 8 | JWT auth |
| StackExchange.Redis | latest | Cache + quota |
| Swashbuckle | 6 | Swagger UI |
| BCrypt.Net-Next | 4 | Password hashing |
| Stripe.net | latest | Payments |
| xUnit + Moq + FluentAssertions | latest | Tests |
| Testcontainers | latest | Integration tests |

### Clean Architecture Layers
```
API → Infrastructure → Application → Domain
(outer layers depend on inner, never reverse)
```

### CQRS Request Flow
```
Request → Controller → MediatR → ValidationBehaviour → Handler → DB
```

### Middleware Order (Program.cs)
```
ExceptionHandlingMiddleware → UseCors() → UseHttpsRedirection()
→ UseAuthentication() → UseAuthorization() → MapControllers()
```

### Key Files
- `InterviewPlatform.API/Program.cs` — DI registration, middleware pipeline, seed call on startup
- `InterviewPlatform.API/appsettings.Development.json` — local secrets (git-ignored)
- `InterviewPlatform.Infrastructure/DependencyInjection.cs` — service registrations
- `InterviewPlatform.Infrastructure/Persistence/ApplicationDbContext.cs` — EF DbContext
- `InterviewPlatform.Infrastructure/Persistence/DataSeeder.cs` — seeds Q&A + quiz questions on startup

---

## 4. Backend — What's Built

### Domain Entities

- `User` — email, passwordHash, planTier (Free/Pro/Team), locale (en/vi), stripeCustomerId
- `Question` — category, titleEn/Vi, contentEn/Vi, difficulty, tags[], isPro, orderIndex
- `QuizQuestion` — **standalone MCQ question** (nullable QuestionId link to Q&A bank):
  - `Category`, `Difficulty`, `TitleEn`, `TitleVi`, `ContextEn`, `CodeSnippet`
  - `OptionsEn` (JSON string: `[{id,label,desc}]`), `OptionsVi`
  - `CorrectOptionId` ("a"|"b"|"c"|"d"), `ExplanationEn`, `ExplanationVi`
  - `IsPro`, `OrderIndex`
  - `QuestionId?` — optional FK; null = standalone quiz-only question
- `UserProgress` — composite key (userId, questionId), status, viewedAt
- `UserQuizAttempt` — SM-2 fields: easeFactor, intervalDays, repetitions, nextReviewAt
- `Subscription` — plan, status, stripeSubscriptionId, periodStart/End
- `SystemDesignCase` — requirements, hints, scoringRubric, solutionDiagramUrl, isPro
- `SystemDesignAttempt` — solutionText, aiFeedback (JSONB)

### EF Migrations
- `20260529102836_Init` — initial schema
- `StandaloneQuizQuestion` — makes QuizQuestion standalone (nullable FK + new fields)

### Application Layer — Implemented CQRS

| Query/Command | Handler | Notes |
|---|---|---|
| `GetQuestionsQuery` | `GetQuestionsQueryHandler` | Filtered, paginated, bilingual |
| `GetQuestionByIdQuery` | `GetQuestionByIdQueryHandler` | Returns `QuestionDetailDto` |
| `GetQuizQuestionsQuery` | `GetQuizQuestionsQueryHandler` | Random N, filter by category/difficulty, parses `OptionsEn` JSON |
| `RegisterCommand` | handler | BCrypt hash, return JWT |
| `LoginCommand` | handler | Verify credentials, return JWT |
| `ValidationBehaviour<TRequest,TResponse>` | — | FluentValidation pipeline |

### Infrastructure Services
- `TokenService` — JWT HS256 with configurable expiry
- `CacheService` — Redis get/set/increment/expire wrapper
- `QuotaService` — daily limit per feature per user (Vietnam UTC+7 reset)
- `AiFeedbackService` — Anthropic Claude API (claude-sonnet-4-6)
- `DataSeeder` — seeds on startup; skips if data already exists; reads JSON from `SeedData/`

### Seed Data (`InterviewPlatform.API/SeedData/`)

| File | Table | Count |
|---|---|---|
| `questions-dsa.json` | Questions | 10 |
| `questions-networking.json` | Questions | 8 |
| `questions-database.json` | Questions | 8 |
| `questions-os.json` | Questions | 8 |
| `questions-cloud.json` | Questions | 8 |
| `quiz-questions.json` | QuizQuestions | 40 (8 per category: DSA/Networking/DB/OS/Cloud) |

**Total seeded**: 42 Q&A questions + 40 MCQ quiz questions

> Quiz questions are MCQ-only — they are NOT linked to Q&A questions. `QuestionId` is null for all seed quiz questions.

### API Controllers

| Controller | Endpoints |
|---|---|
| `AuthController` | `POST /api/auth/register`, `POST /api/auth/login` |
| `QuestionsController` | `GET /api/questions?category&difficulty&lang&page&pageSize` |
| `QuestionsController` | `GET /api/questions/{id}?lang` |
| `QuizController` | `GET /api/quiz/questions?category&difficulty&count` (max 50, default 15) |

### API Response Shapes

```json
// GET /api/questions
{ "success": true, "data": [QuestionDto], "meta": { "page", "pageSize", "total" } }

// GET /api/questions/:id
{ "success": true, "data": QuestionDetailDto }

// GET /api/quiz/questions
{ "success": true, "data": [QuizQuestionDto] }
```

`QuizQuestionDto` shape:
```json
{
  "id": "uuid",
  "category": "DSA",
  "difficulty": "Medium",
  "titleEn": "...",
  "contextEn": null,
  "codeSnippet": null,
  "options": [{ "id": "a", "label": "...", "desc": "..." }, ...],
  "correctOptionId": "b",
  "explanationEn": "...",
  "isPro": false
}
```

### Database — Connection Details (local dev)
```
Host:     localhost
Port:     5433  ← Docker mapped to 5433 (local PG already uses 5432)
Database: interview_platform
Username: dev_user
Password: dev_password_123
```
Connection string in `appsettings.Development.json`:
```
Host=localhost;Port=5433;Database=interview_platform;Username=dev_user;Password=dev_password_123
```

### Redis
- Port: 6379 (Docker)
- Quota key format: `quota:{feature}:{userId}:{yyyy-MM-dd}`

---

## 5. Frontend — Tech Stack

| Package | Purpose |
|---|---|
| React 18 + TypeScript | UI |
| Vite 5 | Build tool (dev on :5173) |
| React Router 6 | Routing with lazy loading |
| TanStack Query 5 | Server state, caching |
| Zustand 4 + persist | Auth state (localStorage) |
| Tailwind CSS 3 | Styling (semantic tokens configured) |
| React Hook Form + Zod | Forms + validation |
| Axios | HTTP client with JWT interceptor |
| Recharts | Radar chart on Analytics page |

---

## 6. Frontend — Design System

### Tailwind Token Reference (`tailwind.config.js`)
```js
colors: {
  canvas:      '#F3F3F3',   // page background
  surface:     '#FFFFFF',   // cards
  'surface-alt':'#FAFAFA',  // subtle card alt
  ink: { 1: '#0F0F0F', 2: '#525252', 3: '#9C9C9C' },  // text hierarchy
  line: { DEFAULT: '#E6E6E6', strong: '#CCCCCC' },      // borders
  sidebar:     '#0F0F0F',   // sidebar + dark sections
}
shadows: { card: '...', 'card-md': '...' }
fontFamily: { sans: ['Onest'], mono: ['JetBrains Mono'] }
borderRadius: { sm: '5px', DEFAULT: '8px', lg: '12px' }
```

### CSS Custom Classes (index.css — keep only these)
- `.app-layout`, `.main-area`, `.page-content` — shell
- `.fc-*` — flashcard 3D flip animation
- `.hm-cell`, `.l1-.l4` — heatmap cell colors
- `.pro-gate`, `.pro-gate-inner`, `.pro-gate-overlay` — Pro blur gate

### Key Design Rules
- **NO decorative colors** — only black/white/gray
- **NO inline styles** — all Tailwind classes
- Dark sections use `bg-sidebar` (#0F0F0F) — same as the sidebar
- Standard card: `bg-white border border-line rounded shadow-card`
- Primary button: `bg-ink-1 text-white hover:bg-[#2A2A2A]`
- Secondary button: `bg-canvas text-ink-1 border border-line-strong`
- Font: Onest (loaded via Google Fonts in `index.html`)

---

## 7. Frontend — File Structure

```
src/
├── api/
│   ├── client.ts              ← Axios instance (baseURL = VITE_API_URL + "/api")
│   ├── auth.api.ts            ← register(), login()
│   ├── questions.api.ts       ← getAll(params), getById(id, lang)
│   └── quiz.api.ts            ← getQuestions(params) → QuizQuestionDto[]
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         ← Sidebar + Header + Outlet (app pages)
│   │   ├── ProtectedLayout.tsx← Layout + auth redirect to /login
│   │   ├── PublicLayout.tsx   ← Navbar + Outlet (landing, pricing)
│   │   ├── Navbar.tsx         ← Dark top bar for public pages
│   │   ├── Sidebar.tsx        ← Dark sidebar, NavLink active states
│   │   └── Header.tsx         ← White top bar inside app
│   └── ui/                    ← (empty dir, add shared components here)
├── features/
│   ├── landing/LandingPage.tsx          ← Public homepage
│   ├── auth/LoginPage.tsx               ← Split dark/light layout, connected to API
│   ├── auth/RegisterPage.tsx            ← Split dark/light layout, connected to API
│   ├── dashboard/DashboardPage.tsx      ← Stats, heatmap, quick actions (hardcoded)
│   ├── questions/QuestionsPage.tsx      ← Q&A list — connected to GET /api/questions
│   ├── questions/QuestionDetailPage.tsx ← Full answer — connected to GET /api/questions/:id
│   ├── quiz/QuizPage.tsx                ← 3-screen quiz (Setup → Quiz → Results), connected to API
│   ├── flashcard/FlashcardPage.tsx      ← SM-2 flip cards (hardcoded)
│   ├── system-design/SystemDesignPage.tsx     ← SD case list (hardcoded)
│   ├── system-design/SystemDesignDetailPage.tsx ← 2-col + tabs + pro gate (hardcoded)
│   ├── progress/ProgressPage.tsx        ← Recharts radar + activity (hardcoded)
│   └── pricing/PricingPage.tsx          ← 3-tier comparison + FAQ
├── hooks/                     ← (empty, add useRequireAuth here if needed)
├── stores/authStore.ts        ← Zustand + persist (accessToken, userId, planTier)
├── utils/cn.ts                ← clsx-style class merger
├── router.tsx                 ← Route groups (see below)
└── main.tsx                   ← QueryClient + RouterProvider
```

### Router Groups (`router.tsx`)
```
PublicLayout    →  /
Layout          →  /questions, /questions/:id, /system-design, /pricing
ProtectedLayout →  /dashboard, /quiz, /flashcard, /system-design/:id, /progress
(no layout)     →  /login, /register
```

### Named Export Convention
Every page exports a named function matching the filename:
```ts
export function DashboardPage() { ... }

// router.tsx uses the lazy() helper:
function lazy(importFn, name) {
  return { lazy: async () => ({ Component: (await importFn())[name] }) }
}
```

---

## 8. Frontend — Data State

### Connected to API ✅
| Page | API Endpoint | Notes |
|---|---|---|
| `QuestionsPage` | `GET /api/questions` | Filters: category, difficulty; pagination; client-side search |
| `QuestionDetailPage` | `GET /api/questions/:id` | Markdown renderer built-in |
| `LoginPage` | `POST /api/auth/login` | Stores JWT in Zustand + localStorage |
| `RegisterPage` | `POST /api/auth/register` | Stores JWT in Zustand + localStorage |
| `QuizPage` | `GET /api/quiz/questions` | Called on "Start Quiz"; not TanStack Query — plain async fetch |

### Still hardcoded (needs backend endpoint)
| Page | Needs | Planned API |
|---|---|---|
| `FlashcardPage` | Cards array | `GET /api/flashcards` |
| `SystemDesignPage` | Cases list | `GET /api/system-design` |
| `SystemDesignDetailPage` | Case detail | `GET /api/system-design/:id` |
| `DashboardPage` | Stats + heatmap | `GET /api/progress/dashboard` |
| `ProgressPage` | Radar + activity | `GET /api/progress/radar` |

### QuizPage — 3-screen flow
```
SetupScreen → QuizScreen → ResultsScreen
```
- **SetupScreen**: choose Difficulty (Mixed/Easy/Medium/Hard), Topic (All/DSA/Networking/DB/OS/Cloud), Length (10/15/20/25 questions with 1 min/question timer)
- **QuizScreen**: select answer → Next, no explanations shown mid-quiz; dot progress indicator; auto-submits when timer reaches 0
- **ResultsScreen**: score card (X/Y, %, grade, time used) + per-question breakdown with correct answer, user's answer, and explanation

---

## 9. Environment Variables

### Backend (`appsettings.Development.json`) — git-ignored
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=interview_platform;Username=dev_user;Password=dev_password_123",
    "Redis": "localhost:6379"
  },
  "Jwt": { "Secret": "local_dev_secret_min_32_chars", "Issuer": "http://localhost:5000", "Audience": "interview-platform-local", "ExpiresInMinutes": 60 },
  "Stripe": { "SecretKey": "sk_test_...", "WebhookSecret": "whsec_test_..." },
  "Anthropic": { "ApiKey": "sk-ant-..." },
  "AllowedOrigins": "http://localhost:5173"
}
```

### Frontend (`.env.development`)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=InterviewPrep
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 10. How To Run Locally

```powershell
# 1. Start Docker (Postgres on 5433, Redis on 6379)
cd D:\InterviewPrep
docker compose up postgres redis -d

# 2. Run DB migrations (after any entity change)
cd InterviewPlatform.API
dotnet ef migrations add <MigrationName> `
  --project ..\InterviewPlatform.Infrastructure\InterviewPlatform.Infrastructure.csproj `
  --startup-project InterviewPlatform.API.csproj
dotnet ef database update `
  --project ..\InterviewPlatform.Infrastructure\InterviewPlatform.Infrastructure.csproj `
  --startup-project InterviewPlatform.API.csproj

# 3. Start API (terminal 1) — DataSeeder runs automatically on startup
dotnet watch run --launch-profile http
# → http://localhost:5000/swagger

# 4. Start frontend (terminal 2)
cd D:\InterviewPrep\interview-platform-web
npm run dev
# → http://localhost:5173
```

> **Seeding note**: `DataSeeder` runs on every startup but skips if data already exists (`AnyAsync()` check). To re-seed, truncate the `Questions` and `QuizQuestions` tables first.

### Verify DB connection
```powershell
docker compose exec postgres psql -U dev_user -d interview_platform -c "\dt"
```

---

## 11. Git State

### Commits
```
bc2b37a  Connect Q&A to API, add seed data, add GetQuestionById endpoint
2056ab1  Redesign frontend and use tailwind, add public pages
bff9f81  Fix CORS, port config, add migrations and project summary
fb893b8  Initial project scaffold — Clean Architecture .NET 8 + React 18 + TypeScript
```

### Pending (not yet committed)
Quiz feature work:
- `QuizQuestion` entity made standalone (nullable FK + new fields)
- Migration `StandaloneQuizQuestion`
- `quiz-questions.json` seed (40 MCQ questions)
- `DataSeeder` updated to seed QuizQuestions
- `GetQuizQuestionsQuery` + handler + DTO
- `QuizController` — `GET /api/quiz/questions`
- `quiz.api.ts` frontend API client
- `QuizPage.tsx` fully rewritten — Setup/Quiz/Results screens, API-connected

---

## 12. What's Next — Roadmap

### Phase 1 (mostly complete)
- [x] Seed database with real questions — 42 Q&A + 40 MCQ quiz questions
- [x] Connect QuestionsPage to `GET /api/questions`
- [x] Connect QuestionDetailPage to `GET /api/questions/:id`
- [x] Add `GET /api/questions/:id` endpoint
- [x] Quiz page — 3-screen flow (Setup/Quiz/Results), difficulty/topic/length selection, timer, explanations only on results
- [x] Connect QuizPage to `GET /api/quiz/questions`
- [ ] Stripe checkout integration (backend StripeService exists, frontend pricing CTA not wired)
- [ ] Deploy to AWS (EC2 + RDS + S3 + CloudFront)
- [ ] CI/CD pipeline (GitHub Actions — ci.yml + deploy.yml)

### Phase 2
- [ ] Flashcard endpoints + connect frontend
- [ ] System Design endpoints + connect frontend
- [ ] Progress/dashboard endpoints + connect frontend
- [ ] Spaced repetition (SM-2) logic in QuizService
- [ ] `POST /api/quiz/submit` — save UserQuizAttempt per question

### Phase 3
- [ ] AI feedback (AiFeedbackService exists, not wired to endpoint)
- [ ] Mock interview mode (timed, phased)
- [ ] Team plan management
- [ ] Google OAuth

### Technical Debt
- Delete `Class1.cs` placeholder files in Domain/Application/Infrastructure
- Add health check endpoint `/health` for ALB
- Add rate limiting on auth endpoints (brute force protection)
- Store refresh tokens in DB (currently not persisted)
- Replace JWT secret with AWS Secrets Manager in production
- Write actual unit tests (stubs exist, no tests written)
- Add error boundaries in React

---

## 13. Security Notes

### Already secure
- BCrypt password hashing
- JWT HS256 with issuer/audience validation
- EF Core parameterised queries (no raw SQL)
- CORS whitelist (not wildcard)
- Secrets git-ignored

### Must fix before production
- Rate limit `POST /api/auth/login` (brute force)
- Replace JWT secret placeholder with AWS Secrets Manager
- Persist + rotate refresh tokens
- HTTP→HTTPS redirect (CloudFront handles this)

---

## 14. Docker Compose Services

```yaml
postgres:  postgres:16-alpine   port 5433:5432  (5433 on host, 5432 in container)
redis:     redis:7-alpine        port 6379:6379
api:       custom Dockerfile     port 5000:80    (not used in local dev — run dotnet directly)
web:       custom Dockerfile     port 3000:80    (not used in local dev — run npm directly)
```

> **Why port 5433?** Local PostgreSQL installation already occupies 5432. Docker maps to 5433 to avoid conflict.
