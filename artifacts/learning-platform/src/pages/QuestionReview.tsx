import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Check,
  X,
  Flag,
  ChevronRight,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
type OptionLetter = "A" | "B" | "C" | "D";

interface ApiQuestion {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  rationale: string;
  userAnswer: string | null;
  imageData?: string | null;
}

interface ReviewQuestion {
  id: number;
  text: string;
  options: { letter: OptionLetter; text: string }[];
  correctAnswer: OptionLetter;
  userAnswer: OptionLetter | null;
  rationale: string;
  isCorrect: boolean;
  unanswered: boolean;
  imageData?: string | null;
}

interface ExamResultResponse {
  correct: number;
  total: number;
  score: string;
  questions: ApiQuestion[];
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function getLocalExamId(): number {
  try {
    const raw = localStorage.getItem("qym_last_result");
    if (raw) return (JSON.parse(raw) as { examId: number }).examId;
  } catch {}
  return 1;
}

/* ─────────────────────────────────────────────────────────
   QUESTION TEXT FORMATTER
───────────────────────────────────────────────────────── */
function formatQuestionText(raw: string): string {
  let text = raw;
  text = text.replace(/\(\s*Index\s+No\.?\s*[^)]*\)/gi, "");
  text = text.replace(/^\s*[A-Za-z][^:()]*\([^)]+\)\s*:\s*/s, "");
  text = text.replace(/^\s*(?:[A-Z][a-zA-Z\-–/]+ ){1,6}:\s+(?=[A-Z(])/s, "");
  text = text.replace(/([^\n])(Statement\s+\w+\s*:)/g, "$1\n$2");
  text = text.replace(/([^\n])(\bAssertion\s*[:\d])/gi, "$1\n$2");
  text = text.replace(/([^\n])(\bReason\s*[:\d])/gi, "$1\n$2");
  text = text.replace(/([^\n])\s+((?:I{1,3}|IV|VI{0,3}|VIII|IX|X)\.\s)/g, "$1\n$2");
  return text.trim();
}

function buildReviewQuestion(q: ApiQuestion): ReviewQuestion {
  const options: { letter: OptionLetter; text: string }[] = [
    { letter: "A", text: q.optionA },
    { letter: "B", text: q.optionB },
    { letter: "C", text: q.optionC },
    { letter: "D", text: q.optionD },
  ];
  const correctAnswer = q.correctAnswer as OptionLetter;
  const userAnswer = q.userAnswer as OptionLetter | null;
  const unanswered = userAnswer === null;
  const isCorrect = !unanswered && userAnswer === correctAnswer;
  return { id: q.id, text: q.text, options, correctAnswer, userAnswer, rationale: q.rationale, isCorrect, unanswered, imageData: q.imageData };
}

