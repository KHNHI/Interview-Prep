# InterviewPrep — Developer Context File
> Read this at the start of every new session. It contains all decisions, structure, and state of the project.

## English AI answer feedback (2026-10-20)

- Implemented an optional English interview-practice MVP on question details:
  write before opening the reference answer, then request strengths, improvements,
  English clarity, a sample answer and one follow-up question. No numeric grading.
- `GET /api/questions/feedback-status` is public; `POST /api/questions/{id}/feedback`
  requires JWT authentication plus a verified existing account. Application service
  validates 30–4,000 characters and loads the canonical English question/reference.
- `GeminiAnswerFeedbackProvider` now uses Google Gemini REST generateContent with
  an English system instruction, JSON response schema and local validation,
  30-second timeout, 3,000 output tokens, a 64 KiB response buffer, and no retries.
  API keys are sent in a redacted header, never in the URL. The Anthropic SDK
  added for this feature was removed. The older unexposed system-design AI stub
  remains separate and unchanged; it is not used by question feedback.
- Disabled by default: enable backend `AnswerFeedback__Enabled=true`, configure
  `Gemini__ApiKey` and `Gemini__Model` explicitly. Example model:
  `gemini-3.5-flash-lite` (check current project Free Tier quota in AI Studio).
  Never put keys into Vite. Old Anthropic settings do not enable this feature.
  Defaults are 5 attempts/user/day and 30 across the app/day, reset at 00:00 UTC,
  reserved atomically in Redis; failed provider attempts count. Redis outages fail
  closed. Additional per-instance limit: 2 requests/user/minute. Limits are not a
  dollar spending cap; configure provider billing controls independently.
- UI and feedback are English, use the existing paper/sage/forest design, and keep
  drafts after request errors. Feedback 401s do not force a redirect. Drafts exist
  only in page memory and clear on navigation/reload. No answer/history persistence.
- Validation: 67 unit tests pass, including fake HTTP tests of Gemini request
  shape, header key, errors, timeouts and truncated output; API Release and frontend
  production builds pass;
  mocked headless Edge checks cover guest gating, loading, feedback, editing,
  401/429/503 draft preservation, provider-off state and mobile width. Existing EF
  Core dependency version warning remains in the test build. No paid/live AI calls
  were made; real provider access and output quality still need an owner's smoke test.
  Gemini Free Tier data processing is disclosed in the form. No explicit context
  caching is requested, and no billing is required by the application.
- English plan/setup: `docs/AI_ANSWER_FEEDBACK_PLAN.md` and
  `docs/AI_ANSWER_FEEDBACK_SETUP.md`. Docs remain Git-ignored by existing policy.

## Frontend update (2026-10-20)

### System design whiteboards (2026-10-21)

All-case lesson follow-up (2026-10-22): Rate Limiter, Twitter / News Feed and
Notification System now also use all six steps, with English case-specific worked
examples, calculations, API/data contracts, speaking practice and common mistakes.
`additionalLessons.ts` holds the three curricula; `workedLessons.ts` is the shared
title-to-lesson registry used by detail/list views. `InterviewLesson` receives the
selected content rather than always rendering URL Shortener. All four known cases
are labelled full six-step walkthroughs; unknown titles retain legacy Markdown.
The guide now advertises all four. Case-specific questions can override the common
framework prompts. Existing diagrams remain in step 4, and URL step links remain
compatible. No API, migration, reseed, provider calls or production data changes.
Technical emphasis: token bucket burst/atomicity/outage policy; chronological feed
fan-out/outbox/hybrid reads/current visibility; notification acceptance versus
delivery/idempotency/provider limits/retry expiry and duplicate-send ambiguity.
All scale/latency numbers are hypothetical planning assumptions, not benchmark claims.

