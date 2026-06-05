import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart2,
  ChevronRight,
  PenLine,
  Home,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
  virtualReward?: number | null;
}

function getResult(): TheoryScoreData | null {
  try {
    const raw = localStorage.getItem("qym_theory_result");
    if (raw) return JSON.parse(raw) as TheoryScoreData;
  } catch {}
  return null;
}

function formatTime(secs: number | null): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function getGradeColor(grade: string): string {
  if (grade === "Excellent") return "text-green-600";
  if (grade === "Good") return "text-emerald-600";
  if (grade === "Satisfactory") return "text-blue-600";
  if (grade === "Fair") return "text-amber-600";
  if (grade === "Poor") return "text-orange-600";
  return "text-red-600";
}

function ScoreRing({ pct, passed }: { pct: number; passed: boolean }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
      <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke={passed ? "#16a34a" : "#d97706"}
        strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="65" y="60" textAnchor="middle" className="fill-foreground" style={{ fontSize: 22, fontWeight: 700, fill: "currentColor" }}>
        {Math.round(pct)}%
      </text>
      <text x="65" y="78" textAnchor="middle" style={{ fontSize: 11, fill: passed ? "#16a34a" : "#d97706", fontWeight: 600 }}>
        {passed ? "PASS" : "NEEDS WORK"}
      </text>
    </svg>
  );
}

export default function TheoryResults() {
  const [, navigate] = useLocation();
  const result = getResult();

  useEffect(() => {
    if (!result) {
      navigate("/dashboard");
    }
  }, [result, navigate]);

  if (!result) return null;

  const { totalScore, totalPossible, percentage, passed, timeTakenSeconds, results, virtualReward } = result;
  const roundedTotal = Math.round(totalScore * 10) / 10;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">

        {/* VIRTUAL REWARD BANNER */}
        {virtualReward !== null && virtualReward !== undefined && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Reward Earned! +{virtualReward.toFixed(2)} added to your virtual balance
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  You scored ≥80% — great performance!
                </p>
              </div>
            </div>
            <Link href="/my-account-balance">
              <span className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer">
                View Wallet
              </span>
            </Link>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {passed ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                <Trophy className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <PenLine className="h-8 w-8" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Theory Exam Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {passed
              ? "Congratulations! You passed the theory exam."
              : "Keep studying — you'll do better next time!"}
          </p>
        </div>

        {/* SCORE RING + STATS */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:items-center">
            <div className="flex shrink-0 justify-center">
              <ScoreRing pct={percentage} passed={passed} />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Total Score</p>
                <p className="text-2xl font-bold text-foreground">{roundedTotal}/{totalPossible}</p>
                <p className="text-xs text-muted-foreground">marks</p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Result</p>
                <p className={`text-2xl font-bold ${passed ? "text-green-600" : "text-amber-600"}`}>
                  {passed ? "Pass" : "Fail"}
                </p>
                <p className="text-xs text-muted-foreground">≥60% to pass</p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Questions</p>
                <p className="text-2xl font-bold text-foreground">{results.length}</p>
                <p className="text-xs text-muted-foreground">answered</p>
              </div>
              <div className="rounded-lg bg-muted/30 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Time Taken</p>
                <p className="text-2xl font-bold text-foreground">{formatTime(timeTakenSeconds)}</p>
                <p className="text-xs text-muted-foreground">elapsed</p>
              </div>
            </div>
          </div>
        </div>

        {/* PER-QUESTION MINI BREAKDOWN */}
        <div className="mb-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-amber-600" />
              Score Breakdown
            </h2>
          </div>
          <div className="divide-y divide-border">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {r.marks >= 3 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span className="text-sm text-foreground truncate">Question {i + 1}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold ${getGradeColor(r.grade)}`}>{r.grade}</span>
                  <span className="font-bold text-foreground tabular-nums">{r.marks}/{r.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PASS/FAIL MESSAGE */}
        <div className={`mb-6 rounded-xl border px-5 py-4 ${passed ? "border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-900/10" : "border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10"}`}>
          <p className={`text-sm font-bold ${passed ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {passed ? "✓ Pass — Well done!" : "⚠ Needs Improvement"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {passed
              ? `You scored ${roundedTotal}/${totalPossible} (${Math.round(percentage)}%). You demonstrated a solid understanding of the material.`
              : `You scored ${roundedTotal}/${totalPossible} (${Math.round(percentage)}%). Review the detailed analysis to understand where you can improve.`}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <Link href="/theory-analysis">
            <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors">
              Review Questions &amp; Analysis
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>

          <Link href="/dashboard">
            <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </span>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeTakenSeconds)} taken
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="h-3.5 w-3.5" />
            {results.length} questions scored
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
