import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  UploadCloud,
  FileText,
  Presentation,
  ImageIcon,
  Music,
  Video,
  Type,
  Clock,
  ListOrdered,
  BarChart2,
  Info,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PenLine,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

const THEORY_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy (Recall & Comprehension)" },
  { value: "medium", label: "Medium (Application & Analysis)" },
  { value: "hard", label: "Hard (Synthesis & Evaluation)" },
  { value: "clinical_case", label: "Clinical Case" },
  { value: "real_life", label: "Real Life Problem Based" },
];

const FILE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md";

type MaterialTab = "files" | "text";
type GenState = "idle" | "generating" | "done" | "error";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp3", "m4a", "wav"].includes(ext)) return <Music className="h-3.5 w-3.5" />;
  if (["mp4", "mov", "webm"].includes(ext)) return <Video className="h-3.5 w-3.5" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <ImageIcon className="h-3.5 w-3.5" />;
  if (["ppt", "pptx"].includes(ext)) return <Presentation className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

function GeneratingPopup({
  state,
  errorMsg,
  jobId,
  onDone,
}: {
  state: GenState;
  errorMsg?: string;
  jobId?: string;
  onDone: () => void;
}) {
  const isDone = state === "done";
  const isError = state === "error";
  const isGenerating = state === "generating";

  const [subPhase, setSubPhase] = useState<"extracting" | "generating" | "saving">("extracting");
  const [displayed, setDisplayed] = useState(0);
  const targetRef = useRef(0);
  const displayedRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isGenerating || !jobId) {
      setSubPhase("extracting");
      setDisplayed(0);
      targetRef.current = 0;
      displayedRef.current = 0;
      return;
    }

    setSubPhase("extracting");
    setDisplayed(0);
    targetRef.current = 0;
    displayedRef.current = 0;

    tickRef.current = setInterval(() => {
      const target = targetRef.current;
      const current = displayedRef.current;
      if (current >= target) return;
      const gap = target - current;
      const step = Math.max(0.15, gap * 0.04);
      const next = Math.min(current + step, target);
      displayedRef.current = next;
      setDisplayed(Math.floor(next));
    }, 40);

    const token = getToken();
    const url = `${import.meta.env.BASE_URL}api/generate-theory-questions/progress/${jobId}?token=${encodeURIComponent(token ?? "")}`;
    const es = new EventSource(url);

    es.addEventListener("progress", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { phase: string; percent?: number };
      if (data.phase === "extracting") setSubPhase("extracting");
      else if (data.phase === "generating") setSubPhase("generating");
      else if (data.phase === "saving") setSubPhase("saving");
      if (typeof data.percent === "number") {
        targetRef.current = Math.max(targetRef.current, data.percent);
      }
    });

    es.addEventListener("done", () => {
      es.close();
      esRef.current = null;
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
    };

    esRef.current = es;

    return () => {
      es.close();
      esRef.current = null;
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isGenerating, jobId]);

  useEffect(() => {
    if (!isDone) return undefined;
    targetRef.current = 100;
    const finalTick = setInterval(() => {
      const current = displayedRef.current;
      if (current >= 100) {
        clearInterval(finalTick);
        setDisplayed(100);
        displayedRef.current = 100;
        return;
      }
      const step = Math.max(0.5, (100 - current) * 0.1);
      const next = Math.min(current + step, 100);
      displayedRef.current = next;
      setDisplayed(Math.floor(next));
    }, 30);
    return () => clearInterval(finalTick);
  }, [isDone]);

  function getSubtitle() {
    if (isError) return errorMsg ?? "Something went wrong. Please try again.";
    if (isDone) return "Your theory questions have been prepared. Proceeding to exam setup…";
    if (subPhase === "generating") return "Analysing your materials and crafting written-answer questions…";
    if (subPhase === "saving") return "Saving your questions…";
    return "Extracting content from your materials…";
  }

  function getTitle() {
    if (isError) return "Generation Failed";
    if (isDone) return "Questions Ready!";
    if (subPhase === "generating") return "Generating Theory Questions";
    if (subPhase === "saving") return "Saving Questions";
    return "Reading Your Materials";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isError ? (
            <AlertCircle className="h-8 w-8 text-destructive" />
          ) : isDone ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin" />
          )}
        </div>

        <h2 className="mb-1.5 text-lg font-bold text-foreground">
          {getTitle()}
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          {getSubtitle()}
        </p>

        {isError && (
          <button
            onClick={onDone}
            className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close &amp; Try Again
          </button>
        )}

        {!isError && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold tabular-nums text-primary">{isDone ? 100 : displayed}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-none"
                style={{ width: `${Math.max(2, isDone ? 100 : displayed)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-muted-foreground text-left">
          <span className="font-semibold text-primary">Tip: </span>
          More detailed study materials produce better, more targeted theory questions.
        </div>
      </div>
    </div>
  );
}

export default function TheoryPortal() {
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<MaterialTab>("files");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pastedText, setPastedText] = useState("");

  const [duration, setDuration] = useState(30);
  const [numQuestions, setNumQuestions] = useState(5);
  const [mode, setMode] = useState("easy");

  const [genState, setGenState] = useState<GenState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [genJobId, setGenJobId] = useState<string | undefined>();

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      file: f,
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  async function handleGenerate() {
    const hasSource = files.length > 0 || pastedText.trim().length >= 30;
    if (!hasSource) {
      setErrorMsg("Please upload at least one file or paste at least 30 characters of text.");
      setGenState("error");
      return;
    }

    const jobId = crypto.randomUUID();
    setGenJobId(jobId);
    setErrorMsg(undefined);
    setGenState("generating");

    try {
      const token = getToken();
      const formData = new FormData();

      for (const f of files) {
        formData.append("files", f.file);
      }
      if (pastedText.trim()) {
        formData.append("pastedText", pastedText.trim());
      }

      formData.append("duration", String(duration));
      formData.append("numQuestions", String(numQuestions));
      formData.append("mode", mode);
      formData.append("jobId", jobId);

      const res = await fetch(`${import.meta.env.BASE_URL}api/generate-theory-questions`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = (body as { error?: string } | null)?.error ?? (res.status === 413
          ? "Your file is too large. Please upload a smaller file or paste the text directly."
          : res.status === 401
          ? "Your session has expired. Please log in again."
          : `Server error (${res.status}). Please try again.`);
        throw new Error(msg);
      }

      const data = await res.json() as {
        theoryExamId: number;
        questionCount: number;
        duration: number;
        mode: string;
        caseScenario: string | null;
        questions: Array<{ orderIndex: number; questionText: string }>;
      };

      localStorage.setItem(
        "qym_theory_config",
        JSON.stringify({
          theoryExamId: data.theoryExamId,
          questions: data.questionCount,
          duration: data.duration,
          mode: data.mode,
          caseScenario: data.caseScenario,
          questionsData: data.questions,
        })
      );
      localStorage.removeItem("qym_theory_answers");
      localStorage.removeItem("qym_theory_timer");
      localStorage.removeItem("qym_theory_result");

      setGenState("done");
      setTimeout(() => {
        navigate("/theory-get-ready");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate questions.";
      setErrorMsg(msg);
      setGenState("error");
    }
  }

  function handlePopupDone() {
    setGenState("idle");
    setErrorMsg(undefined);
    setGenJobId(undefined);
  }

  function handleNumChange(val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n)) { setNumQuestions(0); return; }
    setNumQuestions(Math.max(1, Math.min(10, n)));
  }

  function handleDurationChange(val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n)) { setDuration(0); return; }
    setDuration(Math.max(1, n));
  }

  const isGenerating = genState === "generating" || genState === "done";

  return (
    <DashboardLayout>
      {genState !== "idle" && (
        <GeneratingPopup state={genState} errorMsg={errorMsg} jobId={genJobId} onDone={handlePopupDone} />
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Generate Theory Exam
              </h1>
              <p className="text-sm text-muted-foreground">
                Upload your study material and let our AI generate written-answer questions for you to answer in your own words.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* STEP 1 — PROVIDE MATERIAL */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Step 1: Provide Material</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload files or paste your study notes
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
                  <button
                    onClick={() => setTab("files")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === "files"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Files
                  </button>
                  <button
                    onClick={() => setTab("text")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === "text"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Type className="h-3.5 w-3.5" />
                    Text
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {tab === "files" && (
                <div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center transition-colors ${
                      dragging
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-border bg-muted/30 hover:border-amber-400/50 hover:bg-amber-50/30"
                    }`}
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, Word (.docx), PPTX, or plain text files
                    </p>
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept={FILE_ACCEPT}
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </div>

                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {files.map((f) => (
                        <span
                          key={f.id}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          {fileIcon(f.name)}
                          <span className="max-w-[180px] truncate">{f.name}</span>
                          <span className="text-muted-foreground">({formatBytes(f.size)})</span>
                          <button
                            onClick={() => removeFile(f.id)}
                            className="ml-1 rounded text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "text" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Paste your study notes or lecture content
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your lecture notes, textbook excerpts, or any study material here…"
                    rows={12}
                    className="w-full resize-y rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {pastedText.trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
              )}

              <div className="flex gap-3 rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-900/10">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Theory Exam — Written Answers</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Unlike MCQs, theory questions require you to type detailed written answers. Your responses will be semantically scored by AI based on key points.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 — CONFIG */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Step 2: Config</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adjust exam parameters
              </p>
            </div>

            <div className="p-6 space-y-6">

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Quiz Duration (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration || ""}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Suggested: {numQuestions * 5} minutes ({numQuestions} questions × 5 min each)
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ListOrdered className="h-3.5 w-3.5 text-amber-600" />
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => handleNumChange(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} question{n !== 1 ? "s" : ""}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum 10 questions per theory exam
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <BarChart2 className="h-3.5 w-3.5 text-amber-600" />
                  Difficulty Level
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {THEORY_DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {(mode === "clinical_case" || mode === "real_life") && (
                  <p className="mt-1.5 text-xs text-amber-600 font-medium">
                    A scenario will be displayed at the top. All questions relate to it.
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-foreground">{duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span className="font-medium text-foreground">{numQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Score</span>
                  <span className="font-medium text-foreground">{numQuestions * 5} marks</span>
                </div>
                <div className="flex justify-between">
                  <span>Mode</span>
                  <span className="font-medium text-foreground">
                    {THEORY_DIFFICULTY_OPTIONS.find((o) => o.value === mode)?.label.split(" ")[0]}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? "Generating…" : "Generate Questions"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