Curriculum follow-up: the framework guide is now six steps totaling an illustrative
45 minutes: Clarify 5, Estimate 5, APIs & Data 5, High-Level Design 12, Deep Dives 13,
Bottlenecks & Wrap-up 5. URL Shortener now has the complete English worked lesson,
including explicit assumptions/math, HTTP examples/data model, the existing board,
collision/cache-expiry decisions, failure behavior and monitoring. Each step has
what to do, interviewer questions, worked example, speaking practice and mistakes.
Other three cases retain legacy reference tabs/boards and are labelled as reference
cases. Curated frontend content lives in `interviewFramework.ts`; presentation in
`InterviewLesson.tsx` / `interview-lesson.css`. Step state uses `?step=` for refresh
and back navigation. No DB migration/reseed or backend deployment is required.
Guide/case-list copy now says six steps. Local docs: `docs/SYSTEM_DESIGN_CURRICULUM.md`.

- High-Level Design now displays hand-drawn-style interactive SVG diagrams for all
  four seeded cases: URL Shortener, Rate Limiter, Twitter / News Feed, Notifications.
  Diagrams use semantic boxes/stores, labelled arrows, solid/dashed paths and the
  existing paper/sage/forest palette; no raster assets, gradients or new dependency.
- Flow buttons highlight the selected request path; selectable keyboard-accessible
  components explain responsibilities; zoom/reset and a focusable horizontal canvas
  support small screens. English step-by-step walkthroughs remain readable below.
  Response arrows are omitted and explicitly documented in the diagram legend.
- Diagram data lives in `architectureBoards.ts`, rendered by
  `ArchitectureWhiteboard.tsx` + `whiteboard.css`. Maps known English case titles,
  not generated database IDs. Unknown cases retain their original Markdown.
  Known cases replace only the first arrow-based ASCII sketch; prose, data tables
  and API examples remain. No backend, seed, database or paid AI call is required.
- Frontend build passes. Mocked headless Edge checks all four cases, flow buttons,
  keyboard notes, zoom/reset, desktop/mobile overflow, inner canvas scrolling and
  unknown-case fallback. Local script/screenshots: `docs/previews/check-whiteboards.cjs`.

Mobile follow-up: below 901px the workspace uses a full-width top bar with a text
Menu/Close menu disclosure instead of a persistent sidebar. Desktop compact-view
preference does not abbreviate mobile labels. Closed navigation is hidden from
keyboard focus; Escape closes it and restores toggle focus; navigation closes it.
Mobile uses document scrolling and dynamic viewport height, wrapped question tags,
16px form inputs, 44px buttons, full-width feedback action on phones, and responsive
dashboard/progress/quiz/guide grids. Code blocks/tables scroll within their cards.
Verified via mocked headless Edge at 320/375/390/430/640/768/900/1024/1440px and
seven study routes, checking both document and main-container horizontal overflow.
Screenshots/script: `docs/previews/responsive-question-*.png`, `check-responsive.cjs`.

Follow-up polish: content uses the same paper/sage/forest palette as the landing
page, including badges, code blocks, charts and buttons. System Design now uses
keyboard-accessible links for the guide and entire case cards, with retry on error.
Guest navigation renders Flashcards/Dashboard/Progress as grey, disabled non-links
with an accessible sign-in explanation; authenticated users see regular links.
Direct protected URLs still require authentication through ProtectedLayout.
Sign-in/sign-up share AuthLayout and auth.css: compact responsive forms, associated
labels, autocomplete, Show/Hide password, visible password requirements, inline
validation, pending states and explicit network/401/403/429 errors. Removed fake
forgot-password/legal links and testimonial/marketing panels. ResendVerification
reports failures and includes a 60-second cooldown after a successful request.
Local headless browser tests with mocked API responses cover guest/authenticated
navigation, palette, login/register validation and errors, resend, and mobile layout.

- InterviewPrep is non-commercial: no subscription plans, upgrade CTAs, Pro badges
  or client-side paid-content gates. `/pricing` redirects to `/` for old links.
  Backend plan/Stripe fields remain for schema compatibility; no schema migration.
- New text-first landing page: warm paper background, dark green accents, serif
  headings; no gradients or decorative icons. Shared navigation and palette match.
- Home interactions: five topic-specific sample Q&A previews, reveal answer,
  self-reflection feedback, next question, 10/15/30-minute suggested study plans,
  topic links into Q&A/quiz and native FAQ disclosure controls.
