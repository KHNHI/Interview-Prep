import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { systemDesignApi } from "../../api/systemDesign.api";
import { cn } from "../../utils/cn";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

export function SystemDesignPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-design-cases"],
    queryFn:  () => systemDesignApi.getAll().then(r => r.data.data),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">System Design</h1>
        <p className="text-[13px] text-ink-3 mt-1">Learn the standard way to approach system design interviews, then study worked examples.</p>
      </div>

      {/* Framework banner */}
      <div
        onClick={() => navigate("/system-design/guide")}
        className="bg-sidebar rounded-lg px-6 py-5 text-white cursor-pointer hover:opacity-95 transition-opacity
                   flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-label text-white/40 mb-1">Start here</div>
            <div className="text-[15px] font-semibold tracking-tight">How to approach a system design interview</div>
            <div className="text-[12.5px] text-white/60 mt-0.5">The 7-step framework that works for any design question.</div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 flex-shrink-0">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-ink-1">Worked examples</h2>
        {data && <span className="text-[12px] text-ink-3">{data.length} cases</span>}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-line rounded shadow-card p-5 h-[180px] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 text-center text-[13px] text-ink-3">
          Couldn't load cases. Please try again.
        </div>
      )}

      {/* Empty */}
      {data && data.length === 0 && (
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 text-center text-[13px] text-ink-3">
          No cases yet. Check back soon.
        </div>
      )}

      {/* Cases */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {data.map(c => (
            <div key={c.id}
              onClick={() => navigate(`/system-design/${c.id}`)}
              className="bg-white border border-line rounded shadow-card p-5 cursor-pointer hover:shadow-card-md transition-shadow flex flex-col">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
                  DIFFICULTY_STYLE[c.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
                  {c.difficulty}
                </span>
                {c.isPro && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-ink-1 text-white">Pro</span>
                )}
              </div>
              <div className="font-semibold text-[14.5px] text-ink-1 mb-1.5 tracking-tight">{c.title}</div>
              <div className="text-[12.5px] text-ink-3 mb-3.5 flex-1">{c.summary}</div>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {c.tags.map(t => (
                  <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-3">Study guide</span>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/system-design/${c.id}`); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12px] font-medium bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
                  Read →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