/* ─────────────────────────────────────────────────────────
   OPTION ROW
───────────────────────────────────────────────────────── */
function OptionRow({
  opt,
  isUserAnswer,
  isCorrectAnswer,
  unanswered,
}: {
  opt: { letter: OptionLetter; text: string };
  isUserAnswer: boolean;
  isCorrectAnswer: boolean;
  unanswered: boolean;
}) {
  const isWrongUserAnswer = isUserAnswer && !isCorrectAnswer;

  let rowStyle = "border border-border bg-card";
  if (isCorrectAnswer) rowStyle = "border border-green-300 bg-green-50";
  if (isWrongUserAnswer) rowStyle = "border border-red-300 bg-red-50";

  return (
    <div className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-2.5 ${rowStyle}`}>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
          ${isCorrectAnswer ? "bg-green-500 text-white" : isWrongUserAnswer ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}
      >
        {opt.letter}
      </span>
      <span
        className={`flex-1 text-sm ${
          isCorrectAnswer
            ? "font-semibold text-green-800"
            : isWrongUserAnswer
            ? "font-semibold text-red-700"
            : "text-foreground"
        }`}
      >
        {opt.text}
      </span>
      {isCorrectAnswer && <Check className="h-4 w-4 shrink-0 text-green-600" strokeWidth={3} />}
      {isWrongUserAnswer && <X className="h-4 w-4 shrink-0 text-red-500" strokeWidth={3} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   QUESTION CARD
───────────────────────────────────────────────────────── */
function QuestionCard({ q, index }: { q: ReviewQuestion; index: number }) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white
            ${q.isCorrect ? "bg-primary" : q.unanswered ? "bg-muted-foreground" : "bg-red-500"}`}
        >
          {index + 1}
        </span>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold
            ${q.unanswered ? "bg-amber-100 text-amber-700" : q.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
        >
          {q.unanswered && <Flag className="mr-1 inline h-3 w-3" />}
          {q.unanswered ? "Unanswered" : q.isCorrect ? "Correct" : "Incorrect"}
          {!q.unanswered && (
            q.isCorrect
              ? <Check className="ml-1 inline h-3 w-3" strokeWidth={3} />
              : <X className="ml-1 inline h-3 w-3" strokeWidth={3} />
          )}
        </span>

        <div className="ml-auto text-xs text-muted-foreground">
          Marks&nbsp;
          <span className={`font-semibold ${q.isCorrect ? "text-green-600" : "text-red-500"}`}>
            {q.isCorrect ? "1.00" : "0.00"}
          </span>
          &nbsp;/&nbsp;1.00
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="mb-4 text-sm font-medium leading-relaxed text-foreground whitespace-pre-line">{formatQuestionText(q.text)}</p>

        {q.imageData && (
          <div className="mb-4 rounded-xl border border-border bg-muted/30 p-3">
            <img
              src={q.imageData}
              alt={`Image for question ${index + 1}`}
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
          </div>
        )}

        <div>
          {q.options.map((opt) => (
            <OptionRow
              key={opt.letter}
              opt={opt}
              isUserAnswer={opt.letter === q.userAnswer}
              isCorrectAnswer={opt.letter === q.correctAnswer}
              unanswered={q.unanswered}
            />
          ))}
        </div>

        {q.unanswered && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
            <p className="text-xs font-semibold text-amber-700">
              You did not answer this question. The correct answer is <span className="font-bold">{q.correctAnswer}</span>.
            </p>
          </div>
        )}

        {q.rationale && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              Rationale
            </p>
            <p className="text-xs leading-relaxed text-foreground/80">{q.rationale}</p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            Content source: Study Material Analysis
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PDF CONTENT RENDERER (hidden, used for capture)
───────────────────────────────────────────────────────── */
function PdfContent({
  questions,
  summary,
  pct,
}: {
  questions: ReviewQuestion[];
  summary: { correct: number; total: number; score: string };
  pct: number;
}) {
  const performanceColor = pct >= 75 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
  const performanceLabel = pct >= 75 ? "Excellent" : pct >= 60 ? "Good" : "Needs Work";

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: "#ffffff",
        color: "#1a1a2e",
        padding: "40px",
        width: "794px",
        minHeight: "1122px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "28px",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: "11px", opacity: 0.8, marginBottom: "6px", letterSpacing: "2px", textTransform: "uppercase" }}>
          Quiz Results
        </div>
        <div style={{ fontSize: "26px", fontWeight: 800, marginBottom: "16px" }}>Detailed Analysis</div>

        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", opacity: 0.75, marginBottom: "4px" }}>Overall Score</div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>
              {summary.correct} / {summary.total}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", opacity: 0.75, marginBottom: "4px" }}>Percentage</div>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", opacity: 0.75, marginBottom: "4px" }}>Performance</div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "4px 14px",
                display: "inline-block",
                marginTop: "4px",
              }}
            >
              {performanceLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => {
        const statusColor = q.isCorrect ? "#16a34a" : q.unanswered ? "#d97706" : "#dc2626";
        const statusBg = q.isCorrect ? "#f0fdf4" : q.unanswered ? "#fffbeb" : "#fef2f2";
        const statusLabel = q.unanswered ? "Unanswered" : q.isCorrect ? "Correct" : "Incorrect";

        return (
          <div
            key={q.id}
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px",
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: q.isCorrect ? "#4f46e5" : q.unanswered ? "#9ca3af" : "#dc2626",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: "20px",
                  background: statusBg,
                  color: statusColor,
                  fontSize: "11px",
                  fontWeight: 700,
                  border: `1px solid ${statusColor}40`,
                }}
              >
                {statusLabel}
              </div>
              <div style={{ marginLeft: "auto", fontSize: "11px", color: "#6b7280" }}>
                Marks:{" "}
                <span style={{ fontWeight: 700, color: q.isCorrect ? "#16a34a" : "#dc2626" }}>
                  {q.isCorrect ? "1.00" : "0.00"}
                </span>{" "}
                / 1.00
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: "16px 18px" }}>
              {/* Question text */}
              <p style={{ fontSize: "12px", fontWeight: 600, lineHeight: 1.6, marginBottom: "12px", whiteSpace: "pre-line", color: "#111827" }}>
                {formatQuestionText(q.text)}
              </p>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {q.options.map((opt) => {
                  const isUserAnswer = opt.letter === q.userAnswer;
                  const isCorrectAnswer = opt.letter === q.correctAnswer;
                  const isWrong = isUserAnswer && !isCorrectAnswer;

                  let bg = "#ffffff";
                  let border = "#e5e7eb";
                  let textColor = "#374151";
                  let circleBg = "#e5e7eb";
                  let circleText = "#6b7280";

                  if (isCorrectAnswer) {
                    bg = "#f0fdf4";
                    border = "#86efac";
                    textColor = "#166534";
                    circleBg = "#16a34a";
                    circleText = "#ffffff";
                  } else if (isWrong) {
                    bg = "#fef2f2";
                    border = "#fca5a5";
                    textColor = "#991b1b";
                    circleBg = "#dc2626";
                    circleText = "#ffffff";
                  }

                  return (
                    <div
                      key={opt.letter}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: bg,
                        border: `1px solid ${border}`,
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: circleBg,
                          color: circleText,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {opt.letter}
                      </div>
                      <span style={{ fontSize: "11px", color: textColor, fontWeight: isCorrectAnswer || isWrong ? 600 : 400, lineHeight: 1.5 }}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Unanswered note */}
              {q.unanswered && (
                <div
                  style={{
                    marginBottom: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    fontSize: "11px",
                    color: "#92400e",
                    fontWeight: 600,
                  }}
                >
                  You did not answer this question. The correct answer is <strong>{q.correctAnswer}</strong>.
                </div>
              )}

              {/* Rationale */}
              {q.rationale && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#eef2ff",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>
                    Rationale
                  </div>
                  <p style={{ fontSize: "11px", color: "#374151", lineHeight: 1.6, margin: 0 }}>{q.rationale}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{ marginTop: "24px", textAlign: "center", fontSize: "10px", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
        Generated by QuizYourMind &bull; Detailed Analysis Report
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */
export default function QuestionReview() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [summary, setSummary] = useState<{ correct: number; total: number; score: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    const examId = getLocalExamId();

    if (!token) {
      setError("Please log in to view your results.");
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.BASE_URL}api/exam-result?examId=${examId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No result found for this exam.");
        return res.json();
      })
      .then((data: ExamResultResponse) => {
        setSummary({ correct: data.correct, total: data.total, score: data.score });
        setQuestions(data.questions.map(buildReviewQuestion));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownloadPdf() {
    if (!pdfRef.current || !summary) return;
    setDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yOffset = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        yOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("detailed-analysis.pdf");
    } finally {
      setDownloading(false);
    }
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

  if (error || !summary) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error ?? "No result available."}</p>
          <Link href="/results">
            <span className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer">
              Back to Results
            </span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const pct = Math.round(parseFloat(summary.score));
  const correctCount = summary.correct;
  const total = summary.total;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">

        {/* ── PAGE HEADER ──────────────────────────────────── */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Link href="/dashboard"><span className="cursor-pointer hover:text-foreground">Dashboard</span></Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/results"><span className="cursor-pointer hover:text-foreground">Results</span></Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">Review Questions</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Detailed Analysis</h1>
          </div>

          <div className="mt-1 flex shrink-0 items-center gap-2 sm:mt-0">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {downloading ? "Generating…" : "Download PDF"}
            </button>

            <Link href="/dashboard">
              <span className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Back to Dashboard
              </span>
            </Link>
          </div>
        </div>

        {/* ── SCORE SUMMARY BAR ─────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overall Score</span>
            <span className="text-lg font-extrabold text-foreground">{correctCount}&nbsp;/&nbsp;{total}</span>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">{pct}%</span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" strokeWidth={2.5} />
              <span className="text-xs text-muted-foreground">
                Total Correct: <span className="font-semibold text-foreground">{correctCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {pct >= 75 ? "Excellent" : pct >= 60 ? "Good" : "Needs Work"}
              </span>
            </div>
          </div>
        </div>

        {/* ── QUESTION DEEP-DIVE HEADER ─────────────────────── */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Question Deep-Dive
        </p>

        {/* ── QUESTION CARDS ───────────────────────────────── */}
        {questions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No questions found for this exam.</p>
          </div>
        ) : (
          questions.map((q, i) => <QuestionCard key={q.id} q={q} index={i} />)
        )}

        {/* ── BOTTOM CTA ───────────────────────────────────── */}
        <div className="mt-2 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="mb-1 text-base font-bold text-foreground">Ready for your next challenge?</p>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            Continuous review is the key to mastering complex topics. Generate a new quiz to target your weak areas.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/test-portal">
              <span className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                <Sparkles className="h-4 w-4" />
                Generate New Quiz
              </span>
            </Link>
            <Link href="/dashboard">
              <span className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Return to Dashboard
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* ── HIDDEN PDF RENDER TARGET ──────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "794px",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <div ref={pdfRef}>
          <PdfContent questions={questions} summary={summary} pct={pct} />
        </div>
      </div>

    </DashboardLayout>
  );
}
