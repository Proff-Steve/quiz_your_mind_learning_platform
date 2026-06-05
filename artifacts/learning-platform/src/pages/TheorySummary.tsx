import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Clock,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenLine,
  Send,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

interface TheoryConfig {
  theoryExamId?: number;
  questions: number;
  duration: number;
  mode: string;
  caseScenario?: string | null;
  questionsData?: Array<{ orderIndex: number; questionText: string }>;
}

function getConfig(): TheoryConfig {
  try {
    const raw = localStorage.getItem("qym_theory_config");
    if (raw) return JSON.parse(raw) as TheoryConfig;
  } catch {}
  return { questions: 5, duration: 30, mode: "easy" };
}

function getStoredAnswers(): Record<number, string> {
  try {
    const raw = localStorage.getItem("qym_theory_answers");
    if (raw) return JSON.parse(raw) as Record<number, string>;
  } catch {}
  return {};
}

function getStoredTimer(): number {
  try {
    const raw = localStorage.getItem("qym_theory_timer");
    if (raw) return parseInt(raw, 10);
  } catch {}
  return 0;
}

function formatTimerDisplay(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TheorySummary() {
  const [, navigate] = useLocation();
  const config = getConfig();
  const answers = getStoredAnswers();
  const questions = config.questionsData ?? [];

  const [timeLeft, setTimeLeft] = useState(getStoredTimer);
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const startedAt = useRef(Date.now());
  const initialTimer = useRef(getStoredTimer());

  useEffect(() => {
    const id = setInterval(() => {
      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        clearInterval(id);
        handleFinalSubmit();
        return;
      }
      timeLeftRef.current = next;
      setTimeLeft(next);
      localStorage.setItem("qym_theory_timer", String(next));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleFinalSubmit() {
    if (scoring) return;
    setScoring(true);
    setScoreError(null);

    try {
      const token = getToken();
      const currentAnswers = getStoredAnswers();
      const theoryExamId = config.theoryExamId;

      const answersArray = questions.map((q, i) => ({
        questionIndex: q.orderIndex,
        userAnswer: currentAnswers[i] ?? "",
      }));

      const timeTakenSeconds = Math.round((initialTimer.current - timeLeftRef.current) + (Date.now() - startedAt.current) / 1000);

      const res = await fetch(`${import.meta.env.BASE_URL}api/theory-exam/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ theoryExamId, answers: answersArray, timeTakenSeconds }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Scoring failed" }));
        throw new Error((body as { error?: string }).error ?? "Scoring failed");
      }

      const data = await res.json();
      localStorage.setItem("qym_theory_result", JSON.stringify(data));
      navigate("/theory-results");
    } catch (err: unknown) {
      setScoreError(err instanceof Error ? err.message : "Scoring failed. Please try again.");
      setScoring(false);
    }
  }

  const answeredCount = questions.filter((_, i) => (answers[i] ?? "").trim().length > 0).length;
  const unansweredCount = questions.length - answeredCount;

  const timerColor =
    timeLeft <= 60
      ? "text-red-500"
      : timeLeft <= 300
      ? "text-amber-500"
      : "text-foreground";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">

        {/* STICKY HEADER */}
        <div className="sticky top-0 z-30 mb-6 rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-bold text-foreground">Summary of Attempt</p>
            </div>
            <div className={`flex items-center gap-1.5 font-mono text-xl font-bold tabular-nums ${timerColor}`}>
              <Clock className="h-4 w-4" />
              {formatTimerDisplay(timeLeft)}
            </div>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="mb-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center py-5 text-center">
            <p className="text-2xl font-bold text-foreground">{questions.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
          <div className="flex flex-col items-center py-5 text-center">
            <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Answered</p>
          </div>
          <div className="flex flex-col items-center py-5 text-center">
            <p className={`text-2xl font-bold ${unansweredCount > 0 ? "text-amber-600" : "text-green-600"}`}>
              {unansweredCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Unanswered</p>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            You have {unansweredCount} unanswered question{unansweredCount !== 1 ? "s" : ""}. You can go back to complete them before submitting.
          </div>
        )}

        {scoreError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {scoreError}
          </div>
        )}

        {/* CASE SCENARIO (condensed) */}
        {config.caseScenario && (
          <div className="mb-4 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">Case Scenario</p>
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">{config.caseScenario}</p>
          </div>
        )}

        {/* QUESTIONS + ANSWERS REVIEW */}
        <div className="space-y-4">
          {questions.map((q, i) => {
            const answer = (answers[i] ?? "").trim();
            const hasAnswer = answer.length > 0;
            return (
              <div key={i} className={`rounded-xl border bg-card shadow-sm overflow-hidden ${hasAnswer ? "border-green-200 dark:border-green-800/40" : "border-amber-200 dark:border-amber-800/40"}`}>
                <div className={`flex items-center justify-between border-b px-4 py-2.5 ${hasAnswer ? "border-green-100 bg-green-50/60 dark:border-green-800/20 dark:bg-green-900/10" : "border-amber-100 bg-amber-50/60 dark:border-amber-800/20 dark:bg-amber-900/10"}`}>
                  <span className={`text-xs font-bold ${hasAnswer ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                    Question {i + 1}
                  </span>
                  {hasAnswer ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" /> No answer
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">{q.questionText}</p>
                  {hasAnswer ? (
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                      {answer}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2.5 text-xs text-muted-foreground dark:border-amber-700/40 dark:bg-amber-900/10">
                      No answer provided
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate("/theory-exam-area")}
            disabled={scoring}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back To Questions
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={scoring}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors disabled:opacity-70"
          >
            {scoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scoring…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit &amp; Finish
              </>
            )}
          </button>
        </div>

        {scoring && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-primary">AI is scoring your answers…</p>
            <p className="text-xs text-muted-foreground mt-0.5">This usually takes 15–30 seconds. Please wait.</p>
          </div>
        )}

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Timer continues until you submit. Submitting will stop the timer and score your exam.
        </p>
      </div>
    </DashboardLayout>
  );
}
