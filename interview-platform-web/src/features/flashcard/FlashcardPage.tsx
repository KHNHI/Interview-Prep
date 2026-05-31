import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { flashcardsApi, type FlashcardDto } from "../../api/flashcards.api";

const RATINGS = [
  { label: "Again", value: 0 as const, hint: "< 1 day"  },
  { label: "Hard",  value: 3 as const, hint: "~1 day"   },
  { label: "Good",  value: 4 as const, hint: "~6 days"  },
  { label: "Easy",  value: 5 as const, hint: "~10 days" },
] as const;

export function FlashcardPage() {
  const [cards,      setCards]      = useState<FlashcardDto[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [flipped,    setFlipped]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalDue,   setTotalDue]   = useState(0);
  const [doneCount,  setDoneCount]  = useState(0);

  useEffect(() => {
    flashcardsApi.getCards()
      .then(r => {
        setCards(r.data.data);
        setTotalDue(r.data.data.length);
      })
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const card = cards[0];

  async function rate(rating: 0 | 3 | 4 | 5) {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      await flashcardsApi.reviewCard(card.id, rating);
      setFlipped(false);
      setTimeout(() => {
        setCards(prev => prev.slice(1));
        setDoneCount(c => c + 1);
        setSubmitting(false);
      }, 150);
    } catch {
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Flashcards</h1>
          <p className="text-[13px] text-ink-3 mt-1">Loading your review queue…</p>
        </div>
        <div className="bg-white border border-line rounded shadow-card h-[340px] animate-pulse" />
      </div>
    );
  }

  // ── No cards at all ────────────────────────────────────────────────────────
  if (totalDue === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Flashcards</h1>
          <p className="text-[13px] text-ink-3 mt-1">Spaced repetition review</p>
        </div>
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] font-semibold text-ink-1">No cards due right now</p>
          <p className="text-[13px] text-ink-3 max-w-[320px] leading-relaxed">
            Complete some quizzes to add questions to your flashcard deck.
            Cards you've already reviewed will reappear when they're due again.
          </p>
          <Link to="/quiz"
            className="mt-1 px-5 py-2 rounded-sm text-[13.5px] font-semibold bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
            Take a quiz →
          </Link>
        </div>
      </div>
    );
  }

  // ── All done ───────────────────────────────────────────────────────────────
  if (doneCount > 0 && cards.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Flashcards</h1>
          <p className="text-[13px] text-ink-3 mt-1">Spaced repetition review</p>
        </div>
        <div className="bg-white border border-line rounded shadow-card px-6 py-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] font-semibold text-ink-1">All caught up!</p>
          <p className="text-[13px] text-ink-3 max-w-[320px] leading-relaxed">
            You reviewed all {doneCount} cards due today. Come back tomorrow for the next batch.
          </p>
          <Link to="/dashboard"
            className="mt-1 px-5 py-2 rounded-sm text-[13.5px] font-semibold bg-ink-1 text-white hover:bg-[#2A2A2A] transition-colors">
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white border border-line rounded shadow-card px-5 py-4">
          <div className="flex gap-6">
            <StatBox label="Reviewed today" value={String(doneCount)} />
            <StatBox label="Next session"   value="Tomorrow" />
          </div>
        </div>
      </div>
    );
  }

  // ── Reviewing ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Flashcards</h1>
          <p className="text-[13px] text-ink-3 mt-1">
            Spaced repetition — {cards.length} card{cards.length !== 1 ? "s" : ""} remaining
          </p>
        </div>
        <span className="text-[12.5px] text-ink-3">{doneCount} / {totalDue} reviewed</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-line rounded-full overflow-hidden">
        <div className="h-full bg-ink-1 rounded-full transition-all duration-300"
          style={{ width: `${(doneCount / totalDue) * 100}%` }} />
      </div>

      {/* Card meta */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">
          {card.category}
        </span>
        <span className="text-[12.5px] text-ink-3">{card.difficulty}</span>
      </div>

      {/* Flip card */}
      <div className="fc-wrap cursor-pointer" onClick={() => !submitting && setFlipped(f => !f)}>
        <div className={cn("fc-inner", flipped && "flipped")}>
          {/* Front */}
          <div className="fc-face">
            <div className="absolute top-4 left-5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-3">
              Question — click to flip
            </div>
            <p className="text-[18px] font-semibold leading-snug text-ink-1 max-w-[500px] tracking-tight">
              {card.front}
            </p>
            <div className="flex items-center gap-1.5 text-ink-3 text-[12px] mt-5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Click anywhere to reveal answer
            </div>
          </div>
          {/* Back */}
          <div className="fc-face fc-back">
            <div className="absolute top-4 left-5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-3">
              Answer
            </div>
            <p className="text-[13.5px] leading-[1.75] text-ink-2 max-w-[520px] text-left whitespace-pre-line">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      {flipped ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11.5px] text-ink-3">How well did you recall it?</p>
          <div className="flex gap-2.5">
            {RATINGS.map(r => (
              <button
                key={r.label}
                onClick={() => rate(r.value)}
                disabled={submitting}
                className="flex flex-col items-center px-5 py-2.5 rounded border border-line-strong
                           bg-canvas text-ink-1 hover:border-ink-1 hover:bg-white
                           transition-all min-w-[82px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-[13px] font-semibold">{r.label}</span>
                <span className="text-[11px] text-ink-3 mt-0.5">{r.hint}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setFlipped(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-[13px] font-medium
                       bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
            </svg>
            Flip Card
          </button>
        </div>
      )}

      {/* Deck stats */}
      <div className="bg-white border border-line rounded shadow-card px-5 py-4">
        <div className="flex gap-6">
          <StatBox label="Due today"  value={String(totalDue)} />
          <StatBox label="Reviewed"   value={String(doneCount)} />
          <StatBox label="Remaining"  value={String(cards.length)} />
          <StatBox label="Interval"
            value={card.repetitions === 0 ? "New" : `${card.intervalDays}d`} />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-label text-ink-3">{label}</div>
      <div className="text-[22px] font-bold tracking-tight text-ink-1 mt-0.5">{value}</div>
    </div>
  );
}
