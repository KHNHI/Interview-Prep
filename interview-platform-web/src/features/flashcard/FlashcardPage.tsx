import { useState } from "react";
import { cn } from "../../utils/cn";

const CARDS = [
  { id: 1, category: "OS",          front: "What is the difference between a process and a thread?",    back: "A process is an independent program with its own memory space. A thread is a unit of execution within a process, sharing the same memory space with other threads.\n\n• Processes are isolated; threads share heap memory\n• Context switching is cheaper for threads\n• A crash in one thread can affect the whole process" },
  { id: 2, category: "Distributed", front: "What does BASE stand for in distributed systems?",           back: "BASE = Basically Available, Soft-state, Eventually consistent\n\n• Basically Available — system guarantees availability per CAP\n• Soft-state — state may change over time even without input\n• Eventually consistent — will become consistent without new writes" },
  { id: 3, category: "DSA",         front: "Explain Big O notation O(n log n)",                          back: "Describes algorithms that divide a problem (log n) and process each element at each level (n).\n\nCommon examples:\n• Merge Sort — splits array in half, then merges\n• Heap Sort — builds heap O(n), extracts n times O(log n)\n• Most efficient comparison-based sorting algorithms" },
  { id: 4, category: "OS",          front: "What is a deadlock and how do you prevent it?",               back: "A deadlock occurs when threads are blocked forever, each waiting for a resource held by another.\n\nCoffman conditions (all 4 must hold):\n1. Mutual exclusion\n2. Hold and wait\n3. No preemption\n4. Circular wait\n\nPrevention: Break any one — e.g., impose lock ordering." },
];

export function FlashcardPage() {
  const [index,   setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known,   setKnown]   = useState<number[]>([]);
  const card  = CARDS[index];
  const total = CARDS.length;

  const handleNext = () => { setFlipped(false); setTimeout(() => setIndex(i => (i + 1) % total), 50); };
  const handlePrev = () => { setFlipped(false); setTimeout(() => setIndex(i => (i - 1 + total) % total), 50); };
  const isKnown = known.includes(card.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Flashcards</h1>
          <p className="text-[13px] text-ink-3 mt-1">Spaced repetition — {total} cards in this deck</p>
        </div>
        <span className="text-[12.5px] text-ink-3">{known.length} / {total} known</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-line rounded-full overflow-hidden">
        <div className="h-full bg-ink-1 rounded-full transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#F0F0F0] text-[#555]">
          {card.category}
        </span>
        <span className="text-[12.5px] text-ink-3">Card {index + 1} of {total}</span>
      </div>

      {/* Flashcard */}
      <div className="fc-wrap cursor-pointer" onClick={() => setFlipped(f => !f)}>
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Click anywhere to reveal answer
            </div>
          </div>
          {/* Back */}
          <div className="fc-face fc-back">
            <div className="absolute top-4 left-5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-3">Answer</div>
            <p className="text-[13.5px] leading-[1.75] text-ink-2 max-w-[520px] text-left whitespace-pre-line">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrev}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </button>
        <div className="flex gap-2.5">
          <button onClick={() => setFlipped(f => !f)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/></svg>
            {flipped ? "Show Question" : "Flip Card"}
          </button>
          <button
            onClick={() => setKnown(k => isKnown ? k.filter(x => x !== card.id) : [...k, card.id])}
            className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium transition-colors",
              isKnown
                ? "bg-ink-1 text-white hover:bg-[#2A2A2A]"
                : "bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA]"
            )}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            {isKnown ? "Marked Known" : "Mark as Known"}
          </button>
        </div>
        <button onClick={handleNext}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[13px] font-medium bg-canvas text-ink-1 border border-line-strong hover:bg-[#EAEAEA] transition-colors">
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Deck stats */}
      <div className="bg-white border border-line rounded shadow-card px-5 py-4">
        <div className="flex gap-6">
          {[
            { label: "Total cards", value: total },
            { label: "Known",       value: known.length },
            { label: "Remaining",   value: total - known.length },
            { label: "Due today",   value: 8 },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[10px] font-semibold uppercase tracking-label text-ink-3">{s.label}</div>
              <div className="text-[22px] font-bold tracking-tight text-ink-1 mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
