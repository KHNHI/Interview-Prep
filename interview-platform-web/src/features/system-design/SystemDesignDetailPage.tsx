import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { systemDesignApi } from "../../api/systemDesign.api";
import { MarkdownRenderer } from "../../components/ui/MarkdownRenderer";
import { cn } from "../../utils/cn";
import { ArchitectureWhiteboard } from "./ArchitectureWhiteboard";
import { getArchitectureBoard, withoutAsciiSketch } from "./architectureBoards";
import { InterviewLesson } from "./InterviewLesson";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-[#edf0e3] text-[#52634f]",
  Medium: "bg-[#e4e9d8] text-[#3c5433]",
  Hard: "bg-[#d9e2cb] text-[#354c2e]",
};

type TabKey =
  "overview" | "requirements" | "highLevelDesign" | "deepDive" | "tradeoffs";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "requirements", label: "Requirements" },
  { key: "highLevelDesign", label: "High-Level Design" },
  { key: "deepDive", label: "Deep Dive" },
  { key: "tradeoffs", label: "Trade-offs" },
];

export function SystemDesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("overview");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-design-case", id],
    queryFn: () => systemDesignApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-[860px] flex flex-col gap-5">
        <div className="h-4 w-40 bg-[#eef0e5] rounded animate-pulse" />
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

  if (data.title.trim().toLowerCase() === "design a url shortener") {
    return <div className="flex flex-col gap-5"><BackButton onClick={() => navigate("/system-design")} /><InterviewLesson key={data.id} title={data.title} /></div>;
  }

  const contentFor: Record<TabKey, string | undefined> = {
    overview: data.overview,
    requirements: data.requirements,
    highLevelDesign: data.highLevelDesign,
    deepDive: data.deepDive,
    tradeoffs: data.tradeoffs,
  };

  const body = contentFor[tab];
  const board = tab === "highLevelDesign" ? getArchitectureBoard(data.title) : undefined;

  return (
    <div className={`${board ? "max-w-[1080px]" : "max-w-[860px]"} flex flex-col gap-5`}>
      <BackButton onClick={() => navigate("/system-design")} />

      {/* Header */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold",
              DIFFICULTY_STYLE[data.difficulty] ??
                "bg-[#edf0e3] text-[#52634f]",
            )}
          >
            {data.difficulty}
          </span>
          {data.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#eef0e5] text-[#52634f]"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="text-[20px] font-bold tracking-tight">{data.title}</h1>
        {data.summary && (
          <p className="text-[13px] text-ink-3 mt-1.5 leading-relaxed">
            {data.summary}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-[18px] py-2.5 text-[13px] font-medium transition-all duration-100 border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap",
              tab === t.key
                ? "text-ink-1 border-ink-1"
                : "text-ink-3 border-transparent hover:text-ink-1",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Two-column: content + hints */}
      {board && <ArchitectureWhiteboard key={data.id} board={board} />}
      <div className={`grid grid-cols-1 ${board ? "xl:grid-cols-[minmax(0,1fr)_260px]" : "lg:grid-cols-[minmax(0,1fr)_260px]"} gap-5 items-start`}>
        {/* Content */}
        <div>
          <div className="bg-white border border-line rounded shadow-card px-6 py-5">
            {body ? <MarkdownRenderer text={board ? withoutAsciiSketch(body) : body} /> : <EmptySection />}
          </div>
        </div>

        {/* Hints sidebar */}
        <div className="bg-white border border-line rounded shadow-card px-5 py-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-label text-ink-3 mb-2.5">
            Interview tips
          </div>
          {data.hints ? (
            <div className="text-[12.5px] text-ink-2 leading-relaxed">
              <MarkdownRenderer text={data.hints} />
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-3">
              No tips for this case yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px] font-medium
                 text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1"
    >
      Back to System Design
    </button>
  );
}

function EmptySection() {
  return (
    <p className="text-[13px] text-ink-3">
      This section isn't available for this case.
    </p>
  );
}
