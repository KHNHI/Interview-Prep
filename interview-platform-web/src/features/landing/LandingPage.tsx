import { Link } from "react-router-dom";

// ─── Data ──────────────────────────────────────────────────────────────────

const STATS = [
  { value: "1,200+",  label: "Curated questions"          },
  { value: "20+",     label: "System Design cases"         },
  { value: "SM-2",    label: "Spaced repetition algorithm" },
  { value: "AI",      label: "Mock interview feedback"     },
];

const FEATURES = [
  {
    icon: <BookIcon />,
    title: "Q&A Bank",
    desc: "1,200+ questions across DSA, System Design, Networking, Cloud, OS and more — with full bilingual EN/VI answers.",
  },
  {
    icon: <QuizIcon />,
    title: "Quizzes",
    desc: "Multiple-choice sessions with instant explanations and difficulty filters. Review wrong answers with one click.",
  },
  {
    icon: <CardIcon />,
    title: "Flashcards",
    desc: "Flip-card study mode powered by the SM-2 spaced repetition algorithm. Cards surface right when you're about to forget.",
  },
  {
    icon: <ArchIcon />,
    title: "System Design",
    desc: "Structured 45-minute mock interviews with phased hints, architecture diagram workspace, and scoring rubrics.",
  },
  {
    icon: <AiIcon />,
    title: "AI Feedback",
    desc: "Submit your system design solution and receive structured scoring on scalability, reliability, and trade-offs.",
  },
  {
    icon: <ChartIcon />,
    title: "Analytics",
    desc: "Skill radar chart, activity heatmap, and composite interview readiness score — so you always know where you stand.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    desc: "Sign up free in under a minute. No credit card, no commitment. Access the full Q&A bank immediately.",
  },
  {
    n: "02",
    title: "Practice every day",
    desc: "Work through Q&A, quiz sessions, and flashcard reviews. The SM-2 algorithm adapts to your retention rate.",
  },
  {
    n: "03",
    title: "Track your readiness",
    desc: "Monitor your skill radar, streak, and readiness score. Know exactly when you're ready to interview.",
  },
];

const TIERS = [
  {
    name: "Free",
    price: "0₫",
    note: "No credit card",
    items: ["Browse all 1,200+ Q&A", "10 full answers per day", "5 quizzes per day", "Activity streak & heatmap"],
    cta: "Start for free",
    to: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "99,000₫",
    note: "per month",
    items: ["Unlimited Q&A & quizzes", "Flashcards + SM-2 repetition", "All 20+ System Design cases", "AI feedback (10 sessions/mo)", "Skill radar & readiness score"],
    cta: "Upgrade to Pro",
    to: "/register",
    featured: true,
  },
  {
    name: "Team",
    price: "199,000₫",
    note: "per month",
    items: ["Everything in Pro", "Up to 10 members", "Shared leaderboard", "Custom roadmaps"],
    cta: "Contact us",
    to: "/pricing",
    featured: false,
  },
];

const COMPANIES = ["Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Uber"];

