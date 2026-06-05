import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Clock,
  Pause,
  Play,
  ChevronRight,
  AlertCircle,
  PenLine,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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

function formatTimerDisplay(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TheoryExamArea() {
  const [, navigate] = useLocation();
  const config = getConfig();

  const totalSecs = config.duration * 60;

  const [answers, setAnswers] = useState<Record<number, string>>(getStoredAnswers);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("qym_theory_timer");
      if (stored) return parseInt(stored, 10);
    } catch {}
    return totalSecs;
  });

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const [showTimeWarning, setShowTimeWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 300 && timeLeft > 0) setShowTimeWarning(true);
    else setShowTimeWarning(false);
  }, [timeLeft]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = timeLeftRef.current - 1;
      if (next <= 0) {
        clearInterval(id);
        localStorage.setItem("qym_theory_answers", JSON.stringify(answersRef.current));
        localStorage.setItem("qym_theory_timer", "0");
        navigate("/theory-summary");
        return;
      }
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (next % 15 === 0) {
        localStorage.setItem("qym_theory_timer", String(next));
        localStorage.setItem("qym_theory_answers", JSON.stringify(answersRef.current));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [navigate]);

  const handleAnswerChange = useCallback((idx: number, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [idx]: value };
      localStorage.setItem("qym_theory_answers", JSON.stringify(next));
      return next;
    });
  }, []);

  function handleTogglePause() {
    setPaused((v) => {
      pausedRef.current = !v;
      return !v;
    });
  }

  function handleSubmitToSummary() {
    localStorage.setItem("qym_theory_answers", JSON.stringify(answersRef.current));
    localStorage.setItem("qym_theory_timer", String(timeLeftRef.current));
    navigate("/theory-summary");
  }

  const questions = config.questionsData ?? [];
  const answeredCount = questions.filter((_, i) => (answers[i] ?? "").trim().length > 0).length;

  const timerColor =
    timeLeft <= 60
      ? "text-red-500"
      : timeLeft <= 300
      ? "text-amber-500"
      : "text-foreground";

  const progressPct = Math.max(0, Math.min(100, ((totalSecs - timeLeft) / totalSecs) * 100));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8">

        {/* STICKY HEADER */}
        <div className="sticky top-0 z-30 mb-6 rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <PenLine className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Theory Exam</p>
                <p className="text-sm font-bold text-foreground">
                  {answeredCount}/{questions.length} answered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 font-mono text-xl font-bold tabular-nums ${timerColor}`}>
                <Clock className="h-4 w-4" />
                {formatTimerDisplay(timeLeft)}
              </div>

              <button
                onClick={handleTogglePause}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  paused
                    ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "border-border bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {paused ? "Resume" : "Pause"}
              </button>

              <button
                onClick={handleSubmitToSummary}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Submit
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-muted">
            <div
              className="h-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* PAUSED OVERLAY */}
        {paused && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
            <Pause className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Exam Paused</p>
              <p className="text-xs text-muted-foreground">Timer stopped. Click Resume to continue. All answers are saved.</p>
            </div>
            <button
              onClick={handleTogglePause}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              <Play className="h-3.5 w-3.5" />
              Resume
            </button>
          </div>
        )}

        {/* TIME WARNING */}
        {showTimeWarning && !paused && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {timeLeft <= 60
              ? "Less than 1 minute remaining! Submit soon."
              : `Only ${Math.ceil(timeLeft / 60)} minutes remaining.`}
          </div>
        )}

        {/* CASE SCENARIO */}
        {config.caseScenario && (
          <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50/60 p-5 dark:border-amber-800/30 dark:bg-amber-900/10">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">Case Scenario</p>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line"
              onCopy={(e) => e.preventDefault()}
              style={{ userSelect: "none" }}
            >
              {config.caseScenario}
            </p>
          </div>
        )}

        {/* QUESTIONS */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/30 px-5 py-3">
                <span className="text-sm font-bold text-amber-600">Question {i + 1}</span>
                <span className="ml-2 text-xs text-muted-foreground">/ 5 marks</span>
              </div>

              <div className="p-5">
                <p
                  className="mb-4 text-sm font-medium leading-relaxed text-foreground select-none"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  style={{ userSelect: "none" }}
                >
                  {q.questionText}
                </p>

                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  readOnly={paused}
                  placeholder={
                    paused
                      ? "Exam is paused. Click Resume to continue answering."
                      : "Type your answer here…"
                  }
                  rows={6}
                  className={`w-full resize-y rounded-lg border px-4 py-3 text-sm leading-relaxed transition-colors focus:outline-none focus:ring-1 ${
                    paused
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                      : (answers[i] ?? "").trim().length > 0
                      ? "border-amber-300 bg-card text-foreground focus:border-amber-500 focus:ring-amber-500/30"
                      : "border-border bg-muted/30 text-foreground focus:border-amber-500 focus:ring-amber-500/30"
                  }`}
                />

                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {(answers[i] ?? "").trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                  {(answers[i] ?? "").trim().length > 0 && (
                    <p className="text-xs font-medium text-amber-600">✓ Answered</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SUBMIT */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleTogglePause}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={handleSubmitToSummary}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
          >
            Submit &amp; Review
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Timer continues on the review page. You can go back and edit answers.
        </p>
      </div>
    </DashboardLayout>
  );
}