- Q&A and quiz read `?category=` on initial entry. Guest quizzes have no attempt
  cap. Sign-in is still required for personal dashboard, flashcards and analytics.
- All System Design sections are readable without a plan check, including Deep
  Dive and Trade-offs. Existing `isPro` API fields are ignored by the UI.
- Removed misleading marketing statistics, unimplemented AI/mock-interview claims,
  decorative SVG icons and fake notification/language controls. Charts remain.
- Main files: `features/landing/LandingPage.tsx`, `features/landing/landing.css`,
  shared layout components, `index.css`, `tailwind.config.js`.
- Verified with production build and local headless browser checks at desktop and
  390px mobile width. API responses were mocked for routing/content-gate checks;
  this was not a live backend integration test.

Older monetization/design descriptions below are historical; this update takes precedence.

## Current architecture update (2026-10-12)

Question bank expansion: **112 Q&A questions** (42 original + 70 new in
`InterviewPlatform.API/SeedData/questions-expansion.json`). Added 14 questions per
category: DSA, Networking, DB, OS and Cloud. New answers include a short explanation,
an example and an interview pitfall; all new entries are free and English-only.
Final category totals: DSA 24, Networking 22, DB 22, OS 22, Cloud 22.
Q&A seeding is now incremental: append entries missing by normalized category/title,
preserve existing IDs and edited content, and avoid duplicates on later startups.
Other seed types are unchanged. Startup applies this to local and deployed databases;
no schema migration is required. Three seed regression tests cover this behavior.

MediatR has been removed. Controllers call Application Services directly through
constructor-injected interfaces. No mediator, command/query handler, or validation
pipeline remains in the executable code.

Request flow: `HTTP → Controller → Application Service → database/email interfaces`.

- `Application/Services/`: AuthService, QuestionsService, QuizService,
  FlashcardsService, ProgressService, SystemDesignService, with matching interfaces.
- `Application/Features/<feature>/`: plain request records, response DTOs and
  validators; the old Commands/Queries folders have been flattened.
- `AuthService.RegisterAsync` explicitly calls
  `RegisterRequestValidator.ValidateAndThrowAsync` before saving or sending email.
- `API/Program.cs` registers the six services with `AddScoped`.
- Routes, JSON fields, auth requirements, rate limiting and database schema are
  unchanged. No database migration or frontend change is required.
- The unit suite calls services directly; three registration regression tests were
  added for password validation, non-fatal email and pending-account registration.
  Total: 26 tests.

Deployment update: frontend has moved to Cloudflare Pages; API, PostgreSQL and
Redis have moved to Railway. The AWS workflow is manual-only and retained for
reference. Email supports `Email__Provider=brevo` through the HTTPS API with
`Email__Brevo__ApiKey`; SMTP, SES and local console implementations remain available.
Do not put API keys or other secrets in this document.

The older CQRS and AWS descriptions below describe earlier project versions;
use this section for the current architecture and deployment.

---

## 1. What Is This Project

A bilingual (EN/VI) fullstack interview prep platform for software engineers.
Features: Q&A bank, quizzes, flashcards (SM-2), system design mock interviews, AI feedback, progress analytics, subscription tiers.

**Live target:** `https://lazyndev.io.vn` (API: `https://api.lazyndev.io.vn`) — **deployed on AWS** (see §15)
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

- `User` — email, passwordHash, planTier (Free/Pro/Team), locale (en/vi), stripeCustomerId, **isEmailVerified, emailVerificationToken, emailVerificationTokenExpiresAt**
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
- `20260622130913_EmailVerification` — adds User email-verification fields; **backfills existing users to verified** so they aren't locked out

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
| `RegisterCommand` | handler | BCrypt hash, create **unverified** user, email a 24h verification link, return `RegisterResult` (no auto-login) |
| `RegisterCommandValidator` | — | FluentValidation: password ≥8 chars + ≥1 uppercase + ≥1 special; email/name rules (**server-side**, not just frontend) |
| `LoginCommand` | handler | Verify credentials; **throws EmailNotVerifiedException (403) if not verified**; else return JWT |
| `VerifyEmailCommand` | handler | Validates token (24h), marks verified, returns JWT (auto-login on verify) |
| `ResendVerificationCommand` | handler | Regenerates token + re-sends email; silent success to avoid account enumeration |
| `GetSystemDesignCasesQuery` | handler | Lists study cases (id, title, difficulty, summary, tags, isPro); optional difficulty filter |
| `GetSystemDesignCaseByIdQuery` | handler | Returns `SystemDesignCaseDetailDto` with all Markdown sections |
| `ValidationBehaviour<TRequest,TResponse>` | — | FluentValidation pipeline |

