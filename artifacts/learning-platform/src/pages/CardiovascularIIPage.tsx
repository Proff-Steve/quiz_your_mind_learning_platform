import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  BookOpen,
  PlayCircle,
  ChevronRight,
  Search,
  X,
  Clock,
  Hash,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ALL_CARDIOVASCULAR2_QUESTIONS,
  CARDIOVASCULAR2_SECTIONS,
  type PQQuestion,
} from "@/data/cardiovascular2";

const TOTAL = ALL_CARDIOVASCULAR2_QUESTIONS.length;

const SECTION_COLORS: Record<string, { text: string; bg: string; badge: string }> = {
  "Internal Medicine":   { text: "text-blue-700",    bg: "bg-blue-50",    badge: "bg-blue-100 text-blue-700" },
  "Pharmacology":        { text: "text-rose-700",    bg: "bg-rose-50",    badge: "bg-rose-100 text-rose-700" },
  "Pathology":           { text: "text-purple-700",  bg: "bg-purple-50",  badge: "bg-purple-100 text-purple-700" },
  "Chemical Pathology":  { text: "text-fuchsia-700", bg: "bg-fuchsia-50", badge: "bg-fuchsia-100 text-fuchsia-700" },
  "Surgery":             { text: "text-violet-700",  bg: "bg-violet-50",  badge: "bg-violet-100 text-violet-700" },
  "Anatomy & Radiology": { text: "text-orange-700",  bg: "bg-orange-50",  badge: "bg-orange-100 text-orange-700" },
};

type View = "overview" | "browse" | "practice-config";

interface PracticeConfig {
  count: number;
  minutes: number;
  section: string;
}

