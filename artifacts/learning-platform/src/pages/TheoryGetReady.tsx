import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ShieldCheck,
  Wifi,
  FileText,
  Clock,
  PlayCircle,
  CheckCircle2,
  CalendarDays,
  Info,
  PenLine,
  BarChart2,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const MODE_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  clinical_case: "Clinical Case",
  real_life: "Real Life Problem Based",
};

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

export default function TheoryGetReady() {
  const config = getConfig();
  const modeLabel = MODE_LABELS[config.mode] ?? config.mode;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const endTime = new Date(now.getTime() + config.duration * 60 * 1000);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">

        {/* HEADER CARD */}
        <div className="mb-4 overflow-hidden rounded-xl border border-amber-200/60 bg-amber-50/40 dark:border-amber-800/30 dark:bg-amber-900/10">
          <div className="flex items-center justify-between border-b border-amber-200/40 dark:border-amber-800/20 px-6 py-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Theory Exam — Written Answers
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Wifi className="h-3.5 w-3.5" />
              System Ready
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Ready to start your theory exam?</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                You'll type written answers for each question. The timer can be paused during the exam. Review your answers before submitting.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex items-start gap-1.5 text-right text-xs text-muted-foreground">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-tight">{formatDate(now)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mb-4 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center py-6 text-center">
            <FileText className="mb-2 h-6 w-6 text-amber-600/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Questions
            </p>
            <p className="text-xl font-bold text-foreground">{config.questions}</p>
            <p className="text-xs text-muted-foreground">written</p>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="mb-2 h-6 w-6 text-amber-600/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Duration
            </p>
            <p className="text-xl font-bold text-foreground">{config.duration} Min</p>
            <p className="text-xs text-muted-foreground">pauseable</p>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            <Star className="mb-2 h-6 w-6 text-amber-600/70" />
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Max Score
            </p>
            <p className="text-xl font-bold text-foreground">{config.questions * 5}</p>
            <p className="text-xs text-muted-foreground">marks</p>
          </div>
        </div>

        {/* MODE + EXAM TYPE */}
        <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BarChart2 className="h-4 w-4 text-amber-600" />
              Exam Configuration
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Mode</p>
              <p className="font-bold text-foreground">{modeLabel}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Type</p>
              <p className="font-bold text-foreground">Theory — Written Answers</p>
            </div>
          </div>
        </div>

        {/* PROJECTED TIMEFRAME */}
        <div className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-5 py-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Projected Timeframe
            </span>
            <span className="text-xs font-semibold text-primary">
              ~{config.duration}m session (pauseable)
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
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm ring-2 ring-amber-500/20" />
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

        {/* FEATURES */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <PenLine className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Pause &amp; Resume</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              You can pause the timer at any time. Your answers are preserved and the clock resumes where it left off.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <Wifi className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">AI Semantic Scoring</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              After submitting, AI will score your answers semantically — meaning counts over exact wording. Each question is worth 5 marks.
            </p>
          </div>
        </div>

        {/* VERIFICATION BADGES */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
              {badge}
            </span>
          ))}
        </div>

        {/* ATTEMPT BUTTON */}
        <Link href="/theory-exam-area">
          <span className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-amber-600 py-4 text-base font-bold text-white shadow-md hover:bg-amber-700 active:scale-[0.99] transition-all">
            <PlayCircle className="h-5 w-5" />
            Attempt Quiz Now
          </span>
        </Link>

        {/* FOOTER */}
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
