import { useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  Users,
  Download,
  Trophy,
  LayoutDashboard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

interface Participant {
  attemptId: number;
  score: string;
  totalQuestions: number;
  createdAt: string;
  userName: string;
  studentId: string;
}


export default function GroupResults() {
  const search = useSearch();
  const code = new URLSearchParams(search).get("code") ?? "";

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [examId, setExamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) {
      setError("No exam code provided.");
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setError("You must be logged in to view results.");
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.BASE_URL}api/exam-share/${code}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load results.");
        return res.json();
      })
      .then((data: { examId: number; results: Participant[] }) => {
        setExamId(data.examId);
        const sorted = [...data.results].sort((a, b) =>
          a.studentId.localeCompare(b.studentId, undefined, { numeric: true, sensitivity: "base" })
        );
        setParticipants(sorted);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  function handleDownloadPdf() {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const rows = participants
      .map(
        (p, i) => `
        <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#fff"}">
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;">${p.userName}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${p.studentId}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${Math.round(parseFloat(p.score) / 100 * p.totalQuestions)}/${p.totalQuestions} (${Math.round(parseFloat(p.score))}%)</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${new Date(p.createdAt).toLocaleDateString()}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Group Exam Results — Code: ${code}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
            p.sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th { background: #f3f4f6; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
            th:nth-child(4), th:nth-child(5) { text-align: center; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Group Exam Results</h1>
          <p class="sub">Exam Code: <strong>${code}</strong> &nbsp;|&nbsp; ${participants.length} participant${participants.length !== 1 ? "s" : ""} &nbsp;|&nbsp; Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Student ID</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link href="/results">
            <span className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer">
              Back to Results
            </span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8" ref={printRef}>

        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Group Results</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Exam Code: <span className="font-semibold text-foreground tracking-widest">{code}</span>
              {examId && <span className="ml-2 text-muted-foreground/60">· Exam #{examId}</span>}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {participants.length} participant{participants.length !== 1 ? "s" : ""} attempted this exam
            </p>
          </div>

          <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">No results yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No one has submitted this exam yet. Share the code and check back after everyone has attempted it.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">All Participants</span>
              <span className="ml-auto text-xs text-muted-foreground">Sorted by Student ID</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">#</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Full Name</th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Student ID</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Score</th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr
                      key={p.attemptId}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-muted-foreground font-medium">
                        {i + 1}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-foreground">
                        {p.userName}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground font-medium">
                        {p.studentId}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {(() => {
                          const pct = Math.round(parseFloat(p.score));
                          const correct = Math.round(parseFloat(p.score) / 100 * p.totalQuestions);
                          const colorClass = pct >= 75 ? "text-green-600 dark:text-green-400" : pct >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500";
                          return (
                            <span className={`text-sm font-bold ${colorClass}`}>
                              {correct}/{p.totalQuestions}{" "}
                              <span className="font-normal opacity-70">({pct}%)</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACTIONS ──────────────────────────────────────── */}
        <div className="mt-6 flex gap-3">
          <Link href="/results">
            <span className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Back to My Results
            </span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