export default function CardiovascularIIPage() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<View>("overview");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig>({
    count: 20,
    minutes: 30,
    section: "All Sections",
  });

  const filteredQuestions = useMemo(() => {
    let qs = ALL_CARDIOVASCULAR2_QUESTIONS;
    if (activeSection) qs = qs.filter((q) => q.section === activeSection);
    if (search.trim()) {
      const lower = search.toLowerCase();
      qs = qs.filter(
        (q) =>
          q.text.toLowerCase().includes(lower) ||
          q.options.some((o) => o.text.toLowerCase().includes(lower))
      );
    }
    return qs;
  }, [activeSection, search]);

  const maxCount = useMemo(() => {
    if (practiceConfig.section === "All Sections") return TOTAL;
    const sec = CARDIOVASCULAR2_SECTIONS.find((s) => s.name === practiceConfig.section);
    return sec?.count ?? TOTAL;
  }, [practiceConfig.section]);

  function startPractice() {
    const pool =
      practiceConfig.section === "All Sections"
        ? ALL_CARDIOVASCULAR2_QUESTIONS
        : ALL_CARDIOVASCULAR2_QUESTIONS.filter(
            (q) => q.section === practiceConfig.section
          );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, practiceConfig.count);
    localStorage.setItem("qym_cv2_questions", JSON.stringify(selected));
    localStorage.setItem("qym_cv2_minutes", String(practiceConfig.minutes));
    navigate("/past-questions/level-400/cardiovascular-ii/practice");
  }

  if (view === "practice-config") {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <button
            onClick={() => setView("overview")}
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <PlayCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Configure Practice Exam</h2>
                <p className="text-sm text-muted-foreground">CARDIOVASCULAR II — {TOTAL} Questions</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Section
                </label>
                <select
                  value={practiceConfig.section}
                  onChange={(e) => {
                    const sec = e.target.value;
                    const cap =
                      sec === "All Sections"
                        ? TOTAL
                        : (CARDIOVASCULAR2_SECTIONS.find((s) => s.name === sec)?.count ?? TOTAL);
                    setPracticeConfig((p) => ({
                      ...p,
                      section: sec,
                      count: Math.min(p.count, cap),
                    }));
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All Sections">All Sections ({TOTAL} questions)</option>
                  {CARDIOVASCULAR2_SECTIONS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.count} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Number of Questions{" "}
                  <span className="font-normal text-muted-foreground">
                    (max {maxCount})
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={maxCount}
                    value={practiceConfig.count}
                    onChange={(e) =>
                      setPracticeConfig((p) => ({ ...p, count: Number(e.target.value) }))
                    }
                    className="flex-1 accent-red-600"
                  />
                  <div className="flex w-20 items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min={1}
                      max={maxCount}
                      value={practiceConfig.count}
                      onChange={(e) => {
                        const v = Math.min(maxCount, Math.max(1, Number(e.target.value)));
                        setPracticeConfig((p) => ({ ...p, count: v }));
                      }}
                      className="w-full bg-transparent text-sm font-bold text-foreground focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-1.5 flex gap-2">
                  {[10, 20, 40, maxCount].filter((v, i, a) => a.indexOf(v) === i && v <= maxCount).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPracticeConfig((p) => ({ ...p, count: n }))}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                        practiceConfig.count === n
                          ? "bg-red-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {n === maxCount ? "All" : n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Time Limit
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60, 90, 120, 180].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPracticeConfig((p) => ({ ...p, minutes: m }))}
                      className={`flex flex-col items-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                        practiceConfig.minutes === m
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-border bg-card text-muted-foreground hover:border-red-300"
                      }`}
                    >
                      <Clock className="mb-0.5 h-3.5 w-3.5" />
                      {m < 60 ? `${m}m` : `${m / 60}h`}
                    </button>
                  ))}
                  <button
                    onClick={() => setPracticeConfig((p) => ({ ...p, minutes: 0 }))}
                    className={`flex flex-col items-center rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                      practiceConfig.minutes === 0
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-border bg-card text-muted-foreground hover:border-red-300"
                    }`}
                  >
                    <Clock className="mb-0.5 h-3.5 w-3.5" />
                    No limit
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Summary</p>
                <p className="mt-1">
                  <span className="font-medium text-foreground">{practiceConfig.count}</span> questions from{" "}
                  <span className="font-medium text-foreground">{practiceConfig.section}</span>
                  {practiceConfig.minutes > 0 ? (
                    <>
                      {" "}• <span className="font-medium text-foreground">{practiceConfig.minutes} minutes</span> time limit
                    </>
                  ) : (
                    <> • No time limit</>
                  )}
                </p>
              </div>

              <button
                onClick={startPractice}
                className="w-full rounded-xl bg-red-600 py-3 text-base font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Start Practice Exam
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (view === "browse") {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                onClick={() => {
                  setActiveSection(null);
                  setSearch("");
                  setView("overview");
                }}
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Overview
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                {activeSection ?? "All Questions"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} — correct answers highlighted in yellow
              </p>
            </div>
            <button
              onClick={() => setView("practice-config")}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <PlayCircle className="h-4 w-4" />
              Practice Exam
            </button>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={activeSection ?? ""}
              onChange={(e) => setActiveSection(e.target.value || null)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Sections</option>
              {CARDIOVASCULAR2_SECTIONS.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-5">
            {filteredQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
            {filteredQuestions.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                No questions match your search.
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/past-questions")}
            className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Past Questions
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Level 400</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-foreground">CARDIOVASCULAR II</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">CARDIOVASCULAR II</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Past Questions Compilation 2026 · {TOTAL} Questions · {CARDIOVASCULAR2_SECTIONS.length} Sections
              </p>
            </div>
            <button
              onClick={() => setView("practice-config")}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              <PlayCircle className="h-5 w-5" />
              Practice Exam
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Questions", value: String(TOTAL) },
            { label: "Sections", value: String(CARDIOVASCULAR2_SECTIONS.length) },
            { label: "Correct answers shown", value: "Yes" },
            { label: "Level", value: "400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-base font-semibold text-foreground">Browse by Section</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CARDIOVASCULAR2_SECTIONS.map((sec) => (
              <button
                key={sec.name}
                onClick={() => {
                  setActiveSection(sec.name);
                  setView("browse");
                }}
                className={`group flex items-center justify-between rounded-xl border ${sec.border} ${sec.bg} p-4 text-left transition-all hover:shadow-md hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                    <BookOpen className={`h-4 w-4 ${sec.color}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${sec.color}`}>{sec.name}</p>
                    <p className="text-xs text-muted-foreground">{sec.count} questions</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${sec.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`} />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setActiveSection(null);
            setView("browse");
          }}
          className="w-full rounded-xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
        >
          Browse All {TOTAL} Questions
        </button>
      </div>
    </DashboardLayout>
  );
}

function QuestionCard({ question }: { question: PQQuestion }) {
  const col = SECTION_COLORS[question.section];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${col?.badge ?? "bg-gray-100 text-gray-700"}`}
        >
          {question.section} · Q{question.number}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-foreground">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isCorrect = opt.label === question.correct;
          return (
            <div
              key={opt.label}
              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isCorrect
                  ? "bg-yellow-100 ring-1 ring-yellow-400"
                  : "bg-muted/40"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCorrect
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`leading-relaxed ${
                  isCorrect ? "font-semibold text-yellow-900" : "text-muted-foreground"
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
}
