import { useQuery } from "@tanstack/react-query";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { progressApi } from "../../api/progress.api";

const CATEGORY_LABEL: Record<string, string> = {
  DB: "DBMS",
};

export function ProgressPage() {
  const { data: radarItems = [], isLoading } = useQuery({
    queryKey: ["radar"],
    queryFn:  () => progressApi.getRadar().then(r => r.data.data),
  });

  const covered = radarItems.filter(r => r.score > 0);
  const avgScore = covered.length > 0
    ? covered.reduce((s, r) => s + r.score, 0) / covered.length
    : 0;
  const sorted = [...covered].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const weak = sorted[sorted.length - 1];

  const radarData = radarItems.map(r => ({
    subject: CATEGORY_LABEL[r.category] ?? r.category,
    current: Math.round(r.score * 100),
    target:  90,
  }));

  const focusAreas = weak
    ? [...sorted.slice(-2).map(r => `${CATEGORY_LABEL[r.category] ?? r.category} (${Math.round(r.score * 100)}%)`),
       "System Design"].slice(0, 3)
    : ["DSA", "System Design", "Networking"];

  const stats = [
    {
      label:     "Avg Score",
      value:     `${Math.round(avgScore * 100)}%`,
      delta:     "Across all topics",
      icon:      "</>",
    },
    {
      label:     "Best Category",
      value:     best ? (CATEGORY_LABEL[best.category] ?? best.category) : "—",
      delta:     best ? `${Math.round(best.score * 100)}% accuracy` : "No data yet",
      icon:      "◷",
    },
    {
      label:     "Topics Covered",
      value:     `${covered.length}/5`,
      delta:     "With quiz history",
      icon:      "◎",
    },
    {
      label:     "Needs Work",
      value:     weak ? (CATEGORY_LABEL[weak.category] ?? weak.category) : "—",
      delta:     weak ? `${Math.round(weak.score * 100)}% accuracy` : "Take more quizzes",
      icon:      "◈",
      highlight: true,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-ink-3 mt-1">Track your skill growth and interview readiness.</p>
        </div>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[12px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-line rounded shadow-card px-5 py-[18px] animate-pulse">
                <div className="h-3 w-24 bg-line rounded mb-4" />
                <div className="h-8 w-16 bg-line rounded mb-2" />
                <div className="h-2.5 w-28 bg-line rounded" />
              </div>
            ))
          : stats.map(s => (
              <div key={s.label} className={`bg-white border rounded shadow-card px-5 py-[18px] ${s.highlight ? "border-ink-1" : "border-line"}`}>
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-label text-ink-3">
                  <span className="text-[13px] opacity-50">{s.icon}</span>
                  {s.label}
                </div>
                <div className={`font-bold tracking-tight text-ink-1 mt-2 leading-none ${s.highlight ? "text-[32px]" : "text-[30px]"}`}>
                  {s.value}
                </div>
                <div className="text-[11.5px] text-ink-3 mt-1.5">{s.delta}</div>
              </div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Radar chart */}
        <div className="bg-white border border-line rounded shadow-card">
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-1">Skill Proficiency</span>
            <div className="flex gap-4 text-[11.5px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-1 inline-block" />Current Level
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-[#999] inline-block" />Target Level
              </span>
            </div>
          </div>
          <div className="py-2">
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center text-[13px] text-ink-3">Loading…</div>
            ) : radarData.every(r => r.current === 0) ? (
              <div className="h-[280px] flex flex-col items-center justify-center gap-2 text-center px-6">
                <p className="text-[13px] text-ink-2 font-medium">No quiz data yet</p>
                <p className="text-[12px] text-ink-3">Complete some quizzes to see your skill breakdown.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#E6E6E6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#525252", fontFamily: "Onest, sans-serif" }} />
                  <Radar name="Target"  dataKey="target"  stroke="#CCCCCC" fill="#F0F0F0" fillOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 3" />
                  <Radar name="Current" dataKey="current" stroke="#0F0F0F" fill="#0F0F0F" fillOpacity={0.12} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E6E6E6", borderRadius: 6, fontSize: 12, fontFamily: "Onest, sans-serif" }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-3.5">
          {/* Recommended Focus */}
          <div className="bg-white border border-line rounded shadow-card flex-1">
            <div className="px-4 py-3.5 border-b border-line">
              <span className="text-[13px] font-semibold text-ink-1">Recommended Focus</span>
            </div>
            {focusAreas.map((f, i) => (
              <div key={f} className={`flex items-center px-4 py-2.5 gap-3 cursor-pointer hover:bg-surface-alt transition-colors ${i < focusAreas.length - 1 ? "border-b border-line" : ""}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-ink-3 flex-shrink-0" />
                <span className="flex-1 text-[13px] font-medium text-ink-1">{f}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-line rounded shadow-card flex-1">
            <div className="px-4 py-3.5 border-b border-line">
              <span className="text-[13px] font-semibold text-ink-1">Recent Activity</span>
            </div>
            {covered.length === 0 ? (
              <div className="px-4 py-5 text-center text-[12px] text-ink-3">
                Complete a quiz to see your activity.
              </div>
            ) : (
              sorted.slice(0, 4).map((r, i) => (
                <div key={r.category} className={`flex gap-2.5 px-4 py-2.5 ${i < Math.min(sorted.length, 4) - 1 ? "border-b border-line" : ""}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DCDCDC] flex-shrink-0 mt-1.5" />
                  <div>
                    <div className="text-[12.5px] font-medium text-ink-1">
                      {CATEGORY_LABEL[r.category] ?? r.category}
                    </div>
                    <div className="text-[11.5px] text-ink-3 mt-0.5">
                      {Math.round(r.score * 100)}% accuracy
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
