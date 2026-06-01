import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { systemDesignApi } from "../../api/systemDesign.api";
import { useAuthStore } from "../../stores/authStore";
import { MarkdownRenderer } from "../../components/ui/MarkdownRenderer";
import { cn } from "../../utils/cn";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

type TabKey = "overview" | "requirements" | "highLevelDesign" | "deepDive" | "tradeoffs";

const TABS: { key: TabKey; label: string; pro: boolean }[] = [
  { key: "overview",        label: "Overview",          pro: false },
  { key: "requirements",    label: "Requirements",      pro: false },
  { key: "highLevelDesign", label: "High-Level Design", pro: false },
  { key: "deepDive",        label: "Deep Dive",         pro: true  },
  { key: "tradeoffs",       label: "Trade-offs",        pro: true  },
];

export function SystemDesignDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const planTier = useAuthStore(s => s.planTier);
  const [tab, setTab] = useState<TabKey>("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-design-case", id],
    queryFn:  () => systemDesignApi.getById(id!).then(r => r.data.data),
    enabled:  !!id,
    staleTime: 1000 * 60 * 10,
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[860px] flex flex-col gap-5">
        <div className="h-4 w-40 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="bg-white border border-line rounded shadow-card px-6 py-5 h-[80px] animate-pulse" />
        <div className="bg-white border border-line rounded shadow-card px-6 py-5 h-[300px] animate-pulse" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="max-w-[860px] flex flex-col gap-5">
        <BackButton onClick={() => navigate("/system-design")} />
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 text-center text-[13px] text-ink-3">
          Case not found. It may have been removed.
        </div>
      </div>
    );
  }

  const contentFor: Record<TabKey, string | undefined> = {
    overview:        data.overview,
    requirements:    data.requirements,
    highLevelDesign: data.highLevelDesign,
    deepDive:        data.deepDive,
    tradeoffs:       data.tradeoffs,
  };

  const activeTab = TABS.find(t => t.key === tab)!;
  const locked    = activeTab.pro && planTier === "free";
  const body      = contentFor[tab];

  return (
    <div className="max-w-[860px] flex flex-col gap-5">
      <BackButton onClick={() => navigate("/system-design")} />

      {/* Header */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
            DIFFICULTY_STYLE[data.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
            {data.difficulty}
          </span>
          {data.tags.map(t => (
            <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
          ))}
        </div>
        <h1 className="text-[20px] font-bold tracking-tight">{data.title}</h1>
        {data.summary && <p className="text-[13px] text-ink-3 mt-1.5 leading-relaxed">{data.summary}</p>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("px-[18px] py-2.5 text-[13px] font-medium transition-all duration-100 border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap",
              tab === t.key ? "text-ink-1 border-ink-1" : "text-ink-3 border-transparent hover:text-ink-1"
            )}>
            {t.label}
            {t.pro && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-[3px] text-[9px] font-semibold bg-ink-1 text-white leading-none">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column: content + hints */}
      <div className="grid grid-cols-[1fr_280px] gap-5 items-start">
        {/* Content */}
        <div>
          {locked ? (
            <div className="pro-gate">
              <div className="pro-gate-inner">
                <div className="bg-white border border-line rounded shadow-card px-6 py-5">
                  {body ? <MarkdownRenderer text={body} /> : <EmptySection />}
                </div>
              </div>
              <div className="pro-gate-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div className="text-[13px] font-semibold text-ink-1">Pro content</div>
                <div className="text-[12px] text-ink-2 text-center max-w-[220px] leading-snug">Upgrade to read the Deep Dive and Trade-off analysis</div>
                <button onClick={() => navigate("/pricing")}
                  className="px-3 py-1.5 rounded-sm text-[12px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-line rounded shadow-card px-6 py-5">
              {body ? <MarkdownRenderer text={body} /> : <EmptySection />}
            </div>
          )}
        </div>

        {/* Hints sidebar */}
        <div className="bg-white border border-line rounded shadow-card px-5 py-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-label text-ink-3 mb-2.5">Interview tips</div>
          {data.hints
            ? <div className="text-[12.5px] text-ink-2 leading-relaxed"><MarkdownRenderer text={data.hints} /></div>
            : <p className="text-[12.5px] text-ink-3">No tips for this case yet.</p>}
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px] font-medium
                 text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      Back to System Design
    </button>
  );
}

function EmptySection() {
  return <p className="text-[13px] text-ink-3">This section isn't available for this case.</p>;
}
