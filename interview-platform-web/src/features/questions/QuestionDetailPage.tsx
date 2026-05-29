import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

const QUESTION = {
  id: 1,
  title: "Explain the differences between TCP and UDP.",
  category: "Networking",
  tags: ["Networking", "Protocols"],
  difficulty: "Medium",
  content: `TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are both core transport-layer protocols, but they serve different use cases.

**TCP** is a connection-oriented protocol. Before any data is transferred, a 3-way handshake must complete (SYN → SYN-ACK → ACK). It guarantees:
- Reliable delivery (retransmission of lost packets)
- Ordered delivery (sequence numbers)
- Flow control (sliding window)
- Congestion control (slow start, AIMD)

**UDP** is connectionless and stateless. It simply fires packets without acknowledgment. This makes it faster and lighter, but there are no delivery guarantees.

\`\`\`
TCP Header (20 bytes minimum):
┌─────────────────────────────────────────────┐
│ Source Port (16) │ Destination Port (16)     │
│ Sequence Number (32)                         │
│ Acknowledgment Number (32)                   │
│ Flags: SYN ACK FIN RST PSH URG              │
└─────────────────────────────────────────────┘

UDP Header (8 bytes fixed):
┌─────────────────────────────────────────────┐
│ Source Port (16) │ Destination Port (16)     │
│ Length (16)      │ Checksum (16)             │
└─────────────────────────────────────────────┘
\`\`\`

**When to use TCP:** HTTP/HTTPS, SSH, FTP, email — any case where correctness matters.

**When to use UDP:** DNS, video/audio streaming, online gaming, VoIP — where speed outweighs reliability.

**Key interview insight:** You can build reliable delivery on top of UDP (QUIC does this). TCP's guarantees come at the cost of head-of-line blocking.`,
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-[#EFEFEF] text-[#3A3A3A]",
  Medium: "bg-[#E5E5E5] text-[#252525]",
  Hard:   "bg-[#DCDCDC] text-[#1A1A1A]",
};

const RELATED = [
  "What is TLS/SSL and how does the handshake work?",
  "Explain HTTP/1.1 vs HTTP/2 vs HTTP/3",
  "What is a socket?",
];

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const q = QUESTION;

  return (
    <div className="max-w-[820px] flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={() => navigate("/questions")}
        className="self-start flex items-center gap-1.5 px-2 py-1 rounded-sm text-[13px] font-medium text-ink-2 hover:bg-canvas hover:text-ink-1 transition-colors -ml-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Q&A Bank
      </button>

      {/* Question header */}
      <div className="bg-white border border-line rounded shadow-card px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2.5">
              {q.tags.map(t => (
                <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">{t}</span>
              ))}
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-semibold", DIFFICULTY_STYLE[q.difficulty])}>
                {q.difficulty}
              </span>
            </div>
            <h1 className="text-[19px] font-bold tracking-tight leading-snug">{q.title}</h1>
          </div>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={cn("flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[12px] font-medium border transition-colors",
              bookmarked
                ? "bg-ink-1 text-white border-ink-1"
                : "bg-canvas text-ink-1 border-line-strong hover:bg-[#EAEAEA]"
            )}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-line rounded shadow-card px-7 py-6">
        <div className="text-[13.5px] leading-[1.75] text-ink-1">
          <ContentRenderer text={q.content} />
        </div>
      </div>

      {/* Related */}
      <div className="bg-white border border-line rounded shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line">
          <span className="text-[13px] font-semibold text-ink-1">Related Questions</span>
        </div>
        {RELATED.map((t) => (
          <div key={t} className="flex items-center px-5 py-3.5 border-b border-line last:border-b-0 cursor-pointer hover:bg-surface-alt transition-colors">
            <span className="flex-1 text-[13px] text-ink-1">{t}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentRenderer({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          return (
            <pre key={i} className="bg-[#F4F4F4] border border-line rounded-md px-4 py-3.5 text-[12px] font-mono overflow-x-auto my-3.5 leading-relaxed text-ink-1">
              <code>{part.slice(3, -3).replace(/^\n/, "")}</code>
            </pre>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-ink-1 font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      })}
    </>
  );
}
