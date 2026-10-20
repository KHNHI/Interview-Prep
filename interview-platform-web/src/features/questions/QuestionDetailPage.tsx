import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "../../api/questions.api";
import { MarkdownRenderer } from "../../components/ui/MarkdownRenderer";
import { cn } from "../../utils/cn";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#edf0e3] text-[#52634f]",
  Medium: "bg-[#e4e9d8] text-[#3c5433]",
  Hard:   "bg-[#d9e2cb] text-[#354c2e]",
};

const RELATED_PLACEHOLDER = [
  "What is TLS/SSL and how does the handshake work?",
  "Explain HTTP/1.1 vs HTTP/2 vs HTTP/3",
  "What is a socket?",
];

export function QuestionDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["question", id],
    queryFn:  () => questionsApi.getById(id!),
    enabled:  !!id,
    staleTime: 1000 * 60 * 10,
  });

  const q = data?.data.data;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[820px] flex flex-col gap-5">
        <div className="h-4 w-24 bg-[#eef0e5] rounded animate-pulse" />
        <div className="bg-white border border-line rounded shadow-card px-6 py-5 space-y-3">
          <div className="h-4 w-32 bg-[#eef0e5] rounded animate-pulse" />
          <div className="h-7 w-3/4 bg-[#eef0e5] rounded animate-pulse" />
        </div>
        <div className="bg-white border border-line rounded shadow-card px-7 py-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3.5 bg-[#eef0e5] rounded animate-pulse"
                 style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !q) {
    return (
      <div className="max-w-[820px] flex flex-col gap-5">
        <button onClick={() => navigate("/questions")}
          className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px]
                     font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">

          Back to Q&A Bank
        </button>
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 text-center text-[13px] text-ink-3">
          Question not found. It may have been removed.
        </div>
      </div>
    );
  }

  // ── Content ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[820px] flex flex-col gap-5">
      {/* Back */}
      <button onClick={() => navigate("/questions")}
        className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px]
                   font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">

        Back to Q&A Bank
      </button>

      {/* Header card */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2.5">
              {q.tags.map(t => (
                <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px]
                                         text-[11px] font-medium bg-[#eef0e5] text-[#52634f]">
                  {t}
                </span>
              ))}
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
                DIFFICULTY_STYLE[q.difficulty] ?? "bg-[#edf0e3] text-[#52634f]")}>
                {q.difficulty}
              </span>
            </div>
            <h1 className="text-[19px] font-bold tracking-tight leading-snug">{q.title}</h1>
          </div>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={cn("flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[12px]",
              "font-medium border transition-colors",
              bookmarked
                ? "bg-ink-1 text-white border-ink-1"
                : "bg-canvas text-ink-1 border-line-strong hover:bg-[#e5eadb]"
            )}>

            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Answer */}
      <div className="bg-white border border-line rounded shadow-card px-7 py-6">
        <div className="text-[13.5px] leading-[1.75] text-ink-1">
          <MarkdownRenderer text={q.content} />
        </div>
      </div>

      {/* Related questions */}
      <div className="bg-white border border-line rounded shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line">
          <span className="text-[13px] font-semibold text-ink-1">Related Questions</span>
        </div>
        {RELATED_PLACEHOLDER.map(t => (
          <div key={t}
            className="flex items-center px-5 py-3.5 border-b border-line last:border-b-0
                       cursor-pointer hover:bg-surface-alt transition-colors">
            <span className="flex-1 text-[13px] text-ink-1">{t}</span>

          </div>
        ))}
      </div>
    </div>
  );
}
