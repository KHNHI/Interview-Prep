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
- `UserQuizAttempt` — SM-2 fields: easeFactor, intervalDays, repetitions, nextReviewAt, attemptedAt
- `Subscription` — plan, status, stripeSubscriptionId, periodStart/End
- `SystemDesignCase` — **reading/study case** (TitleEn, Difficulty, Summary, OverviewEn, RequirementsEn, HighLevelDesignEn, DeepDiveEn, TradeoffsEn, Tags[], OrderIndex, Hints, IsPro). Mock-interview fields (scoringRubric, solutionDiagramUrl) reserved for a future practice mode.
- `SystemDesignAttempt` — solutionText, aiFeedback (JSONB) — reserved for future mock-interview mode

### EF Migrations
- `20260529102836_Init` — initial schema
- `StandaloneQuizQuestion` — makes QuizQuestion standalone (nullable FK + new fields)
- `20260601152136_SystemDesignReadingContent` — adds reading-content fields to SystemDesignCase (Summary, OverviewEn, HighLevelDesignEn, DeepDiveEn, TradeoffsEn, Tags, OrderIndex)

### Application Layer — Implemented CQRS

| Query/Command | Handler | Notes |
|---|---|---|
| `GetQuestionsQuery` | handler | Filtered, paginated, bilingual |
| `GetQuestionByIdQuery` | handler | Returns `QuestionDetailDto` |
| `GetQuizQuestionsQuery` | handler | Random N, filter by category/difficulty, parses `OptionsEn` JSON |
| `SubmitQuizCommand` | handler | Saves `UserQuizAttempt` per answer, computes IsCorrect |
| `GetDashboardQuery` | handler | Aggregates UserQuizAttempts → stats + heatmap (last 365 days) |
| `GetRadarQuery` | handler | Groups attempts by QuizQuestion.Category → correct rate per category |
| `GetFlashcardsQuery` | handler | Returns up to 20 cards due today; deduped by question (most recent attempt); new cards first |
| `ReviewFlashcardCommand` | handler | Applies SM-2 algorithm to UserQuizAttempt, updates NextReviewAt |
| `RegisterCommand` | handler | BCrypt hash, return JWT |
| `LoginCommand` | handler | Verify credentials, return JWT |
| `ValidationBehaviour<TRequest,TResponse>` | — | FluentValidation pipeline |

### SM-2 Algorithm (ReviewFlashcardCommandHandler)
```
if rating < 3:
  repetitions = 0, intervalDays = 1
else:
  intervalDays = repetitions==0 ? 1 : repetitions==1 ? 6 : round(intervalDays * easeFactor)
  easeFactor = max(1.3, easeFactor + 0.1 - (5-rating) * (0.08 + (5-rating) * 0.02))
  repetitions++
nextReviewAt = today + intervalDays
```

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

> Quiz questions are MCQ-only — NOT linked to Q&A questions. `QuestionId` is null for all seed quiz questions.

### API Controllers

| Controller | Endpoints | Auth |
|---|---|---|
| `AuthController` | `POST /api/auth/register`, `POST /api/auth/login` | Public |
| `QuestionsController` | `GET /api/questions?category&difficulty&lang&page&pageSize` | Public |
| `QuestionsController` | `GET /api/questions/{id}?lang` | Public |
| `QuizController` | `GET /api/quiz/questions?category&difficulty&count` | Public |
| `QuizController` | `POST /api/quiz/submit` | `[Authorize]` |
| `ProgressController` | `GET /api/progress/dashboard` | `[Authorize]` |
| `ProgressController` | `GET /api/progress/radar` | `[Authorize]` |
| `FlashcardsController` | `GET /api/flashcards` | `[Authorize]` |
| `FlashcardsController` | `POST /api/flashcards/{id}/review` | `[Authorize]` |

### Key API Response Shapes

