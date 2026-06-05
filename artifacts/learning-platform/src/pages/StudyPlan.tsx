import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ChevronRight,
  BookOpen,
  Calendar,
  Clock,
  Zap,
  Target,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  LayoutGrid,
  FileText,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";

type SessionType = "study" | "revision" | "quiz" | "fixed" | "break";

interface StudySession {
  startTime: string;
  endTime: string;
  type: SessionType;
  subject: string;
  topic: string;
  color: string;
}

interface DaySchedule {
  day: string;
  sessions: StudySession[];
}

interface WeekPlan {
  weekNumber: number;
  days: DaySchedule[];
}

interface StudyPlanResponse {
  plan: WeekPlan[];
  subjects: string[];
  summary: string;
  savedAt?: string;
}

interface ScheduleBlock {
  days: string[];
  startTime: string;
  endTime: string;
  label: string;
}

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PERIOD_OPTIONS = [
  { value: "dawn", label: "Dawn (12 AM–6 AM)" },
  { value: "morning", label: "Morning (6 AM–12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM–6 PM)" },
  { value: "evening", label: "Evening (6 PM–12 AM)" },
];

const TYPE_LABELS: Record<SessionType, string> = {
  study: "Study",
  revision: "Revision",
  quiz: "Self Quiz",
  fixed: "Fixed",
  break: "Break",
};

const TYPE_BADGE_STYLES: Record<SessionType, string> = {
  study: "bg-blue-100 text-blue-700 border-blue-200",
  revision: "bg-rose-100 text-rose-700 border-rose-200",
  quiz: "bg-green-100 text-green-700 border-green-200",
  fixed: "bg-amber-100 text-amber-700 border-amber-200",
  break: "bg-purple-100 text-purple-700 border-purple-200",
};

function sessionColor(type: SessionType): string {
  const map: Record<SessionType, string> = {
    study: "#93C5FD",
    revision: "#FDA4AF",
    quiz: "#86EFAC",
    fixed: "#FDE68A",
    break: "#D8B4FE",
  };
  return map[type] ?? "#93C5FD";
}

function emptyBlock(): ScheduleBlock {
  return { days: [], startTime: "", endTime: "", label: "" };
}

function formatSavedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function StudyPlan() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [generating, setGenerating] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudyPlanResponse | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);

  const [lectures, setLectures] = useState<ScheduleBlock[]>([emptyBlock()]);
  const [church, setChurch] = useState<ScheduleBlock[]>([emptyBlock()]);
  const [classes, setClasses] = useState<ScheduleBlock[]>([emptyBlock()]);

  const [gym, setGym] = useState("");
  const [leadershipMeetings, setLeadershipMeetings] = useState("");
  const [fellowshipDuties, setFellowshipDuties] = useState("");
  const [sideProjects, setSideProjects] = useState("");

  const [sleepTime, setSleepTime] = useState("10:00 PM");
  const [wakeTime, setWakeTime] = useState("6:00 AM");

  const [mostFocused, setMostFocused] = useState<string[]>([]);
  const [mostTired, setMostTired] = useState<string[]>([]);
  const [mostActive, setMostActive] = useState<string[]>([]);

  const [nextExamDate, setNextExamDate] = useState("");
  const [blockTestDates, setBlockTestDates] = useState("");

  const [planStyle, setPlanStyle] = useState<"strict" | "balanced" | "loose">("balanced");
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [numberOfWeeks, setNumberOfWeeks] = useState(2);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (loading || !user) return;
    const token = getToken();
    fetch(`${import.meta.env.BASE_URL}api/study-plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json() as StudyPlanResponse;
          setResult(data);
          setCurrentWeek(0);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, [loading, user]);

  function togglePeriod(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function toggleDay(block: ScheduleBlock, day: string): ScheduleBlock {
    const days = block.days.includes(day)
      ? block.days.filter((d) => d !== day)
      : [...block.days, day];
    return { ...block, days };
  }

  function updateBlock(
    list: ScheduleBlock[],
    setList: (v: ScheduleBlock[]) => void,
    idx: number,
    patch: Partial<ScheduleBlock>
  ) {
    setList(list.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    setResult(null);
    try {
      const token = getToken();
      const body = {
        fixedSchedule: { lectures, church, classes },
        semiFlexible: { gym, leadershipMeetings, fellowshipDuties, sideProjects },
        sleepPattern: { sleepTime, wakeTime },
        energyPattern: { mostFocused, mostTired, mostActive },
        examTimeline: { nextExamDate, blockTestDates },
        planStyle,
        hoursPerDay,
        numberOfWeeks,
      };

      const res = await fetch(`${import.meta.env.BASE_URL}api/study-plan/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data as StudyPlanResponse);
      setCurrentWeek(0);
      setTimeout(() => {
        document.getElementById("study-plan-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete your saved study plan? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/study-plan`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setResult(null);
      setCurrentWeek(0);
    } catch {
      setError("Failed to delete study plan. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || loadingSaved) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const ORDERED_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <span className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </span>
          </Link>
          <div className="flex items-start gap-4 mt-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {result ? "Your Study Plan" : "Create Study Plan"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {result
                  ? "Your AI-generated timetable is saved and ready. Regenerate anytime or delete it to start fresh."
                  : "Fill in your schedule details and let AI build a personalized weekly timetable from your uploaded materials."}
              </p>
            </div>
            <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <Zap className="h-3.5 w-3.5" />
              AI Powered
            </span>
          </div>
        </div>

        {/* Saved plan banner */}
        {result && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-700">Plan saved to your account</p>
                {result.savedAt && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Last generated: {formatSavedAt(result.savedAt)}
                  </p>
                )}
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete Plan
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">

          {/* Generated Plan — shown at top when a plan exists */}
          {result && (
            <div id="study-plan-result">
              {/* Summary */}
              <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-700 mb-1">Plan Overview</p>
                    <p className="text-sm text-indigo-600 leading-relaxed">{result.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {result.subjects.map((s) => (
                        <span
                          key={s}
                          className="inline-flex rounded-full border border-indigo-200 bg-white px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Legend:</span>
                {(Object.entries(TYPE_LABELS) as [SessionType, string][]).map(([type, label]) => (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE_STYLES[type]}`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sessionColor(type) }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* Week navigator */}
              {result.plan.length > 1 && (
                <div className="mb-4 flex items-center gap-3">
                  <button
                    onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
                    disabled={currentWeek === 0}
                    className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    Week {result.plan[currentWeek]?.weekNumber}
                  </span>
                  <button
                    onClick={() => setCurrentWeek((w) => Math.min(result.plan.length - 1, w + 1))}
                    disabled={currentWeek === result.plan.length - 1}
                    className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="flex gap-1 ml-1">
                    {result.plan.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentWeek(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentWeek ? "w-6 bg-indigo-500" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Timetable */}
              <WeeklyTimetable week={result.plan[currentWeek]} orderedDays={ORDERED_DAYS} />

              {/* Divider before form */}
              <div className="mt-8 mb-6 flex items-center gap-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Regenerate with new settings
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
            </div>
          )}

          {/* 1. Fixed Weekly Schedule */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">1</span>
              <h2 className="text-sm font-semibold text-foreground">Fixed Weekly Schedule</h2>
              <span className="text-xs text-muted-foreground">— Non-negotiables. The plan builds around these.</span>
            </div>

            {(
              [
                { label: "Lectures / Clinicals", list: lectures, setList: setLectures },
                { label: "Church / Spiritual Activities", list: church, setList: setChurch },
                { label: "Classes / Group Discussions", list: classes, setList: setClasses },
              ] as Array<{ label: string; list: ScheduleBlock[]; setList: (v: ScheduleBlock[]) => void }>
            ).map(({ label, list, setList }) => (
              <div key={label} className="mb-5 last:mb-0">
                <p className="text-xs font-medium text-foreground mb-2">{label}</p>
                {list.map((block, idx) => (
                  <div key={idx} className="mb-3 rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
                    <div className="flex flex-wrap gap-1">
                      {DAY_OPTIONS.map((day) => (
                        <button
                          key={day}
                          onClick={() => updateBlock(list, setList, idx, toggleDay(block, day))}
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            block.days.includes(day)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground w-8">From</span>
                        <input
                          type="time"
                          value={block.startTime}
                          onChange={(e) => updateBlock(list, setList, idx, { startTime: e.target.value })}
                          className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground w-6">To</span>
                        <input
                          type="time"
                          value={block.endTime}
                          onChange={(e) => updateBlock(list, setList, idx, { endTime: e.target.value })}
                          className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Label (e.g. Anatomy Lecture)"
                        value={block.label}
                        onChange={(e) => updateBlock(list, setList, idx, { label: e.target.value })}
                        className="flex-1 min-w-[140px] rounded border border-border bg-card px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {list.length > 1 && (
                        <button
                          onClick={() => setList(list.filter((_, i) => i !== idx))}
                          className="text-destructive hover:text-destructive/70 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setList([...list, emptyBlock()])}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition-colors font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add another slot
                </button>
              </div>
            ))}
          </div>

          {/* 2. Semi-Flexible */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">2</span>
              <h2 className="text-sm font-semibold text-foreground">Semi-Flexible Commitments</h2>
              <span className="text-xs text-muted-foreground">— No fixed time, but still matter.</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Gym / Exercise", val: gym, set: setGym, placeholder: "e.g. 3× per week, ~1 hour" },
                { label: "Leadership Roles / Meetings", val: leadershipMeetings, set: setLeadershipMeetings, placeholder: "e.g. Sunday afternoons, 2hrs" },
                { label: "Fellowship Responsibilities", val: fellowshipDuties, set: setFellowshipDuties, placeholder: "e.g. Wednesday, 1hr" },
                { label: "Side Projects", val: sideProjects, set: setSideProjects, placeholder: "e.g. None / Freelance ~2hrs Sat" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Sleep Pattern */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">3</span>
              <h2 className="text-sm font-semibold text-foreground">Sleep Pattern</h2>
              <span className="text-xs text-muted-foreground">— Be honest. This determines everything.</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Wake-up time</label>
                <input
                  type="text"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  placeholder="e.g. 6:00 AM"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Sleep time</label>
                <input
                  type="text"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  placeholder="e.g. 10:00 PM"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* 4. Energy Pattern */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-600">4</span>
              <h2 className="text-sm font-semibold text-foreground">Energy Pattern</h2>
              <span className="text-xs text-muted-foreground">— Critical. Hard topics go during your peak focus window.</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Most Focused", list: mostFocused, setList: setMostFocused, active: "border-green-400 bg-green-50 text-green-700" },
                { label: "Most Tired", list: mostTired, setList: setMostTired, active: "border-red-400 bg-red-50 text-red-600" },
                { label: "Most Active", list: mostActive, setList: setMostActive, active: "border-blue-400 bg-blue-50 text-blue-700" },
              ].map(({ label, list, setList, active }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
                  <div className="flex flex-col gap-1.5">
                    {PERIOD_OPTIONS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => togglePeriod(list, setList, p.value)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors ${
                          list.includes(p.value)
                            ? active
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Exam Timeline */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">5</span>
              <h2 className="text-sm font-semibold text-foreground">Exam Timeline</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Next major exam date</label>
                <input
                  type="date"
                  value={nextExamDate}
                  onChange={(e) => setNextExamDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Block tests / upcoming assessments</label>
                <input
                  type="text"
                  value={blockTestDates}
                  onChange={(e) => setBlockTestDates(e.target.value)}
                  placeholder="e.g. Block test May 10, Practicals May 15"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* 6. Subjects */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-600">6</span>
              <h2 className="text-sm font-semibold text-foreground">Subjects</h2>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
              <BookOpen className="h-4 w-4 shrink-0 text-teal-600" />
              <p className="text-sm text-teal-700 leading-relaxed">
                Subjects are automatically pulled from your uploaded materials. Make sure your files are uploaded before generating.
              </p>
              <Link href="/materials">
                <span className="ml-auto shrink-0 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors whitespace-nowrap">
                  <FileText className="h-3.5 w-3.5" />
                  My Materials
                </span>
              </Link>
            </div>
          </div>

          {/* 7. Plan Style */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">7</span>
              <h2 className="text-sm font-semibold text-foreground">How Strict You Want the Plan</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  value: "strict",
                  label: "Strict",
                  emoji: "🎯",
                  sub: "Military style — every hour planned, minimal flexibility",
                  selected: "border-red-400 bg-red-50 ring-2 ring-red-200",
                },
                {
                  value: "balanced",
                  label: "Balanced",
                  emoji: "✅",
                  sub: "Structured but adjustable — recommended for most students",
                  selected: "border-green-400 bg-green-50 ring-2 ring-green-200",
                },
                {
                  value: "loose",
                  label: "Loose",
                  emoji: "🌊",
                  sub: "Freedom-based — guidelines, not rigid",
                  selected: "border-purple-400 bg-purple-50 ring-2 ring-purple-200",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPlanStyle(opt.value as "strict" | "balanced" | "loose")}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    planStyle === opt.value
                      ? opt.selected
                      : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
                  }`}
                >
                  <p className="text-base mb-1">{opt.emoji}</p>
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 8 & 9. Hours + Weeks */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">8</span>
                  <label className="text-sm font-semibold text-foreground">Study hours per day</label>
                </div>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Array.from({ length: 13 }, (_, i) => i + 2).map((h) => (
                    <option key={h} value={h}>
                      {h} hours per day
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">9</span>
                  <label className="text-sm font-semibold text-foreground">Number of weeks</label>
                </div>
                <select
                  value={numberOfWeeks}
                  onChange={(e) => setNumberOfWeeks(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      {w} {w === 1 ? "week" : "weeks"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Plan…
                </>
              ) : result ? (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Regenerate Plan
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Generate Study Plan
                </>
              )}
            </button>
            <Link href="/materials">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors">
                <FileText className="h-4 w-4" />
                My Materials
              </span>
            </Link>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function WeeklyTimetable({
  week,
  orderedDays,
}: {
  week: WeekPlan | undefined;
  orderedDays: string[];
}) {
  if (!week) return null;

  const dayMap = new Map<string, StudySession[]>();
  for (const d of week.days) {
    dayMap.set(d.day, d.sessions);
  }

  const activeDays = orderedDays.filter(
    (d) => dayMap.has(d) && (dayMap.get(d)?.length ?? 0) > 0
  );

  if (activeDays.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-12">
        <p className="text-sm text-muted-foreground">No sessions scheduled for this week.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `repeat(${activeDays.length}, minmax(130px, 1fr))` }}
      >
        {/* Day headers */}
        {activeDays.map((day) => (
          <div
            key={day}
            className="border-b border-r border-border bg-muted/50 px-3 py-3 text-center last:border-r-0"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-foreground">{day.slice(0, 3)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{day}</p>
          </div>
        ))}

        {/* Sessions */}
        {activeDays.map((day) => {
          const sessions = dayMap.get(day) ?? [];
          return (
            <div key={day} className="border-r border-border last:border-r-0 p-2 space-y-2 bg-card">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/50 py-6 text-center">
                  <p className="text-[10px] text-muted-foreground/40">Free</p>
                </div>
              ) : (
                sessions.map((session, i) => (
                  <SessionCard key={i} session={session} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: StudySession }) {
  const type = (session.type ?? "study") as SessionType;
  const bg = session.color ?? sessionColor(type);

  return (
    <div
      className="rounded-lg px-2.5 py-2.5 shadow-sm"
      style={{ backgroundColor: bg + "BB", borderLeft: `3px solid ${bg}` }}
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock className="h-2.5 w-2.5 shrink-0 text-foreground/60" />
        <span className="text-[10px] font-semibold text-foreground/70">
          {session.startTime}{session.endTime ? ` – ${session.endTime}` : ""}
        </span>
      </div>
      <p className="text-[11px] font-bold text-foreground leading-tight mb-0.5">{session.subject}</p>
      <p className="text-[10px] text-foreground/70 leading-snug">{session.topic}</p>
      <span className={`mt-1.5 inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${TYPE_BADGE_STYLES[type] ?? ""}`}>
        {TYPE_LABELS[type] ?? type}
      </span>
    </div>
  );
}
