import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "../../api/questions.api";
import { cn } from "../../utils/cn";

const CATEGORIES  = ["All", "DSA", "Networking", "DB", "Cloud", "OS", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

export function QuestionsPage() {
  const [cat,    setCat]    = useState("All");
  const [diff,   setDiff]   = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["questions", cat, diff, page],
    queryFn: () =>
      questionsApi.getAll({
        category:   cat !== "All" ? cat : undefined,
        difficulty: diff.length === 1 ? diff[0] : undefined,
        page,
        pageSize:   20,
      }),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const questions = data?.data.data ?? [];
  const meta      = data?.data.meta;
  const totalPages = meta ? Math.ceil(meta.total / (meta.pageSize ?? 20)) : 1;

  // Client-side search filter (backend search endpoint can replace this later)
  const filtered = search.trim()
    ? questions.filter(q => q.title.toLowerCase().includes(search.toLowerCase()))
    : questions;

  const toggleDiff = (d: string) =>
    setDiff(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Q&A Bank</h1>
          <p className="text-[13px] text-ink-3 mt-1">
            Master technical concepts with our curated question database.
          </p>
        </div>
        <div className="relative flex items-center flex-shrink-0">
          <svg width="14" height="14" className="absolute left-2.5 text-ink-3 pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="pl-8 pr-3 py-1.5 border border-line rounded-sm bg-white text-[13px]
                       text-ink-1 placeholder-ink-3 focus:outline-none focus:border-line-strong w-60"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-medium text-ink-3 mr-1">Category:</span>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCat(c); setPage(1); }}
              className={cn("px-3 py-1 rounded-full text-[12.5px] font-medium border transition-all",
                cat === c
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-white text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
              )}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-ink-3 mr-1">Difficulty:</span>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => { toggleDiff(d); setPage(1); }}
              className={cn("px-3 py-1 rounded-full text-[12.5px] font-medium border transition-all",
                diff.includes(d)
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-white text-ink-2 border-line hover:border-line-strong hover:text-ink-1"
              )}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-line rounded shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <span className="text-[12px] text-ink-3">
            {isLoading ? "Loading..." : `${meta?.total ?? filtered.length} questions`}
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center px-5 py-4 border-b border-line last:border-b-0 gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#F0F0F0] rounded w-3/4 animate-pulse" />
                  <div className="h-2.5 bg-[#F0F0F0] rounded w-1/4 animate-pulse" />
                </div>
                <div className="h-5 w-14 bg-[#F0F0F0] rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="px-5 py-10 text-center text-[13px] text-ink-3">
            Failed to load questions. Make sure the API is running.
          </div>
        )}

        {/* Question rows */}
        {!isLoading && !isError && filtered.map(q => (
          <div key={q.id}
            onClick={() => navigate(`/questions/${q.id}`)}
            className="flex items-center px-5 py-3.5 border-b border-line last:border-b-0
                       gap-3 cursor-pointer hover:bg-surface-alt transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-medium text-[13.5px] text-ink-1">{q.title}</span>
                {q.isPro && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px]
                                   text-[11px] font-semibold bg-ink-1 text-white">Pro</span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {q.tags.map(t => (
                  <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px]
                                           text-[11px] font-medium bg-[#F0F0F0] text-[#555]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
                DIFFICULTY_STYLE[q.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
                {q.difficulty}
              </span>
              <button
                className="px-2.5 py-1 rounded-sm text-[12px] font-medium text-ink-2
                           hover:bg-canvas hover:text-ink-1 transition-colors"
                onClick={e => { e.stopPropagation(); navigate(`/questions/${q.id}`); }}>
                View
              </button>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-ink-3">
            No questions match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 rounded-sm text-[12px] font-medium bg-canvas text-ink-1
                       border border-line-strong hover:bg-[#EAEAEA] disabled:opacity-40 transition-colors">
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={cn("min-w-[32px] px-2.5 py-1 rounded-sm text-[12px] font-medium border transition-colors",
                p === page
                  ? "bg-ink-1 text-white border-ink-1"
                  : "bg-canvas text-ink-1 border-line-strong hover:bg-[#EAEAEA]"
              )}>
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 rounded-sm text-[12px] font-medium bg-canvas text-ink-1
                       border border-line-strong hover:bg-[#EAEAEA] disabled:opacity-40 transition-colors">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
