import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Stethoscope,
  ChevronLeft,
  Send,
  Trophy,
  Loader2,
  Clock,
  Users,
  Lock,
  BookOpen,
  Star,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import { UsernameModal } from "@/components/UsernameModal";

interface CaseQuestion {
  id: number;
  questionText: string;
  orderIndex: number;
}

interface CaseData {
  id: number;
  title: string;
  caseContent: string;
  imageData: string | null;
  postedAt: string;
  revealResultsAt: string;
  caseDate: string;
}

interface SubmitResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  rationale: string;
  marks: number;
  maxMarks: number;
  grade: string;
  feedback: string;
}

interface LeaderboardEntry {
  name: string;
  score: string;
}

function formatRevealTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRevealDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function ClinicalCase() {
  const { user, loading, refetch } = useAuth();
  const [, navigate] = useLocation();

  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [questions, setQuestions] = useState<CaseQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [results, setResults] = useState<SubmitResult[] | null>(null);
  const [score, setScore] = useState<string | null>(null);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [totalPossible, setTotalPossible] = useState<number>(0);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [noCase, setNoCase] = useState(false);

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardAvailable, setLeaderboardAvailable] = useState(false);
  const [revealAt, setRevealAt] = useState<string | null>(null);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !user.username) {
      setShowUsernameModal(true);
    }
  }, [loading, user]);

  const loadToday = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setFetchLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/case/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as {
        case: CaseData | null;
        questions?: CaseQuestion[];
        hasAttempted?: boolean;
        attempt?: {
          score: string;
          submittedAt: string;
          results: SubmitResult[];
        };
      };

      if (!data.case) {
        setNoCase(true);
        return;
      }

      setCaseData(data.case);
      setQuestions(data.questions ?? []);
      setAnswers(Array(data.questions?.length ?? 0).fill(""));
      setHasAttempted(data.hasAttempted ?? false);
      setRevealAt(data.case.revealResultsAt);

      const revealTime = new Date(data.case.revealResultsAt);
      setLeaderboardAvailable(new Date() >= revealTime);

      if (data.hasAttempted && data.attempt) {
        setResults(data.attempt.results);
        setScore(data.attempt.score);
        const earned = data.attempt.results.reduce((s, r) => s + (r.marks ?? 0), 0);
        setTotalMarks(earned);
        setTotalPossible(data.attempt.results.length * 5);
      }
    } catch {
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadToday();
  }, [user, loadToday]);

  useEffect(() => {
    if (revealAt) {
      setLeaderboardAvailable(now >= new Date(revealAt));
    }
  }, [now, revealAt]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caseData) return;

    const emptyIdx = answers.findIndex((a) => !a.trim());
    if (emptyIdx !== -1) {
      setSubmitError(`Please answer question ${emptyIdx + 1} before submitting.`);
      return;
    }

    const deadline = new Date(caseData.revealResultsAt);
    if (new Date() >= deadline) {
      setSubmitError("Submission deadline passed. Results are being revealed.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/case/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caseId: caseData.id, answers }),
      });
      const data = await res.json() as {
        score?: string;
        totalMarks?: number;
        totalPossible?: number;
        results?: SubmitResult[];
        error?: string;
      };
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to submit.");
        return;
      }
      setScore(data.score ?? "0");
      setTotalMarks(data.totalMarks ?? 0);
      setTotalPossible(data.totalPossible ?? 0);
      setResults(data.results ?? []);
      setHasAttempted(true);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function openLeaderboard() {
    if (!caseData || !leaderboardAvailable) return;
    setLeaderboardOpen(true);
    if (leaderboard !== null) return;
    setLeaderboardLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/case/results/${caseData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as {
        available?: boolean;
        results?: LeaderboardEntry[];
        revealAt?: string;
      };
      if (data.available) {
        setLeaderboard(data.results ?? []);
      }
    } catch {
    } finally {
      setLeaderboardLoading(false);
    }
  }

  const preventCopy = (e: React.ClipboardEvent) => e.preventDefault();
  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();

  if (loading || fetchLoading) {
    return (
      <>
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
      {showUsernameModal && (
        <UsernameModal
          required
          onSuccess={() => { setShowUsernameModal(false); refetch(); }}
          onDismiss={() => navigate("/dashboard")}
        />
      )}
      </>
    );
  }

  if (!user) return null;

  if (noCase) {
    return (
      <>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h2 className="text-lg font-bold text-foreground">No Case Today</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              There is no clinical case scheduled for today. Check back tomorrow!
            </p>
          </div>
        </div>
      </DashboardLayout>
      {showUsernameModal && (
        <UsernameModal
          required
          onSuccess={() => { setShowUsernameModal(false); refetch(); }}
          onDismiss={() => navigate("/dashboard")}
        />
      )}
      </>
    );
  }

  if (!caseData) return null;

  const deadlinePassed = new Date() >= new Date(caseData.revealResultsAt);

  return (
    <>
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Clinical Case of the Day</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                {caseData.caseDate}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Results reveal at {formatRevealTime(caseData.revealResultsAt)} · {formatRevealDate(caseData.revealResultsAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Case Content — copy/paste/right-click disabled */}
        <div
          className="mb-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          onCopy={preventCopy}
          onCut={preventCopy}
          onContextMenu={preventContextMenu}
          style={{ userSelect: "none" }}
        >
          {caseData.imageData && (
            <div className="border-b border-border bg-muted/20">
              <img
                src={caseData.imageData}
                alt="Clinical case image"
                className="w-full max-h-72 object-contain"
                draggable={false}
              />
            </div>
          )}
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">{caseData.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {caseData.caseContent}
            </p>
          </div>
        </div>

        {/* Questions */}
        {results ? (
          <div className="space-y-6">
            {/* Score banner */}
            {(() => {
              const pct = parseFloat(score ?? "0");
              const color = pct >= 75 ? "success" : pct >= 50 ? "amber" : "destructive";
              return (
                <div className={`rounded-xl border p-5 shadow-sm ${
                  color === "success" ? "border-success/30 bg-success/5"
                  : color === "amber" ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/30"
                  : "border-destructive/30 bg-destructive/5"
                }`}>
                  <div className="flex items-center gap-4">
                    <Trophy className={`h-8 w-8 shrink-0 ${
                      color === "success" ? "text-success" : color === "amber" ? "text-amber-500" : "text-destructive"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Score</p>
                      <p className={`text-3xl font-bold tabular-nums ${
                        color === "success" ? "text-success" : color === "amber" ? "text-amber-500" : "text-destructive"
                      }`}>
                        {pct.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {totalMarks.toFixed(1)} / {totalPossible} marks — AI semantic scoring
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Per-question results */}
            {results.map((r, i) => {
              const pct = r.maxMarks > 0 ? (r.marks / r.maxMarks) * 100 : 0;
              const gradeColor =
                pct >= 80 ? "text-success" :
                pct >= 60 ? "text-amber-500" :
                pct >= 40 ? "text-orange-500" :
                "text-destructive";
              const borderBg =
                pct >= 80 ? "border-success/20 bg-success/5" :
                pct >= 60 ? "border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-700/30" :
                pct >= 40 ? "border-orange-200/50 bg-orange-50/50 dark:bg-orange-950/10 dark:border-orange-700/30" :
                "border-destructive/20 bg-destructive/5";

              return (
                <div key={r.questionId} className={`rounded-xl border p-5 shadow-sm ${borderBg}`}>
                  {/* Question header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      {r.questionText}
                    </p>
                    {/* Marks badge */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 ${
                        pct >= 80 ? "border-success/30 bg-success/10" :
                        pct >= 60 ? "border-amber-300/50 bg-amber-100/50 dark:bg-amber-900/20" :
                        pct >= 40 ? "border-orange-300/50 bg-orange-100/50 dark:bg-orange-900/20" :
                        "border-destructive/30 bg-destructive/10"
                      }`}>
                        <Star className={`h-3.5 w-3.5 ${gradeColor}`} />
                        <span className={`text-base font-bold tabular-nums ${gradeColor}`}>
                          {r.marks % 1 === 0 ? r.marks : r.marks.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">/{r.maxMarks}</span>
                      </div>
                      <span className={`mt-1 text-xs font-semibold ${gradeColor}`}>{r.grade}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {/* Your answer */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Your Answer</p>
                      <p className={`text-sm leading-relaxed ${pct >= 60 ? "text-success" : pct >= 40 ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`}>
                        {r.userAnswer || <span className="italic text-muted-foreground">No answer provided</span>}
                      </p>
                    </div>

                    {/* Correct answer */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Correct Answer</p>
                      <p className="text-sm leading-relaxed text-success font-medium">{r.correctAnswer}</p>
                    </div>

                    {/* AI Feedback */}
                    {r.feedback && (
                      <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI Feedback</p>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground">{r.feedback}</p>
                      </div>
                    )}

                    {/* Rationale */}
                    <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Rationale</p>
                      <p className="text-xs leading-relaxed text-foreground">{r.rationale}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show Results List button */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Show Results List</p>
                    {!leaderboardAvailable && revealAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Available after {formatRevealTime(revealAt)} · {formatRevealDate(revealAt)}
                      </p>
                    )}
                    {leaderboardAvailable && (
                      <p className="text-xs text-muted-foreground mt-0.5">Leaderboard is now available</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={openLeaderboard}
                  disabled={!leaderboardAvailable}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    leaderboardAvailable
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  }`}
                  title={!leaderboardAvailable && revealAt ? `Available after ${formatRevealTime(revealAt)}` : undefined}
                >
                  {!leaderboardAvailable && <Lock className="h-3.5 w-3.5" />}
                  <Users className="h-3.5 w-3.5" />
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {deadlinePassed && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
                Submission deadline has passed. This case is now closed.
              </div>
            )}

            {questions.map((q, i) => (
              <div
                key={q.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
                onContextMenu={preventContextMenu}
              >
                <p className="mb-3 text-sm font-semibold text-foreground">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  {q.questionText}
                </p>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={preventCopy}
                  placeholder="Type your answer here (typing only — no paste allowed)…"
                  rows={3}
                  disabled={deadlinePassed}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            {submitError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            {!deadlinePassed && (
              <button
                type="submit"
                disabled={submitLoading || answers.some((a) => !a.trim())}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Scoring with AI…</>
                  : <><Send className="h-4 w-4" /> Submit Answers</>
                }
              </button>
            )}
          </form>
        )}
      </div>

      {/* Leaderboard Modal */}
      {leaderboardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setLeaderboardOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <h2 className="text-base font-bold text-foreground">Results Leaderboard</h2>
              </div>
              <button
                onClick={() => setLeaderboardOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
              >
                ×
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto px-5 py-4">
              {leaderboardLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : !leaderboard || leaderboard.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                  <Users className="mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">No submissions yet</p>
                </div>
              ) : (
                <ol className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                        idx === 0 ? "bg-accent/10 border border-accent/20" : "bg-muted/40"
                      }`}
                    >
                      <span className={`shrink-0 w-6 text-center text-sm font-bold ${
                        idx === 0 ? "text-accent" : idx === 1 ? "text-muted-foreground" : "text-muted-foreground/60"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-semibold text-foreground">{entry.name}</span>
                      <span className={`shrink-0 text-sm font-bold tabular-nums ${
                        parseFloat(entry.score) >= 75 ? "text-success" : parseFloat(entry.score) >= 50 ? "text-amber-500" : "text-destructive"
                      }`}>
                        {parseFloat(entry.score).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>

    {showUsernameModal && (
      <UsernameModal
        required
        onSuccess={() => {
          setShowUsernameModal(false);
          refetch();
        }}
        onDismiss={() => navigate("/dashboard")}
      />
    )}
    </>
  );
}
