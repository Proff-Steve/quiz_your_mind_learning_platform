import { useQuery } from "@tanstack/react-query";
import { ClockIcon, Trophy, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

interface HistoryEntry {
  id: number;
  examId: number | null;
  examTitle: string;
  totalQuestions: number;
  score: string;
  createdAt: string;
}

function getScoreComment(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: "Outstanding!", color: "text-green-500" };
  if (pct >= 75) return { label: "Congratulations!", color: "text-blue-500" };
  if (pct >= 60) return { label: "Good Effort!", color: "text-yellow-500" };
  if (pct >= 50) return { label: "Keep Trying!", color: "text-orange-500" };
  return { label: "Needs Review", color: "text-red-500" };
}

function scoreColor(pct: number): string {
  if (pct >= 75) return "text-green-500";
  if (pct >= 50) return "text-yellow-500";
  return "text-red-500";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

async function fetchHistory(): Promise<HistoryEntry[]> {
  const token = getToken();
  const res = await fetch(`${import.meta.env.BASE_URL}api/user/history`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load history");
  const data = await res.json() as { history: HistoryEntry[] };
  return data.history;
}

export default function History() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam-history"],
    queryFn: fetchHistory,
  });

  const entries = data ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Exam History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A record of all exams you have completed.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not load history. Please try again later.
          </div>
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-foreground">No exams yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your first exam to see your history here.
            </p>
          </div>
        )}

        {!isLoading && !isError && entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => {
              const pct = parseFloat(entry.score);
              const { label, color } = getScoreComment(pct);
              return (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.examTitle || "Untitled Exam"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                      </span>
                      {entry.totalQuestions > 0 && (
                        <span>{entry.totalQuestions} questions</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className={`text-xl font-bold tabular-nums ${scoreColor(pct)}`}>
                        {pct.toFixed(1)}%
                      </p>
                      <p className={`text-xs font-medium ${color}`}>{label}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
