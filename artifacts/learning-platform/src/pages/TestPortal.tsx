import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import {
  UploadCloud,
  FileText,
  Presentation,
  ImageIcon,
  Music,
  Video,
  Youtube,
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
  Users,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

const DIFFICULTY_OPTIONS = [
  { value: "easy",    label: "Easy (Recall & Recognition)" },
  { value: "medium",  label: "Medium (Application Focus)" },
  { value: "hard",    label: "Hard (Critical Thinking)" },
  { value: "usmle",  label: "USMLE Standard" },
  { value: "uccsms", label: "UCCSMS Standard" },
  { value: "nmc",    label: "NMC Standard" },
];

const FILE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.m4a,.wav,.mp4,.mov,.webm";

type MaterialTab = "files" | "text";
type GeneratingState = "idle" | "generating" | "done" | "error";

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
  warnings,
  jobId,
  onDone,
}: {
  state: GeneratingState;
  errorMsg?: string;
  warnings?: string[];
  jobId?: string;
  onDone: () => void;
}) {
  const isDone = state === "done";
  const isError = state === "error";
  const isGenerating = state === "generating";

  const [subPhase, setSubPhase] = useState<"uploading" | "reading" | "transcribing" | "generating" | "saving">("uploading");
  const [displayed, setDisplayed] = useState(0);
  const targetRef = useRef(0);
  const displayedRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isGenerating || !jobId) {
      setSubPhase("uploading");
      setDisplayed(0);
      targetRef.current = 0;
      displayedRef.current = 0;
      return;
    }

    setSubPhase("uploading");
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
    const url = `${import.meta.env.BASE_URL}api/generate-questions/progress/${jobId}?token=${encodeURIComponent(token ?? "")}`;
    const es = new EventSource(url);

    es.addEventListener("progress", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { phase: string; percent?: number };
      if (data.phase === "reading") setSubPhase("reading");
      else if (data.phase === "transcribing") setSubPhase("transcribing");
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
    if (isDone) {
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
    }
  }, [isDone]);

  function getSubtitle() {
    if (isError) return errorMsg ?? "Something went wrong. Please try again.";
    if (isDone) return "Your questions have been saved. Preparing your exam…";
    if (subPhase === "reading") return "Reading text from your images (printed & handwritten)…";
    if (subPhase === "transcribing") return "Transcribing your audio recording…";
    if (subPhase === "generating") return "Analysing your materials and crafting your custom exam…";
    if (subPhase === "saving") return "Saving your questions…";
    return "Uploading your materials…";
  }

  function getTitle() {
    if (isError) return "Generation Failed";
    if (isDone) return "Questions Ready!";
    if (subPhase === "reading") return "Reading Image Text";
    if (subPhase === "transcribing") return "Transcribing Audio";
    if (subPhase === "generating") return "Generating Your Questions";
    if (subPhase === "saving") return "Saving Questions";
    return "Generating Your Questions";
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

        {isDone && warnings && warnings.length > 0 && (
          <div className="mb-4 rounded-lg border border-yellow-300/40 bg-yellow-50/60 px-4 py-3 text-xs text-yellow-800 text-left dark:bg-yellow-900/20 dark:text-yellow-200">
            <p className="mb-1 font-semibold">Some sources couldn't be fully read:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {isError && (
          <button
            onClick={onDone}
            className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Close & Try Again
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
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(2, isDone ? 100 : displayed)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-muted-foreground text-left">
          <span className="font-semibold text-primary">Tip: </span>
          Longer and more detailed materials produce better, more targeted questions.
        </div>
      </div>
    </div>
  );
}

export default function TestPortal() {
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<MaterialTab>("files");
  const [showYoutube, setShowYoutube] = useState(false);

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [pastedText, setPastedText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [focusArea, setFocusArea] = useState("");

  const [duration, setDuration] = useState(45);
  const [numQuestions, setNumQuestions] = useState(20);
  const [difficulty, setDifficulty] = useState("medium");

  const [generatingState, setGeneratingState] = useState<GeneratingState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [genWarnings, setGenWarnings] = useState<string[]>([]);
  const [useMaterial, setUseMaterial] = useState(false);
  const [genJobId, setGenJobId] = useState<string | undefined>();

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function handleJoinExam() {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setJoinError("Please enter a valid exam code.");
      return;
    }
    const token = getToken();
    if (!token) {
      setJoinError("You must be logged in to join an exam.");
      return;
    }
    setJoinLoading(true);
    setJoinError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/exam-share/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as {
        examId?: number;
        durationMinutes?: number;
        difficulty?: string;
        questionCount?: number;
        code?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Invalid code");

      localStorage.setItem(
        "qym_quiz_config",
        JSON.stringify({
          examId: data.examId,
          questions: data.questionCount ?? 0,
          duration: data.durationMinutes ?? 60,
          difficulty: data.difficulty ?? "medium",
        })
      );
      localStorage.setItem("qym_share_code", data.code ?? code);
      navigate("/get-ready");
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : "Could not join exam.");
    } finally {
      setJoinLoading(false);
    }
  }

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
    const hasSource = useMaterial || files.length > 0 || pastedText.trim().length >= 30 || youtubeUrl.trim().length > 0;
    if (!hasSource) {
      setErrorMsg("Please upload at least one file, paste at least 30 characters of text, enter a YouTube URL, or check \"Generate from my material\".");
      setGeneratingState("error");
      return;
    }

    setErrorMsg(undefined);
    setGenWarnings([]);
    const jobId = crypto.randomUUID();
    setGenJobId(jobId);
    setGeneratingState("generating");

    try {
      const token = getToken();
      const formData = new FormData();

      if (!useMaterial) {
        for (const f of files) {
          formData.append("files", f.file);
        }
        if (pastedText.trim()) {
          formData.append("pastedText", pastedText.trim());
        }
        if (youtubeUrl.trim()) {
          formData.append("youtubeUrl", youtubeUrl.trim());
        }
      }

      formData.append("useMaterial", String(useMaterial));
      formData.append("duration", String(duration));
      formData.append("numQuestions", String(numQuestions));
      formData.append("difficulty", difficulty);
      formData.append("jobId", jobId);
      if (focusArea.trim()) {
        formData.append("focusArea", focusArea.trim());
      }

      const res = await fetch(`${import.meta.env.BASE_URL}api/generate-questions`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.error ?? (res.status === 413
          ? "Your file is too large. Please upload a smaller file or paste the text directly."
          : res.status === 401
          ? "Your session has expired. Please log in again."
          : `Server error (${res.status}). Please try again.`);
        throw new Error(msg);
      }

      const data = await res.json() as {
        examId: number;
        questionCount: number;
        duration: number;
        difficulty: string;
        warnings?: string[];
      };

      localStorage.setItem(
        "qym_quiz_config",
        JSON.stringify({
          examId: data.examId,
          questions: data.questionCount,
          duration: data.duration,
          difficulty: data.difficulty,
        })
      );

      if (data.warnings && data.warnings.length > 0) {
        setGenWarnings(data.warnings);
      }

      setGeneratingState("done");
      setTimeout(() => {
        navigate("/get-ready");
      }, data.warnings && data.warnings.length > 0 ? 4000 : 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate questions.";
      setErrorMsg(msg);
      setGeneratingState("error");
    }
  }

  function handlePopupDone() {
    setGeneratingState("idle");
    setErrorMsg(undefined);
  }

  function handleNumChange(val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n)) { setNumQuestions(0); return; }
    setNumQuestions(Math.max(1, Math.min(200, n)));
  }

  function handleDurationChange(val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n)) { setDuration(0); return; }
    setDuration(Math.max(1, n));
  }

  const suggestedDuration = Math.max(numQuestions, 10);
  const isGenerating = generatingState === "generating" || generatingState === "done";

  return (
    <DashboardLayout>
      {generatingState !== "idle" && (
        <GeneratingPopup
          state={generatingState}
          errorMsg={errorMsg}
          warnings={genWarnings.length > 0 ? genWarnings : undefined}
          jobId={genJobId}
          onDone={handlePopupDone}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Generate Study Quiz
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your course materials and let our AI create a custom practice exam tailored to your content.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* STEP 1 — PROVIDE MATERIAL */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Step 1: Provide Material</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select how you want to provide your study content
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

                <button
                  onClick={() => setShowYoutube((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    showYoutube
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Youtube className="h-3.5 w-3.5" />
                  Audio &amp; YouTube link
                </button>
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
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, Word (.docx), PPTX, Images (JPG/PNG), Audio (MP3) or Video (MP4/MOV/WEBM)
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
                    className="w-full resize-y rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {pastedText.trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>
              )}

              {showYoutube && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Youtube className="h-3.5 w-3.5 text-primary" />
                      YouTube Video Link
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…"
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paste a YouTube lecture or tutorial link. The video must have auto-generated or manual captions enabled.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Music className="h-3.5 w-3.5 text-primary" />
                      Audio / Video File (MP3 / M4A / WAV / MP4 / MOV / WEBM)
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      <UploadCloud className="h-4 w-4 shrink-0 text-primary" />
                      Click to upload an audio or video file
                      <input
                        type="file"
                        accept=".mp3,.m4a,.wav,.mp4,.mov,.webm"
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-primary">AI Tip for Better Questions</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    For best results, ensure your materials are clearly formatted. The AI works best with structured lecture notes, textbook chapters, and detailed presentation slides.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Focus Area <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Tell the AI which topic, section, or concept you want most questions to come from. Leave blank to generate from all parts of your materials randomly.
                </p>
                <textarea
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. 'Cellular respiration and ATP synthesis' or 'Chapter 4: The French Revolution' or 'Pharmacokinetics of antibiotics'..."
                  rows={3}
                  className="w-full resize-y rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* STEP 2 — CONFIG */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Step 2: Config</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adjust the quiz parameters
              </p>
            </div>

            <div className="p-6 space-y-6">

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Quiz Duration (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration || ""}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Suggested for this length: {suggestedDuration} minutes
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ListOrdered className="h-3.5 w-3.5 text-primary" />
                  Number of Questions
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={numQuestions || ""}
                  onChange={(e) => handleNumChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum of 200 questions per quiz
                </p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <BarChart2 className="h-3.5 w-3.5 text-primary" />
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-border" />

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <input
                  type="checkbox"
                  checked={useMaterial}
                  onChange={(e) => setUseMaterial(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Generate from my material</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Use files saved in My Materials instead of uploading new ones.
                  </p>
                </div>
              </label>

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
                  <span>Difficulty</span>
                  <span className="font-medium text-foreground">
                    {DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.label.split(" ")[0]}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGenerating ? "Generating…" : "Generate Questions"}
              </button>

              <div className="relative flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={() => { setShowJoinDialog(true); setJoinError(null); setJoinCode(""); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all"
              >
                <Users className="h-4 w-4 text-primary" />
                Join Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── JOIN EXAM DIALOG ─────────────────────────────── */}
      {showJoinDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <button
              onClick={() => setShowJoinDialog(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-bold text-foreground">Join an Exam</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the 6-character code shared by your classmate to attempt the same exam.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleJoinExam(); }}
                placeholder="e.g. AB3X9K"
                maxLength={8}
                className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-xl font-extrabold tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />

              {joinError && (
                <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {joinError}
                </div>
              )}

              <button
                onClick={handleJoinExam}
                disabled={joinLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {joinLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {joinLoading ? "Joining…" : "Join Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
