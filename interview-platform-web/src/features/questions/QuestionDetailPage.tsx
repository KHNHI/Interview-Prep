import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "../../api/questions.api";
import { cn } from "../../utils/cn";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
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
        <div className="h-4 w-24 bg-[#F0F0F0] rounded animate-pulse" />
        <div className="bg-white border border-line rounded shadow-card px-6 py-5 space-y-3">
          <div className="h-4 w-32 bg-[#F0F0F0] rounded animate-pulse" />
          <div className="h-7 w-3/4 bg-[#F0F0F0] rounded animate-pulse" />
        </div>
        <div className="bg-white border border-line rounded shadow-card px-7 py-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3.5 bg-[#F0F0F0] rounded animate-pulse"
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Q&A Bank
      </button>

      {/* Header card */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2.5">
              {q.tags.map(t => (
                <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px]
                                         text-[11px] font-medium bg-[#F0F0F0] text-[#555]">
                  {t}
                </span>
              ))}
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
                DIFFICULTY_STYLE[q.difficulty] ?? "bg-[#EFEFEF] text-[#3A3A3A]")}>
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
                : "bg-canvas text-ink-1 border-line-strong hover:bg-[#EAEAEA]"
            )}>
            <svg width="13" height="13" viewBox="0 0 24 24"
                 fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" className="text-ink-3">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Markdown renderer ──────────────────────────────────────────────────────
// Handles: ## headers, **bold**, ```code blocks```, - bullet lists, tables
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang  = line.slice(3).trim();
      const block: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        block.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-[#F4F4F4] border border-line rounded-md px-4 py-3.5
                                text-[12px] font-mono overflow-x-auto my-3.5 leading-relaxed text-ink-1">
          <code>{block.join("\n")}</code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[15px] font-semibold text-ink-1 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[14px] font-semibold text-ink-1 mt-4 mb-1.5">
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    // Table row
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[\s\-:]+\|/)) { // skip separator row
          rows.push(lines[i].split("|").filter((_, idx) => idx > 0 && idx < lines[i].split("|").length - 1).map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        elements.push(
          <div key={i} className="overflow-x-auto my-3.5">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="text-left px-3 py-2 font-semibold text-ink-1 bg-[#F9F9F9]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-line last:border-b-0 hover:bg-[#FAFAFA]">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-ink-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-[13.5px] text-ink-2 my-0.5">
          <span className="text-ink-3 flex-shrink-0 mt-0.5">•</span>
          <span><InlineMarkdown text={line.slice(2)} /></span>
        </div>
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-[13.5px] text-ink-2 leading-[1.75]">
        <InlineMarkdown text={line} />
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-ink-1">{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="font-mono text-[12px] bg-[#F0F0F0] px-1 py-0.5 rounded text-ink-1">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
