import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const CASES = [
  { id: 1, title: "Design a URL Shortener",        difficulty: "Easy",   tags: ["Hashing", "DB Design"],     isPro: false, desc: "Build a scalable service like bit.ly" },
  { id: 2, title: "Design a Rate Limiter",          difficulty: "Medium", tags: ["API", "Redis"],             isPro: false, desc: "Token bucket, sliding window algorithms" },
  { id: 3, title: "Design Twitter / News Feed",     difficulty: "Hard",   tags: ["Fan-out", "Cache"],         isPro: false, desc: "Real-time feed generation at scale" },
  { id: 4, title: "Design Distributed Cache",       difficulty: "Medium", tags: ["Memcached", "Consistency"], isPro: true,  desc: "Consistent hashing, eviction policies" },
  { id: 5, title: "Design a Notification System",   difficulty: "Medium", tags: ["Kafka", "Push/Pull"],       isPro: true,  desc: "Multi-channel delivery at 100M+ users" },
  { id: 6, title: "Design Google Drive / Dropbox",  difficulty: "Hard",   tags: ["Storage", "Sync"],          isPro: true,  desc: "File storage, chunking, delta sync" },
  { id: 7, title: "Design a Search Autocomplete",   difficulty: "Medium", tags: ["Trie", "Ranking"],          isPro: true,  desc: "Low-latency prefix suggestions" },
  { id: 8, title: "Design YouTube / Netflix",       difficulty: "Hard",   tags: ["CDN", "Encoding", "HLS"],   isPro: true,  desc: "Video upload, transcoding, streaming" },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

export function SystemDesignPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">System Design</h1>
        <p className="text-[13px] text-ink-3 mt-1">Guided mock interview sessions with structured problem-solving.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {CASES.map(c => (
          <div key={c.id}
            onClick={() => navigate(`/system-design/${c.id}`)}
            className="bg-white border border-line rounded shadow-card p-5 cursor-pointer hover:shadow-card-md transition-shadow">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold", DIFFICULTY_STYLE[c.difficulty])}>
                {c.difficulty}
              </span>
              {c.isPro && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold bg-ink-1 text-white">Pro</span>
              )}
            </div>
            <div className="font-semibold text-[14.5px] text-ink-1 mb-1.5 tracking-tight">{c.title}</div>
            <div className="text-[12.5px] text-ink-3 mb-3.5">{c.desc}</div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {c.tags.map(t => (
                <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-3">45 min session</span>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/system-design/${c.id}`); }}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[12px] font-medium transition-colors",
                  c.isPro
                    ? "bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA]"
                    : "bg-ink-1 text-white hover:bg-[#2A2A2A]"
                )}>
                {c.isPro
                  ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Pro</>
                  : "Start →"
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
