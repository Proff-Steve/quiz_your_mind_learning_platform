import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  Flag,
  ChevronRight,
  ChevronLeft,
  SendHorizonal,
  Clock,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

/* ── Status types ──────────────────────────────────────── */
type QStatus = "answered" | "unanswered" | "flagged-answered" | "flagged-unanswered";

interface ReviewQuestion {
  id: number;
  status: QStatus;
}

interface StoredReviewItem {
  id: number;
  answered: boolean;
  flagged: boolean;
}

interface PendingSubmit {
  examId: number;
  answers: { questionId: number; answerIndex: number }[];
  elapsedSeconds: number;
}

function getReviewQuestions(): ReviewQuestion[] {
  try {
    const raw = localStorage.getItem("qym_review_state");
    if (raw) {
      const items = JSON.parse(raw) as StoredReviewItem[];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item, index) => {
          let status: QStatus;
          if (item.flagged && item.answered) status = "flagged-answered";
          else if (item.flagged && !item.answered) status = "flagged-unanswered";
          else if (item.answered) status = "answered";
          else status = "unanswered";
          return { id: index + 1, status };
        });
      }
    }
  } catch {}
  return [];
}

function getPendingSubmit(): PendingSubmit | null {
  try {
    const raw = localStorage.getItem("qym_pending_submit");
    if (raw) return JSON.parse(raw) as PendingSubmit;
  } catch {}
  return null;
}

function getStoredRemaining(): number | null {
  try {
    const raw = localStorage.getItem("qym_timer_remaining");
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0) return n;
    }
  } catch {}
  return null;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ── Status config ──────────────────────────────────────── */
const STATUS_CONFIG: Record<
  QStatus,
  { label: string; icon: React.ReactNode; textClass: string }
> = {
  answered: {
    label: "Answered",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />,
    textClass: "text-foreground",
  },
  unanswered: {
    label: "Unanswered",
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />,
    textClass: "text-red-500",
  },
  "flagged-answered": {
    label: "Flagged (Answered)",
    icon: <Flag className="h-4 w-4 shrink-0 text-muted-foreground" />,
    textClass: "text-foreground",
  },
  "flagged-unanswered": {
    label: "Flagged (Unanswered)",
    icon: <Flag className="h-4 w-4 shrink-0 text-red-500" />,
    textClass: "text-red-500",
  },
};

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function ReviewPage() {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(() => getStoredRemaining() ?? 0);
  const submittingRef = useRef(submitting);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);

  const QUESTIONS = useMemo(() => getReviewQuestions(), []);

  const answered = QUESTIONS.filter(
    (q) => q.status === "answered" || q.status === "flagged-answered"
  ).length;
  const missing = QUESTIONS.filter(
    (q) => q.status === "unanswered" || q.status === "flagged-unanswered"
  ).length;

  /* ── Live countdown — mirrors ExamArea timer ─────────── */
  const handleFinalSubmitRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        localStorage.setItem("qym_timer_remaining", String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0 && !submittingRef.current) {
      handleFinalSubmitRef.current();
    }
  }, [remaining]);

  const handleFinalSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const pending = getPendingSubmit();
    const token = getToken();

    if (!pending) {
      navigate("/results");
      return;
    }

    const { examId, answers, elapsedSeconds } = pending;
    const totalAnswered = answers.length;
    const avgSeconds = totalAnswered > 0 ? Math.round(elapsedSeconds / totalAnswered) : 0;

    if (!token) {
      localStorage.setItem("qym_last_result", JSON.stringify({
        examId,
        score: "0.00",
        correct: 0,
        total: QUESTIONS.length,
        elapsedSeconds,
        avgSeconds,
      }));
      navigate("/results");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/exam-session/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId, answers }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Submission failed. Please try again.");
      }

      const data = await res.json() as { score: string; correct: number; total: number };

      localStorage.setItem("qym_last_result", JSON.stringify({
        examId,
        score: data.score,
        correct: data.correct,
        total: data.total,
        elapsedSeconds,
        avgSeconds,
      }));

      localStorage.removeItem("qym_pending_submit");
      navigate("/results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }, [submitting, QUESTIONS.length, navigate]);

  // Keep the ref up-to-date so the timer effect can call the latest version
  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  const timerWarning = remaining < 300;
  const timerDanger = remaining < 60;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Summary of Attempt
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Please review your answers before final submission.
            </p>
          </div>

          {/* Status badges + live timer */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {answered} Answered
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              {missing} Missing
            </span>
            {/* Live countdown */}
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tabular-nums border ${
                timerDanger
                  ? "border-red-400 bg-red-500 text-white animate-pulse"
                  : timerWarning
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

          {/* ════════════════════════════════════════════════
              LEFT — QUESTION STATUS LIST
          ════════════════════════════════════════════════ */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* List header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Question Status</p>
              <p className="text-xs text-muted-foreground">
                Total: {QUESTIONS.length} Questions
              </p>
            </div>

            {QUESTIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm text-muted-foreground">No question data available.</p>
                <p className="text-xs text-muted-foreground">
                  Please complete the exam first.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {QUESTIONS.map((q) => {
                  const cfg = STATUS_CONFIG[q.status];
                  return (
                    <li key={q.id}>
                      <span
                        onClick={() => navigate("/exam-area")}
                        className="flex cursor-pointer items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                      >
                        <span className="w-6 shrink-0 text-sm font-medium text-muted-foreground">
                          {q.id}
                        </span>
                        {cfg.icon}
                        <span className={`flex-1 text-sm font-medium ${cfg.textClass}`}>
                          {cfg.label}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT — ACTION PANEL (sticky)
          ════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">

            {/* Finish Attempt card */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <p className="text-sm font-semibold text-foreground">Finish Attempt</p>
              </div>

              <div className="p-5 space-y-4">
                {/* Warning box */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5">
                  <p className="text-xs font-semibold leading-relaxed text-primary">
                    Once you submit, you will no longer be able to change your answers for this attempt.
                  </p>
                </div>

                {/* Helper text */}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your responses are automatically saved. Pressing{" "}
                  <span className="font-semibold text-foreground">"Submit and Finish"</span>{" "}
                  locks the session and triggers the scoring engine.
                </p>

                {/* Error message */}
                {submitError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    {submitError}
                  </p>
                )}

                {/* Submit and Finish */}
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit and Finish
                      <SendHorizonal className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Go back */}
                <button
                  onClick={() => navigate("/exam-area")}
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Go Back to Questions
                </button>
              </div>
            </div>

            {/* Stuck on a question card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
              <div className="mb-2 flex justify-center">
                <Clock className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="mb-1 text-sm font-semibold text-foreground">Stuck on a question?</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                You can go back and review any flagged items before you finish.
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
