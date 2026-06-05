import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  ChevronLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Users,
  Lock,
  AlertTriangle,
  ChevronRight,
  Timer,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import { UsernameModal } from "@/components/UsernameModal";

type McqType = "pre_clinical" | "clinical";

interface CardInfo {
  id: number;
  timeLimitMinutes: number;
  totalQuestions: number;
  revealResultsAt: string;
  completed: boolean;
}

interface TodayCards {
  preClinical: CardInfo | null;
  clinical: CardInfo | null;
  leaderboardAvailable: boolean;
  revealAt: string | null;
  userAttemptedAny: boolean;
}

interface McqQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  orderIndex: number;
}

interface McqSetInfo {
  id: number;
  type: McqType;
  timeLimitMinutes: number;
  totalQuestions: number;
  revealResultsAt: string;
  setDate: string;
}

interface SubmitResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  rationale: string;
  isCorrect: boolean;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface AttemptData {
  id: number;
  score: number;
  scorePercentage: string;
  timeTakenSeconds: number | null;
  submittedAt: string | null;
  includedInLeaderboard: boolean;
  results: SubmitResult[];
}

interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
  scorePercentage: string;
  timeTakenSeconds: number | null;
  boughtPosition?: boolean;
}

interface PurchasedPosition {
  position: number;
  userId: number;
  name: string;
  amountPaid: string;
  currency: string;
}

type ViewMode = "cards" | "quiz" | "results";

function formatRevealTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRevealDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

function Countdown({ targetIso }: { targetIso: string }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    function calc() {
      const ms = new Date(targetIso).getTime() - Date.now();
      setDiff(Math.max(0, Math.floor(ms / 1000)));
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetIso]);

  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return (
    <span className="tabular-nums font-mono">
      {h > 0 ? `${h}h ` : ""}{m}m {s.toString().padStart(2, "0")}s
    </span>
  );
}