```json
// GET /api/progress/dashboard
{ "success": true, "data": {
  "questionsAttempted": 42, "quizzesTaken": 5, "correctRate": 0.73,
  "currentStreak": 3, "heatmap": [{ "date": "2026-05-31", "count": 4 }]
}}

// GET /api/progress/radar
{ "success": true, "data": [{ "category": "DSA", "score": 0.8 }, ...] }

// GET /api/flashcards
{ "success": true, "data": [{
  "id": "uuid", "category": "DSA", "difficulty": "Medium",
  "front": "...", "back": "...",
  "easeFactor": 2.5, "intervalDays": 1, "repetitions": 0, "nextReviewAt": null
}]}

// POST /api/flashcards/{id}/review  body: { "rating": 4 }
{ "success": true, "data": { "intervalDays": 6, "nextReviewAt": "2026-06-06" }}
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
| Zustand 4 + persist | Auth state (localStorage key: `"auth-store"`) |
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
│   ├── client.ts              ← Axios instance; reads token from localStorage["access_token"]
│   ├── auth.api.ts            ← register(), login()
│   ├── questions.api.ts       ← getAll(params), getById(id, lang)
│   ├── quiz.api.ts            ← getQuestions(params), submit() (uses fetch, not Axios)
│   ├── progress.api.ts        ← getDashboard(), getRadar()
│   └── flashcards.api.ts      ← getCards(), reviewCard(id, rating)
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         ← Sidebar + Header + Outlet; owns collapsed state
│   │   ├── ProtectedLayout.tsx← Layout + auth redirect to /login if no token
│   │   ├── PublicLayout.tsx   ← Navbar + Outlet (landing, pricing)
│   │   ├── Navbar.tsx         ← Dark top bar for public pages
│   │   ├── Sidebar.tsx        ← Collapsible (56px/228px); lock icons for guest on protected routes
│   │   └── Header.tsx         ← White top bar inside app
│   └── ui/                    ← (empty dir, add shared components here)
├── features/
│   ├── landing/LandingPage.tsx
│   ├── auth/LoginPage.tsx               ← Sets localStorage["access_token"] on login
│   ├── auth/RegisterPage.tsx
│   ├── dashboard/DashboardPage.tsx      ← Connected to GET /api/progress/dashboard
│   ├── questions/QuestionsPage.tsx      ← Connected to GET /api/questions
│   ├── questions/QuestionDetailPage.tsx ← Connected to GET /api/questions/:id
│   ├── quiz/QuizPage.tsx                ← Public; 3-screen flow; guest quota (3 free); SM-2 submit
│   ├── flashcard/FlashcardPage.tsx      ← Connected to GET /api/flashcards + POST review
│   ├── system-design/SystemDesignPage.tsx     ← Hardcoded
│   ├── system-design/SystemDesignDetailPage.tsx ← Hardcoded
│   ├── progress/ProgressPage.tsx        ← Connected to GET /api/progress/radar
│   └── pricing/PricingPage.tsx
├── stores/authStore.ts        ← Zustand + persist; key "auth-store"; fields: accessToken, userId, planTier
├── utils/cn.ts
├── router.tsx
└── main.tsx
```

### Router Groups (`router.tsx`)
```
PublicLayout    →  /
Layout          →  /questions, /questions/:id, /quiz, /system-design, /pricing
ProtectedLayout →  /dashboard, /flashcard, /system-design/:id, /progress
(no layout)     →  /login, /register
```

> **Important**: `/quiz` is in the public `Layout` (NOT ProtectedLayout) — guests can take quizzes with a 3-attempt limit.

### Auth Token Storage
- Login page sets **two** keys on successful login:
  - `localStorage["access_token"]` — read by Axios request interceptor
  - Zustand store via `setAuth()` — persisted automatically to `localStorage["auth-store"]`
- On 401: Axios interceptor removes both keys and does `window.location.href = "/login"`
- `quiz.api.ts submit()` uses raw `fetch` (not Axios) to avoid 401 bouncing user off results page

---

## 8. Frontend — Data State

### Connected to API ✅
| Page | API Endpoint | Notes |
|---|---|---|
| `QuestionsPage` | `GET /api/questions` | Filters, pagination, client-side search |
| `QuestionDetailPage` | `GET /api/questions/:id` | Markdown renderer |
| `LoginPage` | `POST /api/auth/login` | Sets JWT in Zustand + localStorage |
| `RegisterPage` | `POST /api/auth/register` | Sets JWT in Zustand + localStorage |
| `QuizPage` | `GET /api/quiz/questions` | Plain async fetch (not TanStack Query) |
| `QuizPage` (ResultsScreen) | `POST /api/quiz/submit` | Fire-and-forget via fetch; skipped for guests |
| `DashboardPage` | `GET /api/progress/dashboard` | TanStack Query; skeleton loading |
| `ProgressPage` | `GET /api/progress/radar` | TanStack Query; empty state if no data |
| `FlashcardPage` | `GET /api/flashcards` | Plain useEffect fetch; SM-2 queue |
| `FlashcardPage` | `POST /api/flashcards/{id}/review` | Called on each rating; moves to next card |

### Still hardcoded (needs backend endpoint)
| Page | Needs | Planned API |
|---|---|---|
| `SystemDesignPage` | Cases list | `GET /api/system-design` |
| `SystemDesignDetailPage` | Case detail | `GET /api/system-design/:id` |
| `DashboardPage` | "Continue Learning" card | Future endpoint |

### QuizPage — Guest Quota
- Guests can take up to **3 free quizzes** (tracked in `localStorage["guestQuizCount"]`)
- After 3rd quiz, `ResultsScreen` replaces action buttons with "Create free account / Sign in" CTA
- `SetupScreen` shows a lock gate if count ≥ 3
- `SetupScreen` shows "X free quizzes remaining" hint for guests with quota left

### QuizPage — 3-screen flow
```
SetupScreen → QuizScreen → ResultsScreen
```
- **SetupScreen**: Difficulty (Mixed/Easy/Medium/Hard), Topic (All/DSA/Networking/DB/OS/Cloud), Length (10/15/20/25 Q)
- **QuizScreen**: select answer → Next; dot progress; timer; auto-submits at 0
- **ResultsScreen**: score card + per-question breakdown with explanations; fires submit to API if authenticated

