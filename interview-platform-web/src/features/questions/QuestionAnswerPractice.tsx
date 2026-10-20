import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { questionsApi, type AnswerFeedback } from "../../api/questions.api";
import { useAuthStore } from "../../stores/authStore";

export function QuestionAnswerPractice({ questionId }: { questionId: string }) {
  const token = useAuthStore(s => s.accessToken);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [reviewedAnswer, setReviewedAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const status = useQuery({ queryKey: ["answer-feedback-status"], queryFn: questionsApi.feedbackStatus, retry: false, staleTime: 60000 });
  const available = status.data?.data.data.available;
  const count = answer.trim().length;
  const needsLogin = !token || expired;

  async function submit() {
    if (busy || needsLogin || !available || count < 30 || count > 4000) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setError("");
    const submitted = answer.trim();
    try {
      const response = await questionsApi.reviewAnswer(questionId, submitted, controller.signal);
      setFeedback(response.data.data); setReviewedAnswer(submitted);
    } catch (e) {
      if (axios.isCancel(e)) return;
      const code = axios.isAxiosError(e) ? e.response?.status : undefined;
      if (code === 401 || code === 403) setExpired(true);
      setError(code === 429 ? "Feedback limit reached. Wait a minute and try again. Daily limits reset at 00:00 UTC."
        : code === 401 || code === 403 ? "Please sign in with a verified account. Your answer is still here."
        : "Feedback is unavailable right now. Your answer is still here; try again later or read the reference answer.");
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }

  return <section className="bg-white border border-line rounded shadow-card p-5 sm:p-7" aria-labelledby="practice-heading">
    <h2 id="practice-heading" className="text-[17px] mb-1">Your answer</h2>
    <p id="practice-help" className="text-ink-2 mb-4">Practise in English before reading the reference answer.</p>
    <label htmlFor="practice-answer" className="sr-only">Your interview answer in English</label>
    <textarea id="practice-answer" value={answer} onChange={e => setAnswer(e.target.value)}
      disabled={busy} maxLength={4000} rows={7} aria-describedby="practice-help practice-count"
      placeholder="Explain it as you would in an interview…"
      className="w-full resize-y rounded border border-line-strong bg-canvas p-4 text-ink-1 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#52634f] disabled:opacity-70" />
    <p id="practice-count" className="text-right text-xs text-ink-2 mt-1">{answer.length.toLocaleString()} / 4,000 · 30 characters minimum</p>
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <button type="button" onClick={submit} disabled={busy || needsLogin || !available || count < 30 || count > 4000}
        className="rounded bg-[#234638] text-white px-4 py-2.5 font-medium hover:bg-[#315544] disabled:opacity-40 disabled:cursor-not-allowed">
        {busy ? "Reviewing your answer…" : "Get AI feedback"}
      </button>
      {needsLogin && <Link to="/login" className="underline underline-offset-4 text-ink-1">Sign in to get feedback</Link>}
    </div>
    <p className="text-xs text-ink-2 mt-3">Submitting sends your answer and this question to Google Gemini. Free-tier data may be used to improve Google products. Avoid personal or confidential information. AI feedback can be wrong.</p>
    <p className="text-xs text-ink-2 mt-2">{status.isPending ? "Checking feedback availability…" : available
      ? `Up to ${status.data?.data.data.dailyLimit} attempts per day. Failed requests also count. Resets at 00:00 UTC.`
      : "AI feedback is currently off. You can still write your answer and read the reference below."}</p>
    {busy && <p role="status" className="mt-3 text-ink-2">This may take up to 30 seconds.</p>}
    {error && <p role="alert" className="mt-4 rounded border border-[#d7c7ad] bg-[#faf5e9] p-3">{error}</p>}
    {feedback && <div className="mt-6 border-t border-line pt-5 space-y-5" aria-label="AI feedback">
      <div><h3 className="text-base mb-2">Your feedback</h3><p>{feedback.summary}</p></div>
      {answer.trim() !== reviewedAnswer && <p className="text-ink-2">This feedback is for your earlier answer. Submit again to review your changes.</p>}
      {feedback.strengths.length > 0 && <div><h3 className="mb-2">What worked</h3><ul className="list-disc pl-5 space-y-1">{feedback.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
      <div><h3 className="mb-2">What to improve</h3><ul className="list-disc pl-5 space-y-1">{feedback.improvements.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
      <div><h3 className="mb-2">English clarity</h3><p>{feedback.englishFeedback}</p></div>
      <div className="bg-[#f0f2e8] rounded p-4"><h3 className="mb-2">Sample answer</h3><p className="whitespace-pre-wrap leading-relaxed">{feedback.sampleAnswer}</p></div>
      <div><h3 className="mb-2">Follow-up question</h3><p>{feedback.followUpQuestion}</p></div>
    </div>}
  </section>;
}