// ─── Page ──────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="font-sans">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-sidebar min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.12] mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/50">
          Interview Prep Platform
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-[56px] md:text-[72px] font-bold text-white leading-[1.05] tracking-[-0.04em] max-w-3xl mb-6">
        Practice smarter.
        <br />
        <span className="text-white/40">Land the role.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-[16px] text-white/50 max-w-[480px] leading-relaxed mb-10">
        A focused platform for software engineers — curated Q&A, spaced
        repetition, and AI-powered mock interviews in one place.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-3 mb-16">
        <Link to="/register"
          className="px-6 py-2.5 rounded-sm text-[13.5px] font-semibold bg-white text-ink-1 hover:bg-[#EFEFEF] transition-colors">
          Start for free
        </Link>
        <Link to="/questions"
          className="px-6 py-2.5 rounded-sm text-[13.5px] font-medium text-white/70 border border-white/[0.14] hover:border-white/30 hover:text-white/90 transition-all">
          Browse Q&A →
        </Link>
      </div>

      {/* Divider + companies */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-px h-8 bg-white/10" />
        <p className="text-[11.5px] text-white/25 tracking-wide">
          Preparing engineers for interviews at
        </p>
        <div className="flex items-center gap-5 flex-wrap justify-center">
          {COMPANIES.map(c => (
            <span key={c} className="text-[12px] font-medium text-white/20">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="bg-white border-b border-line">
      <div className="max-w-5xl mx-auto grid grid-cols-4 divide-x divide-line">
        {STATS.map(s => (
          <div key={s.label} className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <div className="text-[26px] font-bold tracking-tight text-ink-1">{s.value}</div>
            <div className="text-[12px] text-ink-3 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className="bg-canvas py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-3">
            What's inside
          </p>
          <h2 className="text-[32px] font-bold tracking-tight text-ink-1 max-w-sm leading-tight">
            Everything you need to prepare
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white border border-line rounded shadow-card p-5 group hover:shadow-card-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-canvas border border-line flex items-center justify-center mb-4 text-ink-2 group-hover:bg-ink-1 group-hover:text-white group-hover:border-ink-1 transition-all duration-150">
                {f.icon}
              </div>
              <div className="font-semibold text-[14px] text-ink-1 mb-1.5">{f.title}</div>
              <p className="text-[13px] text-ink-3 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="bg-white py-24 px-6 border-t border-line">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-3">
            The process
          </p>
          <h2 className="text-[32px] font-bold tracking-tight text-ink-1 max-w-xs leading-tight">
            How it works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-0 relative">
          {/* Connecting line */}
          <div className="absolute top-[22px] left-[calc(16.66%+8px)] right-[calc(16.66%+8px)] h-px bg-line" />

          {STEPS.map((s, i) => (
            <div key={s.n} className="relative pr-10">
              {/* Number badge */}
              <div className="w-11 h-11 rounded-full bg-ink-1 flex items-center justify-center mb-5 relative z-10">
                <span className="text-[11px] font-bold text-white/70">{s.n}</span>
              </div>
              <h3 className="font-semibold text-[15px] text-ink-1 mb-2">{s.title}</h3>
              <p className="text-[13px] text-ink-3 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing teaser ────────────────────────────────────────────────────────

function PricingSection() {
  return (
    <section className="bg-canvas py-24 px-6 border-t border-line">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-3">Pricing</p>
            <h2 className="text-[32px] font-bold tracking-tight text-ink-1 leading-tight">
              Start free,<br />upgrade when ready
            </h2>
          </div>
          <Link to="/pricing" className="text-[13px] font-medium text-ink-2 hover:text-ink-1 underline underline-offset-4 transition-colors flex-shrink-0">
            See full comparison →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-4">
          {TIERS.map(t => (
            <div key={t.name}
              className={`flex flex-col bg-white rounded-lg shadow-card p-6 border ${t.featured ? "border-ink-1 border-[1.5px]" : "border-line"}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-[14px] text-ink-1">{t.name}</span>
                {t.featured && (
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold bg-ink-1 text-white">
                    Popular
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[28px] font-bold tracking-tight text-ink-1">{t.price}</span>
              </div>
              <span className="text-[12px] text-ink-3 mb-5">{t.note}</span>

              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {t.items.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[12px] text-ink-3 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-[12.5px] text-ink-2 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to={t.to}
                className={`block text-center py-2 rounded-sm text-[13px] font-medium transition-colors ${
                  t.featured
                    ? "bg-ink-1 text-white hover:bg-[#2A2A2A]"
                    : "bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA]"
                }`}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-sidebar py-24 px-6 border-t border-white/[0.07]">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="w-px h-10 bg-white/10 mb-8" />
        <h2 className="text-[40px] font-bold tracking-tight text-white leading-tight mb-4">
          Start preparing today.
        </h2>
        <p className="text-[15px] text-white/40 max-w-md leading-relaxed mb-10">
          Join engineers who are actively preparing for top tech
          interviews — free forever, no credit card required.
        </p>
        <Link to="/register"
          className="px-8 py-3 rounded-sm text-[14px] font-semibold bg-white text-ink-1 hover:bg-[#EFEFEF] transition-colors">
          Create free account
        </Link>
        <p className="text-[12px] text-white/25 mt-4">
          No credit card · Free tier available indefinitely
        </p>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Product:   ["Q&A Bank", "Quizzes", "Flashcards", "System Design", "Analytics"],
  Resources: ["Pricing", "Changelog", "Roadmap"],
  Company:   ["About", "Blog", "Contact"],
  Legal:     ["Terms of Service", "Privacy Policy"],
};

function FooterSection() {
  return (
    <footer className="bg-sidebar border-t border-white/[0.07] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-[200px_1fr] gap-16 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <span className="text-[13px] font-bold text-white">InterviewPrep</span>
            </div>
            <p className="text-[12px] text-white/30 leading-relaxed">
              A focused interview prep platform for software engineers.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-4 gap-8">
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-3">
                  {section}
                </div>
                <ul className="flex flex-col gap-2">
                  {links.map(l => (
                    <li key={l}>
                      <span className="text-[12.5px] text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.07] flex items-center justify-between">
          <span className="text-[12px] text-white/20">© 2024 InterviewPrep. All rights reserved.</span>
          <span className="text-[12px] text-white/20">Built for the Vietnamese SE community</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function BookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function QuizIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function CardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function ArchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function AiIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/><path d="M12 6v6l4 2"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