### Sidebar Behaviour
- **Collapsed** (56px): icons only, centered; toggle chevron at top; tooltips on hover
- **Expanded** (228px): icons + labels; brand name visible
- State persisted in `localStorage["sidebar-collapsed"]`
- **Guest UX**: Dashboard, Flashcards, Analytics show at reduced opacity with a tiny lock badge; click still navigates (ProtectedLayout handles the redirect)

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

### Recent Commits
```
b2dd174  add quizz feature
160cf46  fix the quizz page and seed data for quizz
bc2b37a  Connect Q&A to API, add seed data, add GetQuestionById endpoint
2056ab1  Redesign frontend and use tailwind, add public pages
bff9f81  Fix CORS, port config, add migrations and project summary
```

### Pending (not yet committed)
All work since `b2dd174` is uncommitted:

**Quiz submit + guest quota:**
- `SubmitQuizCommand` + handler + `QuizController POST /api/quiz/submit`
- `QuizPage.tsx` — guest 3-attempt quota, ResultsScreen fires submit via fetch
- `router.tsx` — `/quiz` moved to public Layout

**Dashboard + Progress (Step B):**
- `GetDashboardQuery` + handler → `ProgressController GET /api/progress/dashboard`
- `GetRadarQuery` + handler → `ProgressController GET /api/progress/radar`
- `progress.api.ts`, `DashboardPage.tsx`, `ProgressPage.tsx` — all connected to API

**Flashcard feature (Step A):**
- `GetFlashcardsQuery` + handler → `FlashcardsController GET /api/flashcards`
- `ReviewFlashcardCommand` + handler (SM-2) → `FlashcardsController POST /api/flashcards/{id}/review`
- `flashcards.api.ts`, `FlashcardPage.tsx` — fully connected, 3-screen flow (loading/reviewing/done)

**Sidebar improvements:**
- `Layout.tsx` — owns `collapsed` state (persisted to localStorage)
- `Sidebar.tsx` — collapsible (56px/228px), guest lock icons on protected routes

**Auth / client fixes:**
- `client.ts` — on 401: clears both `"access_token"` + `"auth-store"`, redirects to `/login`
- `quiz.api.ts submit()` — uses raw `fetch` to bypass Axios interceptor (prevents mid-quiz token expiry from bouncing user off results)

---

## 12. What's Next — Roadmap

### ⚡ NEXT SESSION

Phase 1 core features are complete. Remaining work:

#### System Design endpoints + frontend
Connect the still-hardcoded System Design pages:
- `GET /api/system-design` → list of cases
- `GET /api/system-design/:id` → case detail

#### Stripe checkout
Wire the Pricing page CTAs to actual Stripe checkout:
- `StripeService` exists in Infrastructure but not wired to an endpoint
- Need `POST /api/subscriptions/checkout` → creates Stripe checkout session
- Frontend: pricing page "Upgrade" buttons → redirect to Stripe hosted checkout
- Webhook handler for `checkout.session.completed`

#### Deploy to AWS
- EC2 + RDS (PostgreSQL) + S3 + CloudFront
- Docker-based deployment
- Health check endpoint `/health` for ALB (currently missing)

#### CI/CD pipeline
- GitHub Actions: `ci.yml` (build + test) + `deploy.yml` (push to EC2)

---

### Phase 1 — Status
- [x] Seed DB — 42 Q&A + 40 MCQ quiz questions
- [x] Q&A list + detail pages connected to API
- [x] Quiz — 3-screen flow, filters, timer, results
- [x] Quiz submit → saves UserQuizAttempt (SM-2 seed data for flashcards)
- [x] Guest quiz quota (3 free attempts, localStorage)
- [x] Dashboard connected to real data (stats + heatmap)
- [x] Analytics/Progress connected to real data (radar chart)
- [x] Flashcard feature — SM-2 review queue, flip animation, rating buttons
- [x] Sidebar — collapsible, guest lock indicators
- [ ] System Design endpoints + connect frontend
- [ ] Stripe checkout
- [ ] Deploy to AWS
- [ ] CI/CD pipeline

### Phase 2
- [ ] AI feedback endpoint (AiFeedbackService exists, not wired)
- [ ] Mock interview mode (timed, phased)
- [ ] Team plan management
- [ ] Google OAuth

### Technical Debt
- Delete `Class1.cs` placeholder files in Domain/Application/Infrastructure
- Add health check endpoint `/health` for ALB
- Add rate limiting on auth endpoints (brute force protection)
- Store refresh tokens in DB (currently not persisted — 60 min JWT only)
- Replace JWT secret with AWS Secrets Manager in production
- Write actual unit tests (stubs exist, no tests written)
- Add error boundaries in React
- `DashboardPage` "Continue Learning" card is hardcoded

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
