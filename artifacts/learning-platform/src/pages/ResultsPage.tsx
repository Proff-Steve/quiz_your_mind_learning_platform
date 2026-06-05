import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  Lock,
  Target,
  Clock,
  TrendingUp,
  LayoutDashboard,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface ExamResult {
  attemptId: number;
  attemptDate: string;
  score: string;
  correct: number;
  total: number;
}

interface LocalResult {
  examId: number;
  score: string;
  correct: number;
  total: number;
  elapsedSeconds: number;
  avgSeconds: number;
  virtualReward?: number | null;
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

function formatAvgSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${String(sec).padStart(2, "0")}s`;
}

function getLocalResult(): LocalResult | null {
  try {
    const raw = localStorage.getItem("qym_last_result");
    if (raw) return JSON.parse(raw) as LocalResult;
  } catch {}
  return null;
}

function getScoreMessage(pct: number): { message: string; subMessage: string } {
  if (pct >= 90) return { message: "Outstanding!", subMessage: "You've mastered this material with exceptional precision." };
  if (pct >= 75) return { message: "Congratulations!", subMessage: "Great performance! You have a strong understanding of the material." };
  if (pct >= 60) return { message: "Good Effort!", subMessage: "You're on the right track. A bit more review will seal the deal." };
  return { message: "Keep Going!", subMessage: "This attempt shows where to focus. Use the review to guide your next session." };
}

/* ─────────────────────────────────────────────────────────
   CIRCULAR SCORE INDICATOR
───────────────────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const SIZE = 176;
  const STROKE = 7;
  const R_OUTER = (SIZE - STROKE) / 2;
  const R_INNER = R_OUTER - 18;
  const CIRC_INNER = 2 * Math.PI * R_INNER;
  const DASH_INNER = (pct / 100) * CIRC_INNER;
  const CX = SIZE / 2;

  const DOT_COUNT = 60;
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2;
    dots.push({
      x: CX + R_OUTER * Math.cos(angle),
      y: CX + R_OUTER * Math.sin(angle),
    });
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1.6} className="fill-primary/20" />
        ))}
        <circle cx={CX} cy={CX} r={R_INNER} fill="none" strokeWidth={STROKE} className="stroke-muted" />
        <circle
          cx={CX}
          cy={CX}
          r={R_INNER}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${DASH_INNER} ${CIRC_INNER}`}
          className="stroke-primary transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold leading-none tracking-tight text-foreground">
          {pct}%
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────── */
function StatCard({
  icon, label, value, sub, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-5 text-center ${highlight ? "border-primary/20 bg-primary/5" : "border-border bg-card"}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-semibold uppercase tracking-widest ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold leading-none ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function ResultsPage() {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const local = getLocalResult();

  useEffect(() => {
    const token = getToken();
    const examId = local?.examId ?? 1;

    if (!token) {
      if (local) {
        setResult({
          attemptId: 0,
          attemptDate: new Date().toISOString(),
          score: local.score,
          correct: local.correct,
          total: local.total,
        });
      } else {
        setError("No result found. Please complete an exam first.");
      }
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.BASE_URL}api/exam-result?examId=${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No result found.");
        return res.json();
      })
      .then((data: ExamResult) => {
        setResult(data);
      })
      .catch((err: Error) => {
        if (local) {
          setResult({
            attemptId: 0,
            attemptDate: new Date().toISOString(),
            score: local.score,
            correct: local.correct,
            total: local.total,
          });
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error ?? "No result available."}</p>
          <Link href="/dashboard">
            <span className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const scorePct = Math.round(parseFloat(result.score));
  const { message, subMessage } = getScoreMessage(scorePct);

  const attemptDate = new Date(result.attemptDate);
  const dateStr = attemptDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = attemptDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const timeTaken = local ? formatSeconds(local.elapsedSeconds) : "—";
  const avgPerQ = local ? formatAvgSeconds(local.avgSeconds) : "—";
  const virtualReward = local?.virtualReward ?? null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">

        {/* ── VIRTUAL REWARD BANNER ─────────────────────────── */}
        {virtualReward !== null && (
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

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Exam Results
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              Exam #{result.attemptId || "—"}
            </p>
          </div>
          <div className="mt-2 shrink-0 text-right sm:mt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Attempt ID: #{result.attemptId}
            </p>
            <p className="text-xs text-muted-foreground">
              {dateStr} &bull; {timeStr}
            </p>
          </div>
        </div>

        {/* ── SCORE CARD ───────────────────────────────────── */}
        <div className="mb-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="flex justify-center">
            <ScoreRing pct={scorePct} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">
            {message}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subMessage}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {result.correct} / {result.total} Correct
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Attempt Locked
            </span>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="Precision"
            value={`${result.correct}/${result.total}`}
            sub="Total Correct Answers"
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Time Invested"
            value={timeTaken}
            sub="Total Duration"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Speed"
            value={avgPerQ}
            sub="Avg. Per Question"
            highlight
          />
        </div>

        {/* ── ACTION BANNER ─────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="mt-0.5 shrink-0">
              <Clock className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ready for a Detailed Review?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Explore each question to understand the 'why' behind the correct answers. Personalized explanations are generated based on your study materials.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch lg:flex-row">
            <Link href="/dashboard">
              <span className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Back to Dashboard
              </span>
            </Link>
            {(() => {
              try {
                const code = localStorage.getItem("qym_share_code");
                if (code) return (
                  <Link href={`/group-results?code=${code}`}>
                    <span className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors whitespace-nowrap">
                      <Users className="h-3.5 w-3.5" />
                      View Results
                    </span>
                  </Link>
                );
              } catch {}
              return null;
            })()}
            <Link href="/question-review">
              <span className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
                Review Questions
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* ── PERFORMANCE INSIGHT ───────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <TrendingUp className="h-4 w-4" />
            Performance Insight
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You answered{" "}
            <span className="font-semibold text-foreground">{result.correct} out of {result.total}</span>{" "}
            questions correctly, achieving a score of{" "}
            <span className="font-semibold text-foreground">{scorePct}%</span>.{" "}
            {scorePct >= 75
              ? "Excellent work! Review the incorrect answers to reinforce your weak spots."
              : "Keep studying! Use the detailed review below to focus on the questions you missed."}
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