> **Difficulty filter fix:** query handlers compare the `Difficulty` **enum** directly (`q.Difficulty == parsed`) — `enum.ToString()` in a `Where` can't be translated to SQL and threw 500s.

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
- `IEmailService` — sends verification emails. Implementation chosen by `Email:Provider`:
  - `SmtpEmailService` (MailKit) — **used in prod via Brevo** (works with any SMTP: SendGrid/Gmail/etc.)
  - `SesEmailService` (AWS SES) — built but not used (SES production access was rejected)
  - `ConsoleEmailService` — local dev; logs the verification link, zero setup (the default)
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
| `system-design-cases.json` | SystemDesignCases | 4 (URL Shortener, Rate Limiter, Twitter Feed, Notification System) |

**Total seeded**: 42 Q&A questions + 40 MCQ quiz questions + 4 system design cases

> Quiz questions are MCQ-only — NOT linked to Q&A questions. `QuestionId` is null for all seed quiz questions.

### API Controllers

| Controller | Endpoints | Auth |
|---|---|---|
| `AuthController` | `POST /api/auth/register`, `login`, `verify-email`, `resend-verification` | Public, **rate-limited 5/min per IP** (`[EnableRateLimiting("auth")]`) |
| `QuestionsController` | `GET /api/questions?category&difficulty&lang&page&pageSize` | Public |
| `QuestionsController` | `GET /api/questions/{id}?lang` | Public |
| `QuizController` | `GET /api/quiz/questions?category&difficulty&count` | Public |
| `QuizController` | `POST /api/quiz/submit` | `[Authorize]` |
| `ProgressController` | `GET /api/progress/dashboard` | `[Authorize]` |
| `ProgressController` | `GET /api/progress/radar` | `[Authorize]` |
| `FlashcardsController` | `GET /api/flashcards` | `[Authorize]` |
| `FlashcardsController` | `POST /api/flashcards/{id}/review` | `[Authorize]` |
| `SystemDesignController` | `GET /api/system-design?difficulty` | Public |
| `SystemDesignController` | `GET /api/system-design/{id}` | Public |

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
│   ├── flashcards.api.ts      ← getCards(), reviewCard(id, rating)
│   └── systemDesign.api.ts    ← getAll(), getById(id)
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         ← Sidebar + Header + Outlet; owns collapsed state
│   │   ├── ProtectedLayout.tsx← Layout + auth redirect to /login if no token
│   │   ├── PublicLayout.tsx   ← Navbar + Outlet (landing, pricing)
│   │   ├── Navbar.tsx         ← Dark top bar for public pages
│   │   ├── Sidebar.tsx        ← Collapsible (56px/228px); lock icons for guest on protected routes
│   │   └── Header.tsx         ← White top bar inside app
│   └── ui/
│       └── MarkdownRenderer.tsx ← Shared MD renderer (## headers, **bold**, code, lists, tables); used by Questions + System Design
├── features/
│   ├── landing/LandingPage.tsx
│   ├── auth/LoginPage.tsx               ← Sets token on login; handles 403 (unverified) with resend
│   ├── auth/RegisterPage.tsx            ← On success shows "check your email" (no auto-login) + resend
│   ├── auth/VerifyEmailPage.tsx         ← /verify-email?token=…; verifies + auto-logs in; error state offers resend
│   ├── dashboard/DashboardPage.tsx      ← Connected to GET /api/progress/dashboard
│   ├── questions/QuestionsPage.tsx      ← Connected to GET /api/questions
│   ├── questions/QuestionDetailPage.tsx ← Connected to GET /api/questions/:id
│   ├── quiz/QuizPage.tsx                ← Public; 3-screen flow; guest quota (3 free); SM-2 submit
│   ├── flashcard/FlashcardPage.tsx      ← Connected to GET /api/flashcards + POST review
│   ├── system-design/SystemDesignPage.tsx       ← Connected to GET /api/system-design (list + framework banner)
│   ├── system-design/SystemDesignGuidePage.tsx  ← Static "How to approach a system design interview" 7-step guide
│   ├── system-design/SystemDesignDetailPage.tsx ← Connected to GET /api/system-design/:id (read-only tabbed study view)
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
Layout          →  /questions, /questions/:id, /quiz, /system-design, /system-design/guide, /system-design/:id, /pricing
ProtectedLayout →  /dashboard, /flashcard, /progress
(no layout)     →  /login, /register, /verify-email
```

> **Important**: `/quiz` is in the public `Layout` (NOT ProtectedLayout) — guests can take quizzes with a 3-attempt limit.
> **System Design** is a read-only study reference (all routes public). `/system-design/guide` is static; the list + detail pages are API-driven. Route ordering: `guide` (static) is ranked above `:id` (dynamic) by React Router.

### Auth Token Storage
- **Login** and **verify-email** set **two** keys on success (register no longer logs in — email must be verified first):
  - `localStorage["access_token"]` — read by Axios request interceptor
  - Zustand store via `setAuth()` — persisted automatically to `localStorage["auth-store"]`
- On 401 (non-`/auth/` endpoints): Axios interceptor removes both keys and does `window.location.href = "/login"`
- Login 403 = email not verified → LoginPage shows a resend option (not a redirect)
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
| `SystemDesignPage` | `GET /api/system-design` | TanStack Query; list cards + framework banner |
| `SystemDesignDetailPage` | `GET /api/system-design/:id` | TanStack Query; tabbed Markdown reading view; Deep Dive/Trade-offs Pro-gated |

### Still hardcoded (needs backend endpoint)
| Page | Needs | Planned API |
|---|---|---|
| `SystemDesignGuidePage` | Framework guide content | Static by design (canonical, rarely changes) — no API needed |
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

### Email config (prod, in the box's `/opt/interviewprep/.env`)
```
Email__Provider=smtp                       # smtp | ses | console (default)
Email__FromAddress=noreply@lazyndev.io.vn  # a Brevo-verified sender
Email__FromName=InterviewPrep
App__FrontendBaseUrl=https://lazyndev.io.vn  # used to build the verification link
# SMTP (Brevo — free 300/day):
Email__Smtp__Host=smtp-relay.brevo.com
Email__Smtp__Port=587
Email__Smtp__User=<brevo SMTP login>       # from Brevo → SMTP & API → SMTP tab
Email__Smtp__Password=<brevo SMTP key>     # the SMTP key (NOT an API key / account password)
```
> ⚠️ Config keys use **double underscore** `__` (maps to nested `:`). Single underscore silently fails.
> Locally, leave `Email__Provider` unset → console mode logs the link (no email setup needed).

### Frontend (`.env.development` / `.env.production`)
```
VITE_API_URL=http://localhost:5000            # prod: https://api.lazyndev.io.vn
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
4524654  Add SMTP email provider (Brevo/SendGrid/Gmail)
8bd9d8c  Add email verification on registration
b5a36bd  Skip deploy on docs/terraform/markdown-only pushes
b23be61  Harden auth: password policy + rate limiting
e5de7c9  Fix difficulty filter: compare enum instead of ToString()
9f221f5  Update CONTEXT.md: AWS deployment + CI/CD live
9b9b7b9  Cache-bust favicon URL
e6bdd28  Deploy API via SSM Run Command instead of SSH
441628f  Add AWS deployment + CI/CD scaffolding
7bc7635  implement the system design feature
```

> **`docs/` and `terraform/` are git-ignored / uncommitted** (deploy runbook + interview prep kept local; terraform scaffold parked). `deploy.yml` has `paths-ignore` so docs/terraform/markdown-only pushes don't trigger a deploy.

### Recent work (all committed to `main`; deployed live)

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
- `client.ts` — on 401: clears both `"access_token"` + `"auth-store"`, redirects to `/login`; **skips redirect for `/auth/*` endpoints** so login errors show in-place instead of bouncing
- `quiz.api.ts submit()` — uses raw `fetch` to bypass Axios interceptor (prevents mid-quiz token expiry from bouncing user off results)
- `Program.cs` — **`opts.MapInboundClaims = false`** on JwtBearer so the `sub` claim isn't remapped to `ClaimTypes.NameIdentifier`. Without this, controllers reading `JwtRegisteredClaimNames.Sub` got null → 401 → login redirect loop after a successful sign-in.
- `LoginPage.tsx` / `RegisterPage.tsx` — replaced `alert()` with inline `setError()` messages

**System Design — reading reference feature:**
- Entity `SystemDesignCase` extended + migration `SystemDesignReadingContent` (applied)
- `GetSystemDesignCasesQuery` / `GetSystemDesignCaseByIdQuery` + handlers → `SystemDesignController` (public)
- `system-design-cases.json` (4 cases) + `DataSeeder.SeedSystemDesignAsync`
- `components/ui/MarkdownRenderer.tsx` extracted from QuestionDetailPage (shared)
- `systemDesign.api.ts`, `SystemDesignPage.tsx` (list), `SystemDesignGuidePage.tsx` (framework), `SystemDesignDetailPage.tsx` (detail), `router.tsx` (detail moved to public Layout, `/system-design/guide` added)
- Mock-interview UI/entity fields preserved (unused) for a future practice mode
- Incidental: removed dead `App.tsx` Vite-template code + unused var in `LandingPage.tsx` (were breaking `npm run build`)

**Auth hardening:**
- `RegisterCommandValidator` (FluentValidation) — password ≥8 + ≥1 uppercase + ≥1 special, enforced **server-side** (there were no backend validators before); matching Zod rules on `RegisterPage`
- Rate limiting (.NET 8 `AddRateLimiter`) — **5 req/min per client IP** on the auth endpoints, JSON 429
- Bug fix: difficulty filter compared `enum.ToString()` in a `Where` → untranslatable → 500; now compares the enum

**Email verification on registration:**
- `User` + migration `EmailVerification` (backfills existing users verified)
- `IEmailService` → `SmtpEmailService` (MailKit) / `SesEmailService` / `ConsoleEmailService`, chosen by `Email:Provider`
- Register → creates unverified user + emails 24h link (no auto-login); Login → 403 until verified
- `verify-email` (auto-login on success) + `resend-verification` endpoints
- Frontend: RegisterPage "check your email" screen, `/verify-email` page, LoginPage 403-handling with resend
- **Prod email = Brevo SMTP** (free 300/day). SES was built but AWS **rejected production access**, and its sandbox only emails verified addresses — so switched to Brevo. Brevo needed the EC2 Elastic IP added to **Authorized IPs**.

**Resilience (fixed):** verification email send is **non-fatal** (logged, not thrown) — a provider hiccup no longer 500s registration or leaves a stuck account. Re-registering an **unverified** email updates the pending account + re-issues a link (instead of "already registered"). Applies to both register and resend.

**AWS deployment + CI/CD (live):**
- API: `/health` endpoint, `UseForwardedHeaders` (proxy-aware), comma-separated multi-origin CORS, migrate-on-startup (`db.Database.MigrateAsync()`)
- `Dockerfile`: listens on 8080, runs as non-root `app` user
- `deploy/`: `docker-compose.prod.yml` (api + redis + Caddy), `Caddyfile` (auto-HTTPS), `.env.production.example`
- `.github/workflows/`: `ci.yml` (build + test), `deploy.yml` (build → ECR → **SSM Run Command** deploy → S3 + CloudFront)
- Domain changed from placeholder to **`lazyndev.io.vn`** / **`api.lazyndev.io.vn`**; favicon replaced + cache-busted (`?v=2`)
- Full details in §15.

---

## 12. What's Next — Roadmap

### ⚡ NEXT SESSION

Phase 1 core features are complete **and the app is deployed with CI/CD** (§15). Remaining work:

#### Stripe checkout
Wire the Pricing page CTAs to actual Stripe checkout:
- `StripeService` exists in Infrastructure but not wired to an endpoint
- Need `POST /api/subscriptions/checkout` → creates Stripe checkout session
- Frontend: pricing page "Upgrade" buttons → redirect to Stripe hosted checkout
- Webhook handler for `checkout.session.completed` (point Stripe webhook at `https://api.lazyndev.io.vn`)

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
- [x] System Design — reading reference (framework guide + 4 worked-example cases, API-driven)
- [x] Deploy to AWS — EC2 + Docker Compose + Caddy, RDS, S3 + CloudFront (live)
- [x] CI/CD pipeline — GitHub Actions, OIDC, SSM-based deploy
- [x] Auth hardening — password policy + rate limiting
- [x] Email verification on registration (live, via Brevo SMTP)
- [ ] Stripe checkout

### Phase 2
- [ ] AI feedback endpoint (AiFeedbackService exists, not wired)
- [ ] Mock interview mode (timed, phased)
- [ ] Team plan management
- [ ] Google OAuth

### Technical Debt
- Delete `Class1.cs` placeholder files in Domain/Application/Infrastructure
- Store refresh tokens in DB (currently not persisted — 60 min JWT only)
- Move prod secrets from on-box `.env` to AWS Secrets Manager / SSM Parameter Store
- Expand test coverage — **23 unit tests exist** (SM-2, password validator, login/verify handlers, difficulty filter; EF InMemory + Moq); still no integration tests (Testcontainers stub) or frontend tests (no Vitest)
- Add error boundaries in React
- `DashboardPage` "Continue Learning" card is hardcoded
- No admin UI to delete users — done via `psql` on the box (see §15)
- **Prod hardening:** add monitoring/alerting; move Redis to ElastiCache; ALB + 2+ instances for zero-downtime (then move migrations out of startup); the deploy auto-migrates on startup (fine for a single instance only)
- ✅ Done: `/health`; HTTPS; SSM deploy (no port 22); rate limiting; password policy; email verification

---

## 13. Security Notes

### Already secure
- BCrypt password hashing
- JWT HS256 with issuer/audience validation
- EF Core parameterised queries (no raw SQL)
- CORS whitelist (not wildcard)
- Secrets git-ignored

### Production posture (live)
- ✅ HTTPS everywhere (Caddy/Let's Encrypt on API, ACM/CloudFront on frontend)
- ✅ No inbound SSH for deploys (SSM Run Command); port 22 restricted to owner IP
- ✅ RDS private (no public access), reachable only from the EC2 security group
- ✅ GitHub→AWS auth via OIDC (no long-lived access keys)
- ✅ Secrets git-ignored (on-box `.env`, chmod 600)

### Still to harden
- Rate limit `POST /api/auth/login` (brute force)
- Move JWT secret + DB password to AWS Secrets Manager / SSM Parameter Store
- Persist + rotate refresh tokens
- Add monitoring/alerting (currently blind to incidents)

---

## 14. Docker Compose Services

```yaml
postgres:  postgres:16-alpine   port 5433:5432  (5433 on host, 5432 in container)
redis:     redis:7-alpine        port 6379:6379
api:       custom Dockerfile     port 5000:8080  (container now listens on 8080; not used in local dev — run dotnet directly)
web:       custom Dockerfile     port 3000:80    (not used in local dev — run npm directly)
```

> **Why port 5433?** Local PostgreSQL installation already occupies 5432. Docker maps to 5433 to avoid conflict.

> **Prod compose is separate:** `deploy/docker-compose.prod.yml` (api + redis + Caddy, no Postgres — uses RDS). See §15.

---

## 15. Production Deployment (AWS)

> Full click-by-click runbook lives in the git-ignored `docs/DEPLOYMENT.md`. This is the summary.

### Architecture
```
Users ─ https://lazyndev.io.vn ──────→ CloudFront ──→ S3            (React static build)
      ─ https://api.lazyndev.io.vn ──→ EC2 (Caddy auto-HTTPS)
                                         ├─ api container (:8080)
                                         └─ redis container
                                      ──→ RDS PostgreSQL (private)
```

| Concern | Service |
|---|---|
| Region | **ap-southeast-2** (Sydney) |
| Frontend | S3 (private) + CloudFront (OAC); ACM cert in **us-east-1**; SPA 403/404 → `/index.html` |
| API host | EC2 (Amazon Linux 2023, free-tier micro + 2 GB swap), Docker Compose |
| TLS (API) | Caddy + Let's Encrypt (auto) for `api.lazyndev.io.vn` |
| Database | RDS PostgreSQL (private; inbound 5432 only from EC2 security group) |
| Cache | Redis container on the box (ElastiCache later) |
| Image registry | ECR (`interviewprep-api`) |
| DNS | Route 53 hosted zone; apex/`www` → CloudFront, `api` → EC2 Elastic IP (`13.55.32.102`) |
| Email | **Brevo SMTP** (free 300/day) via `SmtpEmailService`; sender = `noreply@lazyndev.io.vn` |

### CI/CD (GitHub Actions)
- **`ci.yml`** — on every PR/push: backend build + unit tests, frontend typecheck + build.
- **`deploy.yml`** — on push to `main`:
  1. Build API image → push to ECR (tagged with commit SHA + `latest`).
  2. **Deploy via SSM Run Command** → box pulls image + `docker compose up -d` (no SSH / port 22).
  3. Build frontend → `aws s3 sync` → CloudFront invalidation.
- **Auth:** GitHub → AWS via **OIDC** (role `interviewprep-gha-deploy`), no static keys.
- **IAM:** instance role `interviewprep-ec2-role` has ECR read + `AmazonSSMManagedInstanceCore`.

### Required GitHub secrets
`AWS_ROLE_ARN`, `EC2_INSTANCE_ID`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`
(the old SSH secrets `EC2_HOST`/`EC2_USER`/`EC2_SSH_KEY` are no longer used).

### How to deploy
Just `git push origin main` → the pipeline does the rest. Rollback = re-point `ECR_IMAGE`
in the box's `/opt/interviewprep/.env` to an older SHA tag and `docker compose up -d`.

### Email (Brevo SMTP)
- Set on the box `.env`: `Email__Provider=smtp`, `Email__Smtp__Host=smtp-relay.brevo.com`, `Port=587`, `User` = Brevo SMTP login, `Password` = Brevo **SMTP key** (not an API key), `Email__FromAddress` = a Brevo-verified sender, `App__FrontendBaseUrl=https://lazyndev.io.vn`.
- Brevo **"Authorized IPs"** must include the EC2 Elastic IP (`13.55.32.102`) or SMTP returns `525 5.7.1 Unauthorized IP`.
- SES was set up first but AWS **rejected production access** (sandbox only emails verified addresses) → switched to Brevo. `SesEmailService` remains in code (`Email__Provider=ses` to use it).

### Managing prod data (no admin UI yet)
- Delete a user: on the box via Session Manager, run `psql` in a throwaway `postgres:16-alpine` container against RDS (reads host/password from `.env`) → `DELETE FROM "Users" WHERE "Email"='...';`.

### DNS gotchas hit during setup
- Domain registrar (PA Vietnam) had a **split delegation** (Route 53 + PA Vietnam NS) → intermittent `NXDOMAIN`. Fixed by setting the registrar's nameservers to **only the 4 Route 53 NS**.
- All DNS records (apex/www/api aliases, SES/Brevo DKIM CNAMEs, ACM validation) live in the **Route 53** hosted zone — not the registrar panel.

### Access / other gotchas
- SSH (port 22) is restricted to owner IP and rotates; use **SSM Session Manager** for a shell (no SSH needed).
- Config keys use **double underscore** (`Email__Smtp__Host`) — single underscore silently fails.
- Migrations run on container startup (fine for one instance; move to a CI step if scaling out).
- The box's `/opt/interviewprep/.env` (chmod 600) holds prod secrets — never committed.
- Favicon is cache-busted via `?v=2` in `index.html` (browsers cache favicons hard).
