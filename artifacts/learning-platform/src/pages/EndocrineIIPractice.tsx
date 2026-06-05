import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  BookOpen,
  PanelLeft,
} from "lucide-react";
import { type PQQuestion } from "@/data/endocrine2";

type Phase = "exam" | "results";

interface Answer {
  questionId: number;
  selected: string | null;
}

const SECTION_COLORS: Record<string, string> = {
  "Internal Medicine":    "bg-blue-100 text-blue-700",
  "Pediatrics":           "bg-indigo-100 text-indigo-700",
  "Surgery":              "bg-violet-100 text-violet-700",
  "Pathology":            "bg-purple-100 text-purple-700",
  "Chemical Pathology":   "bg-fuchsia-100 text-fuchsia-700",
  "Pharmacology":         "bg-rose-100 text-rose-700",
  "Anatomy & Physiology": "bg-orange-100 text-orange-700",
};

function useTimer(initialSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || initialSeconds === 0) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [active, initialSeconds]);

  const formatted = (() => {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  return { remaining, formatted };
}

export default function EndocrineIIPractice() {
  const [, navigate] = useLocation();

  const [questions] = useState<PQQuestion[]>(() => {
    try {
      const stored = localStorage.getItem("qym_e2_questions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [minutes] = useState(() => {
    try {
      return Number(localStorage.getItem("qym_e2_minutes") ?? "0");
    } catch {
      return 0;
    }
  });

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    (questions as PQQuestion[]).map((q) => ({ questionId: q.id, selected: null }))
  );
  const [phase, setPhase] = useState<Phase>("exam");
  const [navOpen, setNavOpen] = useState(false);
  const [timesUp, setTimesUp] = useState(false);

  const { remaining, formatted } = useTimer(minutes * 60, phase === "exam");

  useEffect(() => {
    if (minutes > 0 && remaining === 0 && phase === "exam") {
      setTimesUp(true);
      setPhase("results");
    }
  }, [remaining, minutes, phase]);

  const selectAnswer = useCallback(
    (label: string) => {
      setAnswers((prev) =>
        prev.map((a, i) =>
          i === current ? { ...a, selected: label } : a
        )
      );
    },
    [current]
  );

  const submit = useCallback(() => setPhase("results"), []);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No questions found.</p>
        <button
          onClick={() => navigate("/past-questions/level-400/endocrine-ii")}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const correct = answers.filter(
      (a, i) => a.selected === questions[i]?.correct
    ).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const unanswered = answers.filter((a) => a.selected === null).length;

    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${
                pct >= 70
                  ? "bg-green-100 text-green-700"
                  : pct >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pct}%
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {timesUp ? "Time's Up!" : "Practice Complete"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {correct} of {total} correct
              {unanswered > 0 && ` · ${unanswered} unanswered`}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/past-questions/level-400/endocrine-ii")}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Back to ENDOCRINE II
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setAnswers(questions.map((q) => ({ questionId: q.id, selected: null })));
                  setCurrent(0);
                  setTimesUp(false);
                  setPhase("exam");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => {
              const ans = answers[idx];
              const isCorrect = ans.selected === q.correct;
              const attempted = ans.selected !== null;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 ${
                    !attempted
                      ? "border-border bg-card"
                      : isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      {q.section} · Q{q.number}
                    </span>
                    {attempted ? (
                      isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Not answered</span>
                    )}
                  </div>

                  <p className="mb-3 text-sm leading-relaxed text-foreground">{q.text}</p>

                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isSelected = ans.selected === opt.label;
                      const isRight = opt.label === q.correct;
                      return (
                        <div
                          key={opt.label}
                          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                            isRight
                              ? "bg-yellow-100 ring-1 ring-yellow-400"
                              : isSelected && !isRight
                              ? "bg-red-100 ring-1 ring-red-300"
                              : "bg-muted/30"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              isRight
                                ? "bg-yellow-400 text-yellow-900"
                                : isSelected
                                ? "bg-red-400 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span
                            className={`leading-relaxed ${
                              isRight
                                ? "font-semibold text-yellow-900"
                                : isSelected
                                ? "font-medium text-red-800"
                                : "text-muted-foreground"
                            }`}
                          >
                            {opt.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const ans = answers[current];
  const answered = answers.filter((a) => a.selected !== null).length;
  const timerWarning = minutes > 0 && remaining < 60;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/past-questions/level-400/endocrine-ii")}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Exit
          </button>
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            ENDOCRINE II Practice
          </span>
        </div>

        <div className="flex items-center gap-4">
          {minutes > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                timerWarning
                  ? "bg-red-100 text-red-700 animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatted}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {answered}/{questions.length} answered
          </span>
          <button
            onClick={() => setNavOpen((o) => !o)}
            className="rounded-lg border border-border bg-card p-2 hover:bg-muted transition-colors"
            title="Question navigator"
          >
            <PanelLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  SECTION_COLORS[q.section] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {q.section}
              </span>
              <span className="text-xs text-muted-foreground">
                Question {current + 1} of {questions.length}
              </span>
            </div>

            <p className="mb-6 text-base leading-relaxed text-foreground sm:text-lg">
              {q.text}
            </p>

            <div className="space-y-3">
              {q.options.map((opt) => {
                const selected = ans.selected === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => selectAnswer(opt.label)}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-purple-500 bg-purple-50"
                        : "border-border bg-card hover:border-purple-200 hover:bg-purple-50/30"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        selected
                          ? "bg-purple-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent((c) => c + 1)}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors"
                >
                  Submit
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </main>

        {navOpen && (
          <aside className="w-64 shrink-0 overflow-y-auto border-l border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Navigator
              </p>
              <button
                onClick={() => setNavOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, idx) => {
                const a = answers[idx];
                const isCurr = idx === current;
                const isDone = a.selected !== null;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrent(idx);
                      setNavOpen(false);
                    }}
                    className={`flex h-8 w-full items-center justify-center rounded text-xs font-bold transition-colors ${
                      isCurr
                        ? "bg-purple-600 text-white"
                        : isDone
                        ? "bg-purple-100 text-purple-700"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-purple-600" />
                Current
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-purple-100" />
                Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-muted" />
                Unanswered
              </div>
            </div>
            <button
              onClick={submit}
              className="mt-6 w-full rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-colors"
            >
              Submit Exam
            </button>
          </aside>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-full bg-muted h-1.5">
            <div
              className="h-1.5 rounded-full bg-purple-500 transition-all"
              style={{ width: `${(answered / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {Math.round((answered / questions.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
