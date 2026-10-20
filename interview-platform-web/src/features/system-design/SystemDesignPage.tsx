import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { systemDesignApi } from "../../api/systemDesign.api";

export function SystemDesignPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["system-design-cases"],
    queryFn: () => systemDesignApi.getAll().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight">
          System design
        </h1>
        <p className="text-[13px] text-ink-3 mt-2">
          Study the approach, then work through an example.
        </p>
      </header>
      <Link to="/system-design/guide" className="study-banner">
        <div>
          <small>Start here</small>
          <h2>How to approach a system design interview</h2>
          <p>A seven-step guide, from requirements to trade-offs.</p>
        </div>
        <span>Read the guide</span>
      </Link>
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Worked examples</h2>
        {data && (
          <span className="text-[12px] text-ink-3">{data.length} cases</span>
        )}
      </div>
      {isLoading && (
        <div
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          aria-label="Loading cases"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded h-56 animate-pulse"
            />
          ))}
        </div>
      )}
      {isError && (
        <div className="bg-surface border border-line rounded p-6 text-sm">
          <p>Could not load cases.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}
      {data?.length === 0 && (
        <p className="text-sm text-ink-3 py-8">No cases yet.</p>
      )}
      {data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((c) => (
            <Link
              key={c.id}
              to={`/system-design/${c.id}`}
              className="study-case"
            >
              <span className="study-level" data-level={c.difficulty}>
                {c.difficulty}
              </span>
              <h3>{c.title}</h3>
              <p>{c.summary}</p>
              <div className="study-tags">
                {c.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <footer>
                <span>Study guide</span>
                <span className="study-read">Read case</span>
              </footer>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
