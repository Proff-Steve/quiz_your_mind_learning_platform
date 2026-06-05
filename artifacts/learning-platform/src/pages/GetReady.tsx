import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ShieldCheck,
  Wifi,
  FileText,
  Clock,
  Lock,
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  CalendarDays,
  Info,
  Share2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   "Easy",
  medium: "Medium",
  hard:   "Hard",
  usmle:  "USMLE Standard",
  uccsms: "UCCSMS Standard",
};

function getConfig() {
  try {
    const raw = localStorage.getItem("qym_quiz_config");
    if (raw) return JSON.parse(raw) as { examId?: number; questions: number; duration: number; difficulty: string };
  } catch {}
  return { questions: 50, duration: 60, difficulty: "medium" };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const BADGES = [
  "Stable Connection",
  "Browser Compatible",
  "Student Identity Verified",
  "Materials Indexed",
];

function ShareCodeDialog({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Share2 className="h-6 w-6" />
        </div>

        <h2 className="text-lg font-bold text-foreground">Exam Share Code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this code with other students. They can use it to join and attempt the same exam.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4">
          <span className="flex-1 text-center text-3xl font-extrabold tracking-[0.25em] text-primary">
            {code}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Students can enter this code on the "Generate Study Quiz" page under "Join Exam"
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-border bg-card py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function GetReady() {
  const config = getConfig();
  const difficultyLabel = DIFFICULTY_LABELS[config.difficulty] ?? config.difficulty;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const endTime = new Date(now.getTime() + config.duration * 60 * 1000);

  const [shareCode, setShareCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem("qym_share_code");
    } catch { return null; }
  });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  async function handleGenerateCode() {
    const token = getToken();
    if (!token) {
      setShareError("You must be logged in to generate a share code.");
      return;
    }
    if (!config.examId) {
      setShareError("No exam found. Please generate questions first.");
      return;
    }

    setGenerating(true);
    setShareError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/exam-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: config.examId }),
      });
      const data = await res.json() as { code?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to generate code");
      const code = data.code!;
      setShareCode(code);
      localStorage.setItem("qym_share_code", code);
      setShowShareDialog(true);
    } catch (err: unknown) {
      setShareError(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setGenerating(false);
    }
  }

  function handleShowExistingCode() {
    if (shareCode) setShowShareDialog(true);
    else handleGenerateCode();
  }

  return (
    <DashboardLayout>
      {showShareDialog && shareCode && (
        <ShareCodeDialog code={shareCode} onClose={() => setShowShareDialog(false)} />
      )}

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">

        {/* ── HEADER CARD ──────────────────────────────────── */}
        <div className="mb-4 overflow-hidden rounded-xl border border-border bg-primary/5">
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Attempt
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Wifi className="h-3.5 w-3.5" />
              System Ready
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Ready to start your quiz?</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Review your exam configuration before proceeding. Once started, the timer cannot be paused.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex items-start gap-1.5 text-right text-xs text-muted-foreground">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-tight">{formatDate(now)}</span>
              </div>
              <button
                onClick={handleShowExistingCode}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
              >
                <Share2 className="h-3.5 w-3.5" />
                {generating ? "Generating…" : shareCode ? "Show Code" : "Generate Code / Link"}
              </button>
              {shareError && (
                <p className="text-xs text-red-500">{shareError}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center py-6 text-center">
            <FileText className="mb-2 h-6 w-6 text-primary/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Questions
            </p>
            <p className="text-xl font-bold text-foreground">{config.questions} MCQs</p>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="mb-2 h-6 w-6 text-primary/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total Duration
            </p>
            <p className="text-xl font-bold text-foreground">{config.duration} Minutes</p>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            <Lock className="mb-2 h-6 w-6 text-primary/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Difficulty
            </p>
            <p className="text-xl font-bold text-foreground">{difficultyLabel}</p>
          </div>
        </div>

        {/* ── PROJECTED TIMEFRAME ──────────────────────────── */}
        <div className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-5 py-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Projected Timeframe
            </span>
            <span className="text-xs font-semibold text-primary">
              ~{config.duration}m active session
            </span>
          </div>

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Estimated Start
              </p>
              <p className="text-2xl font-bold text-foreground">{formatTime(now)}</p>
            </div>

            <div className="flex flex-1 items-center gap-1.5 px-2">
              <div className="h-px flex-1 bg-border" />
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm ring-2 ring-primary/20" />
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex-1 text-right">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Estimated End
              </p>
              <p className="text-2xl font-bold text-foreground">{formatTime(endTime)}</p>
            </div>
          </div>
        </div>

        {/* ── FEATURE CARDS ────────────────────────────────── */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCw className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Autosave Enabled</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Every answer you select is instantly synced with our servers. Progress is never lost.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wifi className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Offline Resilience</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Our app continues working even if your internet drops. Results sync once reconnected.
            </p>
          </div>
        </div>

        {/* ── VERIFICATION BADGES ──────────────────────────── */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {badge}
            </span>
          ))}
        </div>

        {/* ── ATTEMPT BUTTON ───────────────────────────────── */}
        <Link href="/exam-area">
          <span className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all">
            <PlayCircle className="h-5 w-5" />
            Attempt Quiz Now
          </span>
        </Link>

        {/* ── FOOTER LINKS ─────────────────────────────────── */}
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-3.5 w-3.5" /> Exam Rules
          </a>
          <a href="#" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-3.5 w-3.5" /> Technical Support
          </a>
        </div>

      </div>
    </DashboardLayout>
  );
}
