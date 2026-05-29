import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const TIERS = [
  {
    name: "Free", price: "0₫", period: "", featured: false,
    desc: "Get started with the essentials.",
    cta: "Get started free",
    features: [
      { label: "Browse all Q&A questions",      ok: true  },
      { label: "10 full answers per day",        ok: true  },
      { label: "5 quizzes per day",              ok: true  },
      { label: "Activity streak & heatmap",      ok: true  },
      { label: "3 System Design samples",        ok: true  },
      { label: "Spaced repetition (SM-2)",       ok: false },
      { label: "AI feedback & scoring",          ok: false },
      { label: "Skill radar chart",              ok: false },
      { label: "Mock interview mode",            ok: false },
    ],
  },
  {
    name: "Pro", price: "99,000₫", period: "/month", featured: true,
    desc: "Everything you need to land your next role.",
    cta: "Upgrade to Pro",
    annual: "799,000₫/year — save 33%",
    features: [
      { label: "All Q&A answers — unlimited",            ok: true },
      { label: "All quiz modes — unlimited",             ok: true },
      { label: "Flashcards + Spaced Repetition (SM-2)",  ok: true },
      { label: "All 20+ System Design cases",            ok: true },
      { label: "Mock interview mode (45 min timed)",     ok: true },
      { label: "AI feedback & scoring (10/month)",       ok: true },
      { label: "Skill radar chart — live tracking",      ok: true },
      { label: "Interview readiness score",              ok: true },
      { label: "Learning roadmap by role",               ok: true },
    ],
  },
  {
    name: "Team", price: "199,000₫", period: "/month", featured: false,
    desc: "For teams preparing together.",
    cta: "Contact us",
    features: [
      { label: "Everything in Pro",        ok: true  },
      { label: "Up to 10 team members",    ok: true  },
      { label: "Shared leaderboard",       ok: true  },
      { label: "Custom roadmaps",          ok: true  },
      { label: "Admin dashboard",          ok: true  },
      { label: "Priority support",         ok: true  },
      { label: "Onboarding call",          ok: true  },
      { label: "Custom question sets",     ok: false },
      { label: "SSO / SAML (Enterprise)",  ok: false },
    ],
  },
];

const FAQ = [
  { q: "Can I cancel anytime?",           a: "Yes. Cancel at any time — your subscription continues until the end of the billing period." },
  { q: "Is there a free trial for Pro?",  a: "The Free tier is available indefinitely. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "All major credit/debit cards via Stripe. Vietnamese bank transfers available on request." },
];

export function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[26px] font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-[13.5px] text-ink-3 mt-1.5">Start free. Upgrade when you're ready to accelerate.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 max-w-[860px] mx-auto w-full">
        {TIERS.map(tier => (
          <div key={tier.name}
            className={cn("flex flex-col bg-white border rounded-lg shadow-card p-6",
              tier.featured ? "border-ink-1 border-[1.5px]" : "border-line"
            )}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[14px] text-ink-1">{tier.name}</span>
                {tier.featured && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-ink-1 text-white">Popular</span>
                )}
              </div>
              <div className="flex items-baseline gap-0.5 mb-1">
                <span className="text-[26px] font-bold tracking-tighter text-ink-1">{tier.price}</span>
                <span className="text-[12px] text-ink-3">{tier.period}</span>
              </div>
              {"annual" in tier && tier.annual && (
                <div className="text-[11.5px] text-ink-3 mb-1">{tier.annual as string}</div>
              )}
              <p className="text-[12.5px] text-ink-2 leading-snug">{tier.desc}</p>
            </div>

            <ul className="border-t border-line pt-4 mb-5 flex flex-col gap-2 flex-1">
              {tier.features.map(f => (
                <li key={f.label} className={cn("flex gap-2 items-start", !f.ok && "opacity-35")}>
                  <span className="text-[12px] flex-shrink-0 mt-0.5 text-ink-1">{f.ok ? "✓" : "–"}</span>
                  <span className="text-[12.5px] text-ink-2 leading-snug">{f.label}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => tier.name === "Free" ? navigate("/register") : undefined}
              className={cn("w-full py-2.5 rounded-sm text-[13px] font-medium transition-colors",
                tier.featured
                  ? "bg-ink-1 text-white hover:bg-[#2A2A2A]"
                  : "bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA]"
              )}>
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-[580px] mx-auto w-full">
        <h2 className="text-[15px] font-semibold text-ink-1 text-center mb-4">Frequently asked questions</h2>
        {FAQ.map(({ q, a }) => (
          <div key={q} className="border-b border-line py-3.5">
            <div className="font-medium text-[13px] text-ink-1 mb-1.5">{q}</div>
            <div className="text-[13px] text-ink-2 leading-relaxed">{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
