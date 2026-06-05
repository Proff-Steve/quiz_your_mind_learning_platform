import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  LogOut,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Cloud,
  SaveAll,
  PlayCircle,
  Loader2,
  AlertCircle,
  Columns2,
  AlignLeft,
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface ApiQuestion {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  imageData?: string | null;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  imageData?: string | null;
}

interface QuestionState {
  answer: number | null;
  flagged: boolean;
}

interface SessionAnswer {
  questionId: number;
  answerIndex: number;
}

interface ExamSession {
  id: number;
  timerRemaining: number;
  answers: SessionAnswer[];
  flagged: number[];
  status: string;
}

interface ExamInfo {
  id: number;
  title: string;
  durationMinutes: number;
  difficulty: string;
  mode: string | null;
}

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const OPTION_LABELS = ["A", "B", "C", "D"];
const QUESTIONS_PER_PAGE = 2;
const AUTOSAVE_DELAY_MS = 30_000;

function getExamId(): number {
  try {
    const raw = localStorage.getItem("qym_quiz_config");
    if (raw) {
      const parsed = JSON.parse(raw) as { examId?: number };
      if (parsed.examId && parsed.examId > 0) return parsed.examId;
    }
  } catch {}
  return 1;
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getConfig() {
  try {
    const raw = localStorage.getItem("qym_quiz_config");
    if (raw) return JSON.parse(raw) as { duration: number };
  } catch {}
  return { duration: 45 };
}

async function fetchQuestions(examId: number): Promise<Question[]> {
  const token = getToken();
  const res = await fetch(`${import.meta.env.BASE_URL}api/questions?examId=${examId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  const data = await res.json();
  return (data.questions as ApiQuestion[]).map((q) => ({
    id: q.id,
    text: q.text,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    imageData: q.imageData ?? null,
  }));
}

async function fetchSession(examId: number): Promise<ExamSession | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${import.meta.env.BASE_URL}api/exam-session?examId=${examId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.session as ExamSession | null;
}

async function fetchExamInfo(examId: number): Promise<ExamInfo | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${import.meta.env.BASE_URL}api/exam-info?examId=${examId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/* ─────────────────────────────────────────────────────────
   QUESTION TEXT FORMATTER
───────────────────────────────────────────────────────── */
function formatQuestionText(raw: string): string {
  let text = raw;

  // Strip embedded index numbers like "(Index No. SM/SMS/YY/3055)" anywhere in the text
  text = text.replace(/\(\s*Index\s+No\.?\s*[^)]*\)/gi, "");

  // Strip leading technique/format labels that have parenthetical descriptions
  // e.g., "Negative combination (EXCEPT): " or "Extremely long stem (multi-step reasoning): "
  text = text.replace(/^\s*[A-Za-z][^:()]*\([^)]+\)\s*:\s*/s, "");

  // Also strip plain format labels at the start (e.g., "Classic Combination: ", "Matrix-Combination Hybrid: ")
  // Only strip when the prefix is >= 2 words and followed by a capital letter (actual question)
  text = text.replace(/^\s*(?:[A-Z][a-zA-Z\-–/]+ ){1,6}:\s+(?=[A-Z(])/s, "");

  // Ensure Statement/Assertion/Reason markers each start on their own line
  text = text.replace(/([^\n])(Statement\s+\w+\s*:)/g, "$1\n$2");
  text = text.replace(/([^\n])(\bAssertion\s*[:\d])/gi, "$1\n$2");
  text = text.replace(/([^\n])(\bReason\s*[:\d])/gi, "$1\n$2");

  // Ensure Roman numeral list items (I. II. III. IV.) start on their own line
  text = text.replace(/([^\n])\s+((?:I{1,3}|IV|VI{0,3}|VIII|IX|X)\.\s)/g, "$1\n$2");

  return text.trim();
}

/* ─────────────────────────────────────────────────────────
   NAVIGATOR BOX
───────────────────────────────────────────────────────── */
function NavBox({
  num,
  answered,
  flagged,
  active,
  onClick,
}: {
  num: number;
  answered: boolean;
  flagged: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md
        text-xs font-semibold transition-colors
        ${active
          ? "border-2 border-primary bg-white text-primary"
          : answered
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-muted text-muted-foreground hover:border-primary/40"}
      `}
    >
      {num}
      {flagged && (
        <span className="absolute bottom-0 left-0 right-0 h-[30%] bg-red-500/80" />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function ExamArea() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Read examId fresh on every mount so it picks up the latest generated exam
  const [EXAM_ID] = useState(() => getExamId());

  const { data: questions = [], isLoading: isQLoading, isError } = useQuery<Question[]>({
    queryKey: ["exam-questions", EXAM_ID],
    queryFn: () => fetchQuestions(EXAM_ID),
    staleTime: Infinity,
    gcTime: 0,
  });

  const { data: session, isLoading: isSessionLoading } = useQuery<ExamSession | null>({
    queryKey: ["exam-session", EXAM_ID],
    queryFn: () => fetchSession(EXAM_ID),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });

  const { data: examInfo } = useQuery<ExamInfo | null>({
    queryKey: ["exam-info", EXAM_ID],
    queryFn: () => fetchExamInfo(EXAM_ID),
    staleTime: Infinity,
    retry: false,
  });

  const isLoading = isQLoading || isSessionLoading;

  const totalQuestions = questions.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_PAGE));

  /* State */
  const [page, setPage] = useState(0);
  const [qStates, setQStates] = useState<QuestionState[]>([]);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mobileCompact, setMobileCompact] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [remaining, setRemaining] = useState(getConfig().duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  /* Refs for always-fresh values in callbacks */
  const qStatesRef = useRef(qStates);
  const questionsRef = useRef(questions);
  const remainingRef = useRef(remaining);
  const initializedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { qStatesRef.current = qStates; }, [qStates]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  /* ── SESSION INITIALIZATION ──────────────────────────── */
  useEffect(() => {
    if (initializedRef.current) return;
    if (questions.length === 0) return;
    if (isSessionLoading) return;

    initializedRef.current = true;

    // If session was already submitted, redirect to results
    if (session && session.status === "submitted") {
      navigate("/results");
      return;
    }

    const baseStates: QuestionState[] = questions.map(() => ({ answer: null, flagged: false }));

    if (session) {
      // Prefer the localStorage value if it exists — it stays current even
      // while the student is on the ReviewPage (the review page ticks it down).
      // Fall back to the server value only when no local value is present.
      const localRemaining = (() => {
        try {
          const raw = localStorage.getItem("qym_timer_remaining");
          if (raw) {
            const n = parseInt(raw, 10);
            if (!isNaN(n) && n >= 0) return n;
          }
        } catch {}
        return null;
      })();
      setRemaining(localRemaining ?? session.timerRemaining);

      const states = [...baseStates];
      for (const ans of session.answers) {
        const idx = questions.findIndex((q) => q.id === ans.questionId);
        if (idx !== -1) states[idx] = { ...states[idx], answer: ans.answerIndex };
      }
      for (const qId of session.flagged) {
        const idx = questions.findIndex((q) => q.id === qId);
        if (idx !== -1) states[idx] = { ...states[idx], flagged: true };
      }
      setQStates(states);
    } else {
      setRemaining(getConfig().duration * 60);
      setQStates(baseStates);
    }
  }, [questions, session, isSessionLoading]);

  /* ── SAVE TO SERVER ──────────────────────────────────── */
  const saveToServer = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const currentQuestions = questionsRef.current;
    const currentStates = qStatesRef.current;

    const answers: SessionAnswer[] = currentQuestions.flatMap((q, idx) => {
      const qs = currentStates[idx];
      if (!qs || qs.answer === null) return [];
      return [{ questionId: q.id, answerIndex: qs.answer }];
    });

    const flagged: number[] = currentQuestions.flatMap((q, idx) => {
      const qs = currentStates[idx];
      if (!qs || !qs.flagged) return [];
      return [q.id];
    });

    setSaveStatus("saving");
    try {
      await fetch(`${import.meta.env.BASE_URL}api/exam-session`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId: EXAM_ID,
          timerRemaining: remainingRef.current,
          answers,
          flagged,
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, []);

  /* ── DEBOUNCED AUTOSAVE TRIGGER ──────────────────────── */
  function triggerAutosave() {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveToServer();
    }, AUTOSAVE_DELAY_MS);
  }

  /* ── STORE REVIEW STATE IN LOCALSTORAGE ──────────────── */
  function storeReviewState() {
    const currentQuestions = questionsRef.current;
    const currentStates = qStatesRef.current;

    const reviewQuestions = currentQuestions.map((q, idx) => {
      const qs = currentStates[idx] ?? { answer: null, flagged: false };
      return {
        id: q.id,
        answered: qs.answer !== null,
        flagged: qs.flagged,
      };
    });

    localStorage.setItem("qym_review_state", JSON.stringify(reviewQuestions));
  }

  /* ── SUBMIT (manual → goes to review page) ──────────── */
  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    // Flush all current answers to the server so they survive navigation
    await saveToServer();

    storeReviewState();

    const currentQuestions = questionsRef.current;
    const currentStates = qStatesRef.current;
    const startRemaining = remainingRef.current;
    const configDuration = getConfig().duration * 60;
    const elapsedSeconds = configDuration - startRemaining;

    const answers: SessionAnswer[] = currentQuestions.flatMap((q, idx) => {
      const qs = currentStates[idx];
      if (!qs || qs.answer === null) return [];
      return [{ questionId: q.id, answerIndex: qs.answer }];
    });

    localStorage.setItem("qym_pending_submit", JSON.stringify({
      examId: EXAM_ID,
      answers,
      elapsedSeconds,
    }));

    // Persist remaining time so ReviewPage can continue the countdown
    localStorage.setItem("qym_timer_remaining", String(remainingRef.current));

    navigate("/review");
  }, [submitted, navigate, saveToServer]);

  /* ── AUTO-SUBMIT (timer expired → skip review, go to /results) ── */
  const handleAutoSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    setIsAutoSubmitting(true);

    const currentQuestions = questionsRef.current;
    const currentStates = qStatesRef.current;
    const configDuration = getConfig().duration * 60;
    const elapsedSeconds = configDuration;

    const answers: SessionAnswer[] = currentQuestions.flatMap((q, idx) => {
      const qs = currentStates[idx];
      if (!qs || qs.answer === null) return [];
      return [{ questionId: q.id, answerIndex: qs.answer }];
    });

    storeReviewState();

    const token = getToken();
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/exam-session/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ examId: EXAM_ID, answers }),
        });

        if (res.ok) {
          const data = await res.json() as { score: string; correct: number; total: number; virtualReward?: number | null };
          const totalAnswered = answers.length;
          const avgSeconds = totalAnswered > 0 ? Math.round(elapsedSeconds / totalAnswered) : 0;

          localStorage.setItem("qym_last_result", JSON.stringify({
            examId: EXAM_ID,
            score: data.score,
            correct: data.correct,
            total: data.total,
            elapsedSeconds,
            avgSeconds,
            virtualReward: data.virtualReward ?? null,
          }));
          localStorage.removeItem("qym_pending_submit");
          navigate("/results");
          return;
        }
      } catch {
        // fall through to review-page fallback
      }
    }

    // Fallback: store pending and navigate through review
    localStorage.setItem("qym_pending_submit", JSON.stringify({ examId: EXAM_ID, answers, elapsedSeconds }));
    navigate("/review");
  }, [submitted, navigate]);

  const handleAutoSubmitRef = useRef(handleAutoSubmit);
  useEffect(() => { handleAutoSubmitRef.current = handleAutoSubmit; }, [handleAutoSubmit]);

  /* ── TIMER ───────────────────────────────────────────── */
  useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0 && initializedRef.current && !submitted) {
      handleAutoSubmitRef.current();
    }
  }, [remaining, submitted]);

  /* ── USER ────────────────────────────────────────────── */
  const displayName = user?.name ?? "Student";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  /* Questions on current page */
  const pageStart = page * QUESTIONS_PER_PAGE;
  const pageQuestions = questions.slice(pageStart, pageStart + QUESTIONS_PER_PAGE);

  /* ── ANSWER HANDLER ──────────────────────────────────── */
  function setAnswer(qIndex: number, optionIndex: number) {
    setQStates((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], answer: optionIndex };
      return next;
    });
    triggerAutosave();
  }

  function clearAnswer(qIndex: number) {
    setQStates((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], answer: null };
      return next;
    });
    triggerAutosave();
  }

  /* ── FLAG HANDLER — immediate save ──────────────────── */
  function toggleFlag(qIndex: number) {
    setQStates((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], flagged: !next[qIndex].flagged };
      qStatesRef.current = next;
      return next;
    });
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    saveToServer();
  }

  /* Jump to page containing a question (1-indexed question number) */
  function jumpToQuestion(qNum: number) {
    setPage(Math.floor((qNum - 1) / QUESTIONS_PER_PAGE));
  }

  /* Counts */
  const answeredCount = qStates.filter((q) => q.answer !== null).length;

  /* Logout */
  function handleLogout() {
    navigate("/");
  }

  const isLastPage = page === totalPages - 1;
  const timerWarning = remaining < 300;

  /* Exam title from API, or fallback */
  const examTitle = examInfo?.title ?? "Active Quiz";
  const difficultyLabel = examInfo?.mode ?? examInfo?.difficulty ?? "";

  /* ── LOADING STATE ─────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading questions…</p>
        </div>
      </div>
    );
  }

  /* ── ERROR STATE ─────────────────────────────────── */
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Failed to load questions. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── AUTO-SUBMIT OVERLAY ──────────────────────────────── */
  if (isAutoSubmitting) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">Time's Up!</p>
          <p className="mt-1 text-sm text-muted-foreground">Submitting your answers and calculating your score…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30 text-foreground">

      {/* ══════════════════════════════════════════════════════
          TOP NAVBAR
      ══════════════════════════════════════════════════════ */}
      <header className="z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard">
            <span className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Quiz Your Mind</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Mobile layout toggle — only visible on small screens */}
            <button
              onClick={() => setMobileCompact((v) => !v)}
              title={mobileCompact ? "Switch to classic view" : "Switch to compact view"}
              className="sm:hidden flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              {mobileCompact ? (
                <>
                  <Columns2 className="h-3.5 w-3.5" />
                  Classic
                </>
              ) : (
                <>
                  <AlignLeft className="h-3.5 w-3.5" />
                  Compact
                </>
              )}
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">Student Account</p>
            </div>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20">
                {initials}
              </div>
            )}
            <span className="hidden h-2 w-2 rounded-full bg-success sm:block" />
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════
            LEFT — QUESTION AREA
        ════════════════════════════════════════════════ */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Sub-header */}
          <div className="flex items-start justify-between border-b border-border bg-card/60 px-6 py-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">{examTitle}</h1>
              {difficultyLabel && (
                <p className="text-xs capitalize text-muted-foreground">
                  Difficulty: {difficultyLabel}
                </p>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Page {page + 1} of {totalPages}
            </p>
          </div>

          {/* Scrollable questions */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {pageQuestions.map((q, idx) => {
                const qIndex = pageStart + idx;
                const qs = qStates[qIndex] ?? { answer: null, flagged: false };
                const isAnswered = qs.answer !== null;

                return (
                  <div key={q.id} className="flex gap-3">
                    {/* Left margin labels */}
                    <div className={`w-52 shrink-0 pt-10 pr-8 text-right text-[11px] leading-tight ${mobileCompact ? "hidden sm:block" : ""}`}>
                      <p className={`font-semibold ${isAnswered ? "text-primary" : "text-muted-foreground"}`}>
                        {isAnswered ? "Answered" : "Not yet answered"}
                      </p>
                      <p className="mt-1 text-muted-foreground">Marked out of 1.00</p>
                      <button
                        onClick={() => toggleFlag(qIndex)}
                        className={`mt-1 flex w-full items-center justify-end gap-1 transition-colors ${
                          qs.flagged ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                        }`}
                      >
                        <Flag className={`h-3 w-3 ${qs.flagged ? "fill-red-500" : ""}`} />
                        {qs.flagged ? "Flagged" : "Flag Question"}
                      </button>
                    </div>

                    {/* Question content */}
                    <div className="flex-1 py-3">
                      {/* Compact mobile status row — only when compact mode is on */}
                      {mobileCompact && (
                        <div className="flex items-center justify-between mb-2 sm:hidden">
                          <p className="text-sm font-bold uppercase tracking-widest text-primary">
                            Question {qIndex + 1}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold ${isAnswered ? "text-primary" : "text-muted-foreground"}`}>
                              {isAnswered ? "Answered" : "Unanswered"}
                            </span>
                            <button
                              onClick={() => toggleFlag(qIndex)}
                              className={`flex items-center gap-1 text-[11px] transition-colors ${
                                qs.flagged ? "text-red-500" : "text-muted-foreground"
                              }`}
                            >
                              <Flag className={`h-3 w-3 ${qs.flagged ? "fill-red-500" : ""}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Question label */}
                      <p className={`mb-2 text-sm font-bold uppercase tracking-widest text-primary ${mobileCompact ? "hidden sm:block" : ""}`}>
                        Question {qIndex + 1}
                      </p>

                      <p className={`mb-5 font-medium leading-relaxed text-foreground whitespace-pre-line ${mobileCompact ? "text-base sm:text-lg" : "text-lg"}`}>
                        {formatQuestionText(q.text)}
                      </p>

                      {/* Image (if this question has an associated image) */}
                      {q.imageData && (
                        <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3">
                          <img
                            src={q.imageData}
                            alt={`Image for question ${qIndex + 1}`}
                            className="mx-auto max-h-72 rounded-lg object-contain"
                          />
                        </div>
                      )}

                      {/* Options */}
                      <div className={mobileCompact ? "space-y-3 sm:space-y-4" : "space-y-4"}>
                        {q.options.map((opt, oIdx) => {
                          const selected = qs.answer === oIdx;
                          return (
                            <div key={oIdx} className={`flex items-start gap-3 ${mobileCompact ? "text-base sm:text-lg" : "text-lg"}`}>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={selected}
                                onChange={() => setAnswer(qIndex, oIdx)}
                                className="mt-0.5 cursor-pointer accent-primary"
                              />
                              <span className="text-foreground">
                                <span className="font-semibold">{OPTION_LABELS[oIdx]}. </span>
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Clear button */}
                      {isAnswered && (
                        <button
                          onClick={() => clearAnswer(qIndex)}
                          className="mt-4 rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          Clear My Choice
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BOTTOM NAV BAR ─────────────────────────────── */}
          <div className="border-t border-border bg-card px-6 py-3">
            <div className="mx-auto flex max-w-3xl items-center justify-between">
              {/* Previous */}
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {/* Centre status */}
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    saveStatus === "saving"
                      ? "text-muted-foreground"
                      : saveStatus === "saved"
                      ? "text-success"
                      : "text-muted-foreground/50"
                  }`}
                >
                  <SaveAll className="h-3.5 w-3.5" />
                  {saveStatus === "saving" ? "SAVING…" : saveStatus === "saved" ? "CHANGES SAVED" : "AUTO-SAVE ON"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
              </div>

              {/* Next / Submit */}
              {isLastPage ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-success px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlayCircle className="h-4 w-4" />
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT PANEL — collapsible
        ════════════════════════════════════════════════ */}
        <div
          className={`
            relative shrink-0 flex-col border-l border-border bg-card
            transition-[width] duration-300 ease-in-out overflow-hidden
            ${mobileCompact ? "hidden sm:flex" : "flex"}
            ${rightCollapsed ? "w-24" : "w-72"}
          `}
        >
          {/* Toggle button — pinned to the left edge of the panel */}
          <button
            onClick={() => setRightCollapsed((v) => !v)}
            title={rightCollapsed ? "Expand panel" : "Collapse panel"}
            className="
              absolute left-0 top-1/2 -translate-y-1/2 z-10
              flex h-14 w-6 items-center justify-center
              rounded-l-xl bg-primary text-primary-foreground
              shadow-md hover:bg-primary/80 transition-colors
            "
          >
            {rightCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* ── TIMER — always visible ──────────────────── */}
          <div
            className={`
              shrink-0 border-b border-border p-3
              ${rightCollapsed ? "flex flex-col items-center justify-center py-4" : ""}
            `}
          >
            {rightCollapsed ? (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <Clock className={`h-4 w-4 ${timerWarning ? "text-red-500" : "text-primary"}`} />
                <span className={`text-sm font-bold tabular-nums leading-none ${timerWarning ? "text-red-500" : "text-foreground"}`}>
                  {formatTime(remaining)}
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
                <p className={`mb-1 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest ${timerWarning ? "text-red-500" : "text-muted-foreground"}`}>
                  <Clock className="h-3 w-3" />
                  Time Remaining
                </p>
                <p className={`text-3xl font-bold tabular-nums ${timerWarning ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                  {formatTime(remaining)}
                </p>
              </div>
            )}
          </div>

          {/* ── NAVIGATOR + extras — hidden when collapsed ── */}
          {!rightCollapsed && (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">

              {/* Navigator grid */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    Question Navigator
                  </p>
                  <p className="text-[10px] text-muted-foreground">Total: {totalQuestions}</p>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const qs = qStates[idx] ?? { answer: null, flagged: false };
                    const qPage = Math.floor(idx / QUESTIONS_PER_PAGE);
                    const isActive = qPage === page;
                    return (
                      <NavBox
                        key={q.id}
                        num={idx + 1}
                        answered={qs.answer !== null}
                        flagged={qs.flagged}
                        active={isActive}
                        onClick={() => jumpToQuestion(idx + 1)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Color key */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground">
                  Color Key
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm border border-border bg-muted" />
                    Unanswered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
                    Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="relative inline-block h-3 w-3 overflow-hidden rounded-sm border border-border bg-muted">
                      <span className="absolute bottom-0 left-0 right-0 h-[35%] bg-red-500" />
                    </span>
                    Flagged
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm border-2 border-primary bg-white" />
                    Active
                  </span>
                </div>
              </div>

              {/* Cloud sync card */}
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Cloud className="h-3.5 w-3.5 text-primary" />
                  Cloud Sync Active
                </p>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Questions Completed</span>
                  <span className="font-semibold text-foreground">
                    {answeredCount}/{totalQuestions}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Flagged for Review</span>
                  <span className="font-semibold text-foreground">
                    {qStates.filter((q) => q.flagged).length}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {saveStatus === "saving"
                    ? "Saving your progress…"
                    : saveStatus === "saved"
                    ? "Progress saved to server."
                    : "Auto-saves every 30 seconds. Flags save instantly."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