export default function McqOfTheDay() {
  const { user, loading, refetch } = useAuth();
  const [, navigate] = useLocation();

  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const [view, setView] = useState<ViewMode>("cards");
  const [cards, setCards] = useState<TodayCards | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<McqType | null>(null);

  const [set, setSet] = useState<McqSetInfo | null>(null);
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{
    available: boolean;
    revealAt: string | null;
    userId?: number;
    virtualBalance?: string;
    planCurrency?: string;
    canBuyPositions?: boolean;
    rewardsDistributed?: boolean;
    preClinical: { setId: number; entries: LeaderboardEntry[]; purchasedPositions: PurchasedPosition[]; userAttempted: boolean } | null;
    clinical: { setId: number; entries: LeaderboardEntry[]; purchasedPositions: PurchasedPosition[]; userAttempted: boolean } | null;
  } | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<McqType>("pre_clinical");

  const [buyPositionLoading, setBuyPositionLoading] = useState(false);
  const [buyPositionError, setBuyPositionError] = useState<string | null>(null);
  const [buyPositionSuccess, setBuyPositionSuccess] = useState<string | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const leaderboardAvailable = cards?.revealAt ? now >= new Date(cards.revealAt) : false;

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && !user.username) {
      setShowUsernameModal(true);
    }
  }, [loading, user]);

  const loadCards = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setCardsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mcq/today/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as TodayCards;
      setCards(data);
    } catch {
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadCards();
  }, [user, loadCards]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function selectCard(type: McqType) {
    setSelectedType(type);
    setQuizError(null);
    setQuizLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mcq/today/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as {
        set: McqSetInfo | null;
        questions: McqQuestion[];
        hasAttempted: boolean;
        attempt: AttemptData | null;
        error?: string;
      };

      if (!res.ok) {
        setQuizError(data.error ?? "Could not load questions.");
        setQuizLoading(false);
        return;
      }

      if (!data.set) {
        setQuizError("No MCQ set available for this track today.");
        setQuizLoading(false);
        return;
      }

      setSet(data.set);
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
      setHasAttempted(data.hasAttempted);
      setAttempt(data.attempt);
      setCurrentQ(0);

      if (!data.hasAttempted) {
        const secs = data.set.timeLimitMinutes * 60;
        setTimeRemaining(secs);
        setTimerActive(false);
      }

      setView("quiz");
    } catch {
      setQuizError("Network error. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  function startTimer() {
    if (timerActive) return;
    setTimerActive(true);
    setStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function autoSubmit() {
    setTimerActive(false);
    await doSubmit(true);
  }

  async function doSubmit(autoSubmitted = false) {
    if (!set) return;
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
    setSubmitLoading(true);
    setSubmitError(null);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mcq/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mcqSetId: set.id, answers, timeTakenSeconds: elapsed }),
      });
      const data = (await res.json()) as {
        attemptId?: number;
        score?: number;
        total?: number;
        scorePercentage?: string;
        includedInLeaderboard?: boolean;
        revealResultsAt?: string;
        results?: SubmitResult[];
        error?: string;
      };

      if (!res.ok) {
        if (!autoSubmitted) setSubmitError(data.error ?? "Submission failed.");
        return;
      }

      setAttempt({
        id: data.attemptId!,
        score: data.score!,
        scorePercentage: data.scorePercentage!,
        timeTakenSeconds: elapsed,
        submittedAt: new Date().toISOString(),
        includedInLeaderboard: data.includedInLeaderboard!,
        results: data.results!,
      });
      setHasAttempted(true);
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setView("results");
      await loadCards();
    } catch {
      if (!autoSubmitted) setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  function handleAnswerSelect(answer: string) {
    const next = [...answers];
    next[currentQ] = answer;
    setAnswers(next);
    if (!timerActive && !hasAttempted) startTimer();
  }

  async function openLeaderboard(forceRefresh = false) {
    setLeaderboardOpen(true);
    setBuyPositionError(null);
    setBuyPositionSuccess(null);
    if (leaderboard !== null && !forceRefresh) return;
    setLeaderboardLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mcq/leaderboard/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as {
        available: boolean;
        revealAt: string | null;
        userId?: number;
        virtualBalance?: string;
        planCurrency?: string;
        canBuyPositions?: boolean;
        rewardsDistributed?: boolean;
        preClinical: { setId: number; entries: LeaderboardEntry[]; purchasedPositions: PurchasedPosition[]; userAttempted: boolean } | null;
        clinical: { setId: number; entries: LeaderboardEntry[]; purchasedPositions: PurchasedPosition[]; userAttempted: boolean } | null;
      };
      setLeaderboard(data);
      if (data?.clinical && selectedType !== "pre_clinical") {
        setLeaderboardTab("clinical");
      }
    } catch {
    } finally {
      setLeaderboardLoading(false);
    }
  }

  const formatTimerDisplay = () => {
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || cardsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <>
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => {
            if (view === "quiz" && !hasAttempted) {
              if (!confirm("Leave quiz? Your progress will be lost.")) return;
            }
            if (view !== "cards") {
              setView("cards");
              setSelectedType(null);
            } else {
              navigate("/dashboard");
            }
          }}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {view === "cards" ? "Back to Dashboard" : "Back to Card Selection"}
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">MCQs of The Day</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {view === "cards"
                ? "Choose your track — Pre-Clinical or Clinical. Only one attempt allowed per day."
                : view === "quiz"
                ? selectedType === "pre_clinical" ? "Pre-Clinical MCQ Set · 10 Questions · 8 Minutes" : "Clinical MCQ Set · 10 Questions · 8 Minutes"
                : "Your Results"}
            </p>
          </div>
        </div>

        {/* ===== CARD SELECTION VIEW ===== */}
        {view === "cards" && (
          <div className="space-y-4">
            {quizError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {quizError}
              </div>
            )}

            {!cards?.preClinical && !cards?.clinical ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h2 className="text-lg font-bold text-foreground">No Quiz Available Today</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The admin hasn't posted any MCQ sets for today yet. Check back later!
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CardButton
                    type="pre_clinical"
                    card={cards?.preClinical ?? null}
                    onSelect={selectCard}
                    loading={quizLoading && selectedType === "pre_clinical"}
                    lockedReason={cards?.clinical && cards.userAttemptedAny && !cards.preClinical?.completed && cards.clinical.completed
                      ? "You attempted Clinical today"
                      : undefined}
                  />
                  <CardButton
                    type="clinical"
                    card={cards?.clinical ?? null}
                    onSelect={selectCard}
                    loading={quizLoading && selectedType === "clinical"}
                    lockedReason={cards?.preClinical && cards.userAttemptedAny && !cards.clinical?.completed && cards.preClinical.completed
                      ? "You attempted Pre-Clinical today"
                      : undefined}
                  />
                </div>

                {cards?.revealAt && (
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Leaderboard</p>
                          {leaderboardAvailable ? (
                            <p className="text-xs text-muted-foreground">Results are now available</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Available in{" "}
                              <Countdown targetIso={cards.revealAt} /> · {formatRevealTime(cards.revealAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openLeaderboard()}
                        disabled={!leaderboardAvailable}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                          leaderboardAvailable
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        }`}
                        title={!leaderboardAvailable && cards.revealAt ? `Available at ${formatRevealTime(cards.revealAt)}` : undefined}
                      >
                        {!leaderboardAvailable && <Lock className="h-3.5 w-3.5" />}
                        <Trophy className="h-3.5 w-3.5" />
                        Show Results List
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== QUIZ VIEW ===== */}
        {view === "quiz" && set && (
          <div className="space-y-5">
            {hasAttempted && attempt ? (
              <ResultsSummary
                attempt={attempt}
                set={set}
                leaderboardAvailable={leaderboardAvailable}
                onOpenLeaderboard={openLeaderboard}
              />
            ) : (
              <>
                {/* Timer + Progress bar */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Timer className={`h-4 w-4 ${timeRemaining < 60 && timerActive ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-bold tabular-nums ${timeRemaining < 60 && timerActive ? "text-destructive" : "text-foreground"}`}>
                        {formatTimerDisplay()}
                      </span>
                      {!timerActive && (
                        <span className="text-xs text-muted-foreground">(starts on first answer)</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {answers.filter(Boolean).length} / {questions.length} answered
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {questions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        className={`h-7 w-7 rounded-md text-xs font-bold transition-colors ${
                          i === currentQ
                            ? "bg-primary text-primary-foreground"
                            : answers[i]
                            ? "bg-success/20 text-success border border-success/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current question */}
                {questions[currentQ] && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {currentQ + 1}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">of {questions.length}</span>
                    </div>
                    <p className="mb-5 text-sm font-semibold text-foreground leading-relaxed">
                      {questions[currentQ].questionText}
                    </p>
                    <div className="space-y-2.5">
                      {(["A", "B", "C", "D"] as const).map((letter) => {
                        const optKey = `option${letter}` as "optionA" | "optionB" | "optionC" | "optionD";
                        const optText = questions[currentQ][optKey];
                        const selected = answers[currentQ] === letter;
                        return (
                          <button
                            key={letter}
                            onClick={() => handleAnswerSelect(letter)}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                              selected
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <span className={`mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                              selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {letter}
                            </span>
                            {optText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                    disabled={currentQ === 0}
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
                  >
                    ← Previous
                  </button>
                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQ((p) => p + 1)}
                      className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => doSubmit()}
                      disabled={submitLoading || answers.some((a) => !a)}
                      className="flex-1 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitLoading ? <><Loader2 className="inline h-4 w-4 animate-spin mr-2" />Submitting…</> : "Submit Answers"}
                    </button>
                  )}
                </div>

                {answers.some((a) => !a) && currentQ === questions.length - 1 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {answers.filter((a) => !a).length} question(s) unanswered. You must answer all before submitting.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== RESULTS VIEW ===== */}
        {view === "results" && attempt && set && (
          <div className="space-y-5">
            <ResultsSummary
              attempt={attempt}
              set={set}
              leaderboardAvailable={leaderboardAvailable}
              onOpenLeaderboard={openLeaderboard}
            />

            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground">Question Review</h2>
              {attempt.results.map((r, i) => (
                <div
                  key={r.questionId}
                  className={`rounded-xl border p-5 shadow-sm ${r.isCorrect ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"}`}
                >
                  <div className="mb-3 flex items-start gap-2">
                    {r.isCorrect
                      ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
                    <p className="text-sm font-semibold text-foreground">
                      Q{i + 1}: {r.questionText}
                    </p>
                  </div>
                  <div className="ml-7 space-y-2">
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const optKey = `option${letter}` as "optionA" | "optionB" | "optionC" | "optionD";
                      const text = r[optKey];
                      const isUser = r.userAnswer.toUpperCase() === letter;
                      const isCorrect = r.correctAnswer.toUpperCase() === letter;
                      return (
                        <div
                          key={letter}
                          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                            isCorrect
                              ? "bg-success/10 border border-success/20 text-success font-medium"
                              : isUser && !isCorrect
                              ? "bg-destructive/10 border border-destructive/20 text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="shrink-0 font-bold">{letter}.</span>
                          <span className="flex-1">{text}</span>
                          {isCorrect && <CheckCircle className="shrink-0 h-3.5 w-3.5 mt-0.5" />}
                          {isUser && !isCorrect && <XCircle className="shrink-0 h-3.5 w-3.5 mt-0.5" />}
                        </div>
                      );
                    })}
                    {r.rationale && (
                      <div className="mt-3 rounded-lg border border-border bg-background/60 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Rationale</p>
                        <p className="text-xs leading-relaxed text-foreground">{r.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Modal */}
      {leaderboardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setLeaderboardOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <h2 className="text-base font-bold text-foreground">MCQ Leaderboard</h2>
                {leaderboard?.revealAt && (
                  <span className="text-xs text-muted-foreground">as of {formatRevealTime(leaderboard.revealAt)}</span>
                )}
              </div>
              <button
                onClick={() => setLeaderboardOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
              >
                ×
              </button>
            </div>

            {leaderboardLoading ? (
              <div className="flex justify-center py-14">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : !leaderboard?.available ? (
              <div className="flex flex-col items-center py-14 text-center text-muted-foreground px-6">
                <Lock className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm font-medium">Not yet available</p>
                {leaderboard?.revealAt && (
                  <p className="text-xs mt-1">
                    Results unlock at {formatRevealTime(leaderboard.revealAt)} · {formatRevealDate(leaderboard.revealAt)}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="flex border-b border-border px-5 pt-3 gap-2">
                  {leaderboard?.preClinical && (
                    <button
                      onClick={() => setLeaderboardTab("pre_clinical")}
                      className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        leaderboardTab === "pre_clinical"
                          ? "bg-primary/10 text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Pre-Clinical
                    </button>
                  )}
                  {leaderboard?.clinical && (
                    <button
                      onClick={() => setLeaderboardTab("clinical")}
                      className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        leaderboardTab === "clinical"
                          ? "bg-primary/10 text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Clinical
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto px-5 py-4">
                  {(() => {
                    const activeSet = leaderboardTab === "pre_clinical" ? leaderboard?.preClinical : leaderboard?.clinical;
                    const entries = activeSet?.entries;
                    const purchased = activeSet?.purchasedPositions ?? [];

                    if (!entries || entries.length === 0) {
                      return (
                        <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                          <Users className="mb-2 h-8 w-8 opacity-30" />
                          <p className="text-sm">No submissions yet for this category</p>
                        </div>
                      );
                    }

                    return (
                      <ol className="space-y-2">
                        {entries.map((entry, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                              idx === 0
                                ? "bg-accent/10 border border-accent/20"
                                : idx === 1
                                ? "bg-muted/60"
                                : "bg-muted/40"
                            }`}
                          >
                            <span className={`shrink-0 w-7 text-center text-sm font-bold ${
                              idx === 0 ? "text-accent" : idx === 1 ? "text-slate-400" : "text-muted-foreground/60"
                            }`}>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">{entry.name}</span>
                              {entry.boughtPosition && (
                                <span className="text-[10px] text-amber-500 font-medium">★ Bought this position</span>
                              )}
                            </div>
                            {entry.timeTakenSeconds != null && (
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {formatSeconds(entry.timeTakenSeconds)}
                              </span>
                            )}
                            <span className={`shrink-0 text-sm font-bold tabular-nums ${
                              parseFloat(entry.scorePercentage) >= 75
                                ? "text-success"
                                : parseFloat(entry.scorePercentage) >= 50
                                ? "text-amber-500"
                                : "text-destructive"
                            }`}>
                              {parseFloat(entry.scorePercentage).toFixed(1)}%
                            </span>
                          </li>
                        ))}
                      </ol>
                    );
                  })()}
                </div>

                {/* Position Buying Section */}
                {(() => {
                  const activeSet = leaderboardTab === "pre_clinical" ? leaderboard?.preClinical : leaderboard?.clinical;
                  const setType = leaderboardTab === "pre_clinical" ? "mcq_pre_clinical" : "mcq_clinical";
                  const isGhana = (leaderboard?.planCurrency ?? "GHS") === "GHS";
                  const currencySymbol = isGhana ? "GH₵" : "$";
                  const positionPrices = isGhana ? [10, 9, 6, 5, 3] : [5, 4, 3, 2.5, 1.5];
                  const purchased = activeSet?.purchasedPositions ?? [];
                  const userBalance = parseFloat(leaderboard?.virtualBalance ?? "0");
                  const canBuy = leaderboard?.canBuyPositions ?? false;
                  const rewardsDone = leaderboard?.rewardsDistributed ?? false;

                  if (!activeSet?.userAttempted) return null;

                  return (
                    <div className="border-t border-border px-5 py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Buy a Position</p>
                        <span className="text-xs text-muted-foreground">Balance: <strong>{currencySymbol}{userBalance.toFixed(2)}</strong></span>
                      </div>

                      {/* Time window status */}
                      {rewardsDone ? (
                        <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2">
                          <Trophy className="h-3.5 w-3.5 text-success shrink-0" />
                          <p className="text-xs text-success font-medium">Prizes have been distributed to the top 5!</p>
                        </div>
                      ) : !canBuy ? (
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            Position buying opens at <strong>8:00 PM</strong> and closes at <strong>11:55 PM</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                          <Timer className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            Buying window open · closes at <strong>11:55 PM</strong> · Prizes awarded at <strong>11:59 PM</strong>
                          </p>
                        </div>
                      )}

                      {buyPositionError && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{buyPositionError}</p>
                      )}
                      {buyPositionSuccess && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded px-3 py-2">{buyPositionSuccess}</p>
                      )}

                      <div className="grid grid-cols-5 gap-1.5">
                        {positionPrices.map((price, i) => {
                          const pos = i + 1;
                          const isTaken = purchased.some(p => p.position === pos);
                          const canAfford = userBalance >= price;
                          const isDisabled = isTaken || !canAfford || buyPositionLoading || !canBuy || rewardsDone;
                          const label = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;
                          return (
                            <button
                              key={pos}
                              disabled={isDisabled}
                              title={
                                rewardsDone ? "Buying closed — prizes awarded"
                                : !canBuy ? "Buying window is 8:00 PM – 11:55 PM"
                                : isTaken ? "Already purchased"
                                : !canAfford ? `Need ${currencySymbol}${price}`
                                : `Buy #${pos} for ${currencySymbol}${price} — swaps you into this rank`
                              }
                              onClick={async () => {
                                setBuyPositionError(null);
                                setBuyPositionSuccess(null);
                                setBuyPositionLoading(true);
                                const token = getToken();
                                try {
                                  const r = await fetch(`${import.meta.env.BASE_URL}api/mcq/leaderboard/buy-position`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ setId: activeSet.setId, setType, position: pos }),
                                  });
                                  const d = await r.json() as { success?: boolean; newBalance?: string; error?: string };
                                  if (r.ok && d.success) {
                                    setBuyPositionSuccess(`Position #${pos} purchased! New balance: ${currencySymbol}${d.newBalance}`);
                                    void openLeaderboard(true);
                                  } else {
                                    setBuyPositionError(d.error ?? "Could not buy position.");
                                  }
                                } catch {
                                  setBuyPositionError("Network error. Please try again.");
                                } finally {
                                  setBuyPositionLoading(false);
                                }
                              }}
                              className={`flex flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors ${
                                isTaken
                                  ? "border-border bg-muted opacity-40 cursor-not-allowed"
                                  : !canBuy || rewardsDone
                                  ? "border-border bg-muted opacity-40 cursor-not-allowed"
                                  : !canAfford
                                  ? "border-border bg-muted opacity-50 cursor-not-allowed"
                                  : "border-primary/30 bg-primary/5 hover:bg-primary/15 cursor-pointer"
                              }`}
                            >
                              <span className="text-base">{label}</span>
                              <span className="text-[10px] font-bold text-primary mt-0.5">{currencySymbol}{price}</span>
                              {isTaken && <span className="text-[9px] text-muted-foreground">Taken</span>}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Buying a position swaps you into that rank — the displaced person moves to your old spot. You must have attempted the quiz.
                      </p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
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

function CardButton({
  type,
  card,
  onSelect,
  loading,
  lockedReason,
}: {
  type: McqType;
  card: CardInfo | null;
  onSelect: (type: McqType) => void;
  loading: boolean;
  lockedReason?: string;
}) {
  const isPreClinical = type === "pre_clinical";
  const label = isPreClinical ? "Pre-Clinical" : "Clinical";
  const description = isPreClinical
    ? "Basic sciences & foundational medical knowledge"
    : "Applied clinical reasoning & patient management";
  const gradientClass = isPreClinical
    ? "from-indigo-500 to-violet-600"
    : "from-teal-500 to-emerald-600";
  const hoverBorder = isPreClinical ? "hover:border-indigo-400/40" : "hover:border-teal-400/40";
  const badgeClass = isPreClinical
    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
    : "border-teal-200 bg-teal-50 text-teal-700";

  const isCompleted = card?.completed;
  const isDisabled = !card || !!lockedReason || loading;

  function handleClick() {
    if (!card || lockedReason || loading) return;
    onSelect(type);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!card || !!lockedReason || loading}
      className={`group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm text-left transition-all w-full ${
        isCompleted
          ? `cursor-pointer ${hoverBorder} hover:shadow-md`
          : lockedReason
          ? "opacity-50 cursor-not-allowed"
          : !card
          ? "opacity-40 cursor-not-allowed"
          : `cursor-pointer ${hoverBorder} hover:shadow-md`
      }`}
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} text-white shadow-sm`}>
        <BookOpen className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">{label} Student</h3>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">
              <CheckCircle className="h-3 w-3" /> Completed
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
            <Star className="h-2.5 w-2.5" /> 10 Questions
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
            <Clock className="h-2.5 w-2.5" /> 8 Minutes
          </span>
        </div>
      </div>

      {!card && (
        <div className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground">
          No quiz posted today
        </div>
      )}

      {lockedReason && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" /> {lockedReason}
        </div>
      )}

      {!isCompleted && !lockedReason && card && (
        <div className="mt-3 flex items-center justify-end text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Start Quiz</span><ChevronRight className="h-3.5 w-3.5" /></>}
        </div>
      )}

      {isCompleted && card && (
        <div className="mt-3 w-full rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary text-center">
          View My Results
        </div>
      )}
    </button>
  );
}

function ResultsSummary({
  attempt,
  set,
  leaderboardAvailable,
  onOpenLeaderboard,
}: {
  attempt: AttemptData;
  set: McqSetInfo;
  leaderboardAvailable: boolean;
  onOpenLeaderboard: () => void;
}) {
  const pct = parseFloat(attempt.scorePercentage);
  const scoreColor =
    pct >= 75 ? "text-success" : pct >= 50 ? "text-amber-500" : "text-destructive";
  const scoreBorder =
    pct >= 75 ? "border-success/30 bg-success/5" : pct >= 50 ? "border-amber-200 bg-amber-50" : "border-destructive/30 bg-destructive/5";

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-5 shadow-sm ${scoreBorder}`}>
        <div className="flex items-center gap-4">
          <Trophy className={`h-9 w-9 ${scoreColor}`} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Score</p>
            <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{pct.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {attempt.score} of {set.totalQuestions} correct
              {attempt.timeTakenSeconds != null && ` · ${formatSeconds(attempt.timeTakenSeconds)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {set.type === "pre_clinical" ? "Pre-Clinical" : "Clinical"}
            </p>
            {!attempt.includedInLeaderboard && (
              <p className="text-xs text-destructive font-medium mt-0.5">Late — not ranked</p>
            )}
            {attempt.includedInLeaderboard && (
              <p className="text-xs text-success font-medium mt-0.5">Included in ranking</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Show Results List</p>
              {!leaderboardAvailable && set.revealResultsAt && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Available at {formatRevealTime(set.revealResultsAt)} · <Countdown targetIso={set.revealResultsAt} />
                </p>
              )}
              {leaderboardAvailable && (
                <p className="text-xs text-muted-foreground mt-0.5">Leaderboard is now available</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onOpenLeaderboard()}
            disabled={!leaderboardAvailable}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              leaderboardAvailable
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            }`}
            title={!leaderboardAvailable && set.revealResultsAt ? `Available at ${formatRevealTime(set.revealResultsAt)}` : undefined}
          >
            {!leaderboardAvailable && <Lock className="h-3.5 w-3.5" />}
            <Users className="h-3.5 w-3.5" />
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
