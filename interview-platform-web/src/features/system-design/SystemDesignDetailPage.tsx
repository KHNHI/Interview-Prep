import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const TABS    = ["Overview", "Requirements", "High-Level Design", "Deep Dive", "Trade-offs"];
const PRO_TABS = new Set(["Deep Dive", "Trade-offs"]);

const CASE = {
  title: "Design a Rate Limiter",
  difficulty: "Medium",
  tags: ["API", "Redis", "Distributed"],
  functional: [
    "Limit requests per user/IP/API key within a time window",
    "Support multiple algorithms: Token Bucket, Sliding Window, Fixed Window",
    "Return HTTP 429 responses with Retry-After header",
    "Allow different limits for different API endpoints",
  ],
  nonFunctional: [
    "P99 latency overhead < 5ms per request",
    "99.99% availability — cannot be a single point of failure",
    "Support 1 million+ concurrent users",
    "Distributed — works across multiple data centers",
  ],
  overview: `A rate limiter controls the rate of requests that clients can make to an API. It is used to prevent abuse, ensure fair usage, and protect downstream services from being overwhelmed.

The system must handle millions of users with low latency overhead, and be configurable per user, IP, or API key, supporting multiple algorithms.`,
  highLevel: `The core of the design involves a Redis cluster for atomic counter operations (INCR + EXPIRE) and a thin middleware layer at the API Gateway or application level.

Request flow: Client → API Gateway → Rate Limit Check (Redis) → Backend Service`,
  deepDive: `Detailed analysis of the Token Bucket algorithm implementation, Redis Lua scripts for atomicity, sliding window log trade-offs, and handling Redis failures with local fallbacks.`,
  tradeoffs: `Token Bucket vs Sliding Window — memory usage vs accuracy. Redis vs in-memory — distributed vs single-node. Hard limit vs soft limit — user experience vs abuse prevention.`,
  hints: [
    "Think about where the rate limiter should live — client, server, or gateway?",
    "How will you handle distributed counters across multiple API instances?",
  ],
};

export function SystemDesignDetailPage() {
  const [tab, setTab] = useState("Overview");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <button onClick={() => navigate("/system-design")}
        className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to System Design
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-[#E5E5E5] text-[#252525]">
              {CASE.difficulty}
            </span>
            {CASE.tags.map(t => (
              <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
            ))}
          </div>
          <h1 className="text-[20px] font-bold tracking-tight">{CASE.title}</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Start 45 min Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-[18px] py-2.5 text-[13px] font-medium transition-all duration-100 border-b-2 -mb-px flex items-center gap-1.5",
              tab === t ? "text-ink-1 border-ink-1" : "text-ink-3 border-transparent hover:text-ink-1"
            )}>
            {t}
            {PRO_TABS.has(t) && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-[3px] text-[9px] font-semibold bg-ink-1 text-white leading-none">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left — content */}
        <div className="flex flex-col gap-4">
          {tab === "Overview" && (
            <div className="bg-white border border-line rounded shadow-card px-6 py-5">
              <h2 className="text-[14px] font-semibold text-ink-1 mb-3">Problem Overview</h2>
              <p className="text-[13.5px] leading-[1.75] text-ink-2 whitespace-pre-wrap">{CASE.overview}</p>
            </div>
          )}

          {tab === "Requirements" && (
            <div className="flex flex-col gap-3.5">
              {[
                { title: "Functional Requirements",     items: CASE.functional },
                { title: "Non-Functional Requirements", items: CASE.nonFunctional },
              ].map(section => (
                <div key={section.title} className="bg-white border border-line rounded shadow-card px-6 py-5">
                  <h2 className="text-[13.5px] font-semibold text-ink-1 mb-3">{section.title}</h2>
                  <ul className="flex flex-col gap-2">
                    {section.items.map((r, i) => (
                      <li key={i} className="flex gap-2.5 text-[13.5px] text-ink-2">
                        <span className="text-ink-3 flex-shrink-0">{i + 1}.</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {tab === "High-Level Design" && (
            <div className="bg-white border border-line rounded shadow-card px-6 py-5">
              <h2 className="text-[13.5px] font-semibold text-ink-1 mb-3">High-Level Design</h2>
              <p className="text-[13.5px] leading-[1.75] text-ink-2 whitespace-pre-wrap">{CASE.highLevel}</p>
            </div>
          )}

          {PRO_TABS.has(tab) && (
            <div className="pro-gate">
              <div className="pro-gate-inner">
                <div className="bg-white border border-line rounded shadow-card px-6 py-5">
                  <h2 className="text-[13.5px] font-semibold text-ink-1 mb-3">{tab}</h2>
                  <p className="text-[13.5px] leading-[1.75] text-ink-2">
                    {tab === "Deep Dive" ? CASE.deepDive : CASE.tradeoffs}
                  </p>
                </div>
              </div>
              <div className="pro-gate-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div className="text-[13px] font-semibold text-ink-1">Pro content</div>
                <div className="text-[12px] text-ink-2 text-center max-w-[220px] leading-snug">Upgrade to access Deep Dive and Trade-off analysis</div>
                <button onClick={() => navigate("/pricing")}
                  className="px-3 py-1.5 rounded-sm text-[12px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — diagram + hints */}
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-line-strong rounded bg-surface-alt min-h-[260px] text-ink-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span className="text-[12.5px]">Architecture diagram area</span>
            <span className="text-[11.5px]">Draw or upload your design here</span>
            <button className="mt-1 px-3 py-1.5 rounded-sm text-[12px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
              Upload Diagram
            </button>
          </div>

          <div className="bg-white border border-line rounded shadow-card px-5 py-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-label text-ink-3 mb-2.5">Hints</div>
            <div className="flex flex-col gap-2.5">
              {CASE.hints.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[12px] font-semibold text-ink-3 flex-shrink-0">#{i + 1}</span>
                  <p className="text-[12.5px] text-ink-2 leading-relaxed">{h}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
