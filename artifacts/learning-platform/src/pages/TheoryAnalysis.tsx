import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Download,
  CheckCircle2,
  XCircle,
  PenLine,
  Home,
  ChevronLeft,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

interface ScoreResult {
  questionIndex: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  marks: number;
  maxMarks: number;
  grade: string;
  feedback: string;
}

interface TheoryScoreData {
  results: ScoreResult[];
  totalScore: number;
  totalPossible: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number | null;
  caseScenario?: string | null;
}

function getResult(): TheoryScoreData | null {
  try {
    const raw = localStorage.getItem("qym_theory_result");
    if (raw) return JSON.parse(raw) as TheoryScoreData;
  } catch {}
  return null;
}

function getGradeColor(grade: string): string {
  if (grade === "Excellent") return "text-green-600";
  if (grade === "Good") return "text-emerald-600";
  if (grade === "Satisfactory") return "text-blue-600";
  if (grade === "Fair") return "text-amber-600";
  if (grade === "Poor") return "text-orange-600";
  return "text-red-600";
}

function getGradeBg(grade: string): string {
  if (grade === "Excellent") return "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/40";
  if (grade === "Good") return "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/40";
  if (grade === "Satisfactory") return "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/40";
  if (grade === "Fair") return "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/40";
  if (grade === "Poor") return "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/40";
  return "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/40";
}

function StarMarks({ marks, max }: { marks: number; max: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(marks)
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-bold text-foreground tabular-nums">
        {marks}/{max}
      </span>
    </div>
  );
}

export default function TheoryAnalysis() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const result = getResult();
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result) {
      navigate("/dashboard");
    }
  }, [result, navigate]);

  if (!result) return null;

  const { results, totalScore, totalPossible, percentage, passed, timeTakenSeconds, caseScenario } = result;
  const roundedTotal = Math.round(totalScore * 10) / 10;

  function formatTime(secs: number | null): string {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  function handleDownloadPDF() {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #theory-analysis-print, #theory-analysis-print * { visibility: visible; }
        #theory-analysis-print { position: fixed; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        @page { margin: 20mm; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">

        {/* PAGE HEADER */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Detailed Analysis</h1>
              <p className="text-xs text-muted-foreground">Question-by-question review with AI feedback</p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT */}
        <div id="theory-analysis-print" ref={printAreaRef}>

          {/* PRINT HEADER (only visible when printing) */}
          <div className="hidden print:block mb-6 border-b border-border pb-4">
            <h1 className="text-xl font-bold">Theory Exam — Detailed Analysis</h1>
            <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
              <p>Student: {user?.name ?? "Student"} · ID: {user?.studentId ?? "—"}</p>
              <p>Institution: {user?.institution ?? "—"}</p>
              <p>Date: {today}</p>
              <p>Score: {roundedTotal}/{totalPossible} ({Math.round(percentage)}%) · {passed ? "PASS" : "FAIL"} · Time: {formatTime(timeTakenSeconds)}</p>
            </div>
          </div>

          {/* SUMMARY BANNER */}
          <div className={`mb-6 rounded-xl border px-5 py-4 ${passed ? "border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10" : "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-bold ${passed ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                  {passed ? "✓ Pass" : "✗ Needs Improvement"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {roundedTotal}/{totalPossible} marks · {Math.round(percentage)}% · {formatTime(timeTakenSeconds)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {results.map((r, i) => (
                  <div
                    key={i}
                    title={`Q${i + 1}: ${r.marks}/${r.maxMarks}`}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${r.marks >= 4 ? "bg-green-500" : r.marks >= 2.5 ? "bg-amber-500" : "bg-red-500"}`}
                  >
                    {r.marks}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CASE SCENARIO */}
          {caseScenario && (
            <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-50/60 p-5 dark:border-amber-800/30 dark:bg-amber-900/10">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">Case Scenario</p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{caseScenario}</p>
            </div>
          )}

          {/* QUESTIONS */}
          <div className="space-y-6">
            {results.map((r, i) => (
              <div key={i} className={`rounded-xl border overflow-hidden shadow-sm ${getGradeBg(r.grade)}`}>

                {/* Question header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-inherit">
                  <div className="flex items-center gap-2">
                    {r.marks >= 3 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-foreground">Question {i + 1}</span>
                    <span className={`ml-1 text-xs font-semibold ${getGradeColor(r.grade)}`}>
                      · {r.grade}
                    </span>
                  </div>
                  <StarMarks marks={r.marks} max={r.maxMarks} />
                </div>

                <div className="p-5 space-y-4 bg-card">

                  {/* Question text */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question</p>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{r.questionText}</p>
                  </div>

                  {/* User answer */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Answer</p>
                    {(r.userAnswer ?? "").trim().length > 0 ? (
                      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {r.userAnswer}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground italic">
                        No answer provided
                      </div>
                    )}
                  </div>

                  {/* Correct answer */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Correct Answer</p>
                    <div className="rounded-lg border border-green-200 bg-green-50/80 px-4 py-3 text-sm leading-relaxed text-green-800 dark:border-green-800/40 dark:bg-green-900/10 dark:text-green-300 whitespace-pre-wrap">
                      {r.correctAnswer}
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Mistakes / Improvements
                    </p>
                    <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${getGradeBg(r.grade)} text-foreground whitespace-pre-wrap`}>
                      {r.feedback}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* PRINT FOOTER */}
          <div className="hidden print:block mt-8 border-t border-border pt-4 text-xs text-muted-foreground text-center">
            Generated by Quiz Your Mind Learning Platform · {today} · {user?.name ?? "Student"}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="mt-8 flex gap-3 no-print">
          <Link href="/theory-results">
            <span className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Results
            </span>
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
          >
            <Download className="h-4 w-4" />
            Download Analysis PDF
          </button>
          <Link href="/dashboard">
            <span className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <Home className="h-4 w-4" />
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
