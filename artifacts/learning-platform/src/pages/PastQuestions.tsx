import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  FileText,
  PlayCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Level {
  label: string;
  description: string;
  color: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
}

const LEVELS: Level[] = [
  {
    label: "Level 100",
    description: "First-year foundational courses and introductory modules.",
    color: "text-blue-600",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
  },
  {
    label: "Level 200",
    description: "Second-year core subjects building on Level 100 concepts.",
    color: "text-indigo-600",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-200",
    bgColor: "bg-indigo-50",
  },
  {
    label: "Level 300",
    description: "Third-year intermediate and specialized coursework.",
    color: "text-violet-600",
    iconColor: "text-violet-500",
    borderColor: "border-violet-200",
    bgColor: "bg-violet-50",
  },
  {
    label: "Level 400",
    description: "Fourth-year advanced topics and pre-clinical preparation.",
    color: "text-purple-600",
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
  },
  {
    label: "Level 500",
    description: "Fifth-year clinical and applied professional studies.",
    color: "text-fuchsia-600",
    iconColor: "text-fuchsia-500",
    borderColor: "border-fuchsia-200",
    bgColor: "bg-fuchsia-50",
  },
  {
    label: "Level 600",
    description: "Final year, exit exams, and comprehensive review materials.",
    color: "text-rose-600",
    iconColor: "text-rose-500",
    borderColor: "border-rose-200",
    bgColor: "bg-rose-50",
  },
];

export default function PastQuestions() {
  const [, navigate] = useLocation();
  const [openLevel, setOpenLevel] = useState<string | null>(null);

  const activeLevel = LEVELS.find((l) => l.label === openLevel);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">

        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {openLevel ? (
              <button
                onClick={() => setOpenLevel(null)}
                className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Levels
              </button>
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {openLevel ? openLevel : "Practice Past Questions"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {openLevel
                ? activeLevel?.description
                : "Select a level to browse past examination questions."}
            </p>
          </div>

          <Link href="/dashboard">
            <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
          </Link>
        </div>

        {/* ── BREADCRUMB ─────────────────────────────────── */}
        {openLevel && (
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <button
              onClick={() => setOpenLevel(null)}
              className="hover:text-foreground transition-colors"
            >
              Past Questions
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{openLevel}</span>
          </nav>
        )}

        {/* ── LEVEL FOLDERS (root view) ───────────────────── */}
        {!openLevel && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((level) => (
              <button
                key={level.label}
                onClick={() => setOpenLevel(level.label)}
                className={`
                  group flex flex-col rounded-xl border-2 ${level.borderColor} ${level.bgColor}
                  p-5 text-left shadow-sm transition-all
                  hover:shadow-md hover:scale-[1.02] active:scale-[0.99]
                `}
              >
                {/* Folder icon */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="relative">
                    <Folder
                      className={`h-12 w-12 ${level.iconColor} transition-opacity group-hover:opacity-0 absolute`}
                      strokeWidth={1.5}
                    />
                    <FolderOpen
                      className={`h-12 w-12 ${level.iconColor} opacity-0 transition-opacity group-hover:opacity-100`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 ${level.iconColor} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`}
                  />
                </div>

                {/* Label */}
                <p className={`text-base font-bold ${level.color}`}>{level.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* ── LEVEL CONTENTS (folder open view) ──────────── */}
        {openLevel && activeLevel && openLevel !== "Level 400" && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-8 py-24 text-center shadow-sm">
            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${activeLevel.bgColor}`}>
              <BookOpen className={`h-8 w-8 ${activeLevel.iconColor}`} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className={`h-5 w-5 ${activeLevel.iconColor}`} />
              <h2 className="text-xl font-bold text-foreground">{openLevel}</h2>
            </div>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Past questions for <span className="font-semibold text-foreground">{openLevel}</span> are
              being compiled and will be available soon. Check back regularly — new content is added
              on an ongoing basis.
            </p>
            <button
              onClick={() => setOpenLevel(null)}
              className={`
                mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-2.5
                text-sm font-semibold text-white shadow-sm transition-colors
                bg-purple-500
                hover:opacity-90
              `}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Levels
            </button>
          </div>
        )}

        {/* ── LEVEL 400 CONTENTS ──────────────────────────── */}
        {openLevel === "Level 400" && activeLevel && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a folder to browse past questions.
            </p>

            {/* ENDOCRINE II folder */}
            <button
              onClick={() => navigate("/past-questions/level-400/endocrine-ii")}
              className="group w-full flex items-center justify-between rounded-xl border-2 border-purple-200 bg-purple-50 p-5 text-left transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0">
                  <Folder
                    className="h-12 w-12 text-purple-500 transition-opacity group-hover:opacity-0 absolute"
                    strokeWidth={1.5}
                  />
                  <FolderOpen
                    className="h-12 w-12 text-purple-500 opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-purple-700">ENDOCRINE II</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Past Questions Compilation 2026 · 273 Questions · 7 Sections
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      <FileText className="h-2.5 w-2.5" /> PDF Viewer
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      <PlayCircle className="h-2.5 w-2.5" /> Practice Exam
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
            </button>

            {/* NEUROSCIENCE II folder */}
            <button
              onClick={() => navigate("/past-questions/level-400/neuroscience-ii")}
              className="group w-full flex items-center justify-between rounded-xl border-2 border-teal-200 bg-teal-50 p-5 text-left transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0">
                  <Folder
                    className="h-12 w-12 text-teal-500 transition-opacity group-hover:opacity-0 absolute"
                    strokeWidth={1.5}
                  />
                  <FolderOpen
                    className="h-12 w-12 text-teal-500 opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-teal-700">NEUROSCIENCE II</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Past Questions Compilation 2026 · 364 Questions · 8 Sections
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                      <FileText className="h-2.5 w-2.5" /> Browse Questions
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                      <PlayCircle className="h-2.5 w-2.5" /> Practice Exam
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
            </button>

            {/* CARDIOVASCULAR II folder */}
            <button
              onClick={() => navigate("/past-questions/level-400/cardiovascular-ii")}
              className="group w-full flex items-center justify-between rounded-xl border-2 border-red-200 bg-red-50 p-5 text-left transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0">
                  <Folder
                    className="h-12 w-12 text-red-500 transition-opacity group-hover:opacity-0 absolute"
                    strokeWidth={1.5}
                  />
                  <FolderOpen
                    className="h-12 w-12 text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-red-700">CARDIOVASCULAR II</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Past Questions Compilation 2026 · 244 Questions · 6 Sections
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      <FileText className="h-2.5 w-2.5" /> Browse Questions
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      <PlayCircle className="h-2.5 w-2.5" /> Practice Exam
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-red-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0" />
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
