import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Flag,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import type { PQQuestion } from "@/data/neuroscience2";

type Phase = "exam" | "review" | "results";

interface Answer {
  questionId: number;
  selected: string | null;
  flagged: boolean;
}

export default function NeuroscienceIIPractice() {
  const [, navigate] = useLocation();
  const [questions, setQuestions] = useState<PQQuestion[]>([]);
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<Phase>("exam");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("qym_neuro2_questions");
    const mins = Number(localStorage.getItem("qym_neuro2_minutes") ?? "30");
    if (!stored) {
      navigate("/past-questions/level-400/neuroscience-ii");
      return;
    }
    const qs: PQQuestion[] = JSON.parse(stored);
    setQuestions(qs);
    setTimeLimit(mins * 60);
    setTimeLeft(mins * 60);
    const init: Record<number, Answer> = {};
    qs.forEach((q) => {
      init[q.id] = { questionId: q.id, selected: null, flagged: false };
    });
    setAnswers(init);
  }, [navigate]);

  const submitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("results");
  }, []);

  useEffect(() => {
    if (phase !== "exam" || timeLimit === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeLimit, submitExam]);

  const currentQ = questions[currentIdx];

  function select(label: string) {
    if (phase !== "exam") return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], selected: label },
    }));
  }

  function toggleFlag() {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        flagged: !prev[currentQ.id]?.flagged,
      },
    }));
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const answered = Object.values(answers).filter((a) => a.selected !== null).length;
  const correct = questions.filter(
    (q) => answers[q.id]?.selected === q.correct
  ).length;
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  if (!currentQ && questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  if (phase === "results") {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ${
                score >= 70
                  ? "bg-green-100 text-green-700"
                  : score >= 50
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {score}%
            </div>
            <h1 className="mb-1 text-2xl font-bold text-foreground">
              {score >= 70 ? "Well done!" : score >= 50 ? "Keep it up!" : "Keep practicing!"}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              You got <strong className="text-foreground">{correct}</strong> of{" "}
              <strong className="text-foreground">{questions.length}</strong> questions correct
            </p>

            <div className="mb-8 grid grid-cols-3 gap-3">
              {[
                { label: "Correct", value: correct, color: "text-green-600" },
                { label: "Wrong", value: questions.length - correct, color: "text-red-600" },
                { label: "Unanswered", value: questions.length - answered, color: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setPhase("review");
                  setCurrentIdx(0);
                }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={() => navigate("/past-questions/level-400/neuroscience-ii")}
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
              >
                Back to Overview
              </button>
            </div>
            <button
              onClick={() => {
                const init: Record<number, Answer> = {};
                questions.forEach((q) => {
                  init[q.id] = { questionId: q.id, selected: null, flagged: false };
                });
                setAnswers(init);
                setCurrentIdx(0);
                setTimeLeft(timeLimit);
                setPhase("exam");
              }}
              className="mt-3 w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="mr-1.5 inline h-3.5 w-3.5" />
              Retry Same Questions
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isReview = phase === "review";
  const ans = answers[currentQ?.id];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (isReview) {
                setPhase("results");
              } else {
                if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                  navigate("/past-questions/level-400/neuroscience-ii");
                }
              }
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {isReview ? "Back to Results" : "Exit"}
          </button>

          <div className="flex items-center gap-3">
            {isReview ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Review Mode
              </span>
            ) : timeLimit > 0 ? (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  timeLeft < 60
                    ? "bg-red-100 text-red-700"
                    : timeLeft < 300
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </span>
            ) : null}
            <span className="text-sm text-muted-foreground">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                {currentQ.section}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Q{currentQ.number}
              </span>
              {ans?.flagged && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Flagged
                </span>
              )}
            </div>
            {!isReview && (
              <button
                onClick={toggleFlag}
                title="Flag for review"
                className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                  ans?.flagged
                    ? "bg-amber-100 text-amber-600"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="mb-5 text-base leading-relaxed text-foreground">{currentQ.text}</p>

          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const isSelected = ans?.selected === opt.label;
              const isCorrect = opt.label === currentQ.correct;

              let cls =
                "flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all cursor-pointer ";

              if (isReview) {
                if (isCorrect) {
                  cls += "border-green-400 bg-green-50";
                } else if (isSelected && !isCorrect) {
                  cls += "border-red-400 bg-red-50";
                } else {
                  cls += "border-border bg-card opacity-60";
                }
              } else {
                if (isSelected) {
                  cls += "border-purple-500 bg-purple-50 ring-1 ring-purple-400";
                } else {
                  cls += "border-border bg-card hover:border-purple-300 hover:bg-purple-50/30";
                }
              }

              return (
                <div
                  key={opt.label}
                  onClick={() => select(opt.label)}
                  className={cls}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isReview
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                        : isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`leading-relaxed ${
                      isReview
                        ? isCorrect
                          ? "font-semibold text-green-800"
                          : isSelected
                          ? "font-semibold text-red-800"
                          : "text-muted-foreground"
                        : isSelected
                        ? "font-semibold text-purple-900"
                        : "text-foreground"
                    }`}
                  >
                    {opt.text}
                  </span>
                  {isReview && isCorrect && (
                    <CheckCircle2 className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  )}
                  {isReview && isSelected && !isCorrect && (
                    <XCircle className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                </div>
              );
            })}
          </div>

          {isReview && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm">
              {ans?.selected === currentQ.correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-green-700 font-semibold">Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-red-700">
                    {ans?.selected
                      ? `You selected ${ans.selected}. `
                      : "Not answered. "}
                    <span className="font-semibold">Correct answer: {currentQ.correct}</span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {!isReview && (
              <button
                onClick={submitExam}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
              >
                <Home className="mr-1.5 inline h-3.5 w-3.5" />
                Submit
              </button>
            )}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={isReview ? () => setPhase("results") : submitExam}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-purple-700 transition-colors"
            >
              {isReview ? "See Results" : "Finish"}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const isAnswered = !!a?.selected;
            const isFlagged = a?.flagged;
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`h-7 w-7 rounded-md text-xs font-semibold transition-all ${
                  isCurrent
                    ? "ring-2 ring-purple-500 ring-offset-1 bg-purple-600 text-white"
                    : isFlagged
                    ? "bg-amber-200 text-amber-800"
                    : isAnswered
                    ? "bg-purple-100 text-purple-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
