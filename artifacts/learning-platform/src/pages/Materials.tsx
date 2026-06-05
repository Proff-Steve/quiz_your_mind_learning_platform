import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  FileText,
  Presentation,
  ImageIcon,
  Music,
  Video,
  Trash2,
  Loader2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";

interface Material {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

const FILE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.m4a,.wav,.mp4,.mov,.webm";

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "m4a", "ogg", "webm", "flac", "aac", "opus", "mp4", "mov"]);

function isAudioFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.has(ext) || file.type.startsWith("audio/") || file.type.startsWith("video/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp3", "m4a", "wav"].includes(ext)) return <Music className="h-5 w-5" />;
  if (["mp4", "mov", "webm"].includes(ext)) return <Video className="h-5 w-5" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <ImageIcon className="h-5 w-5" />;
  if (["ppt", "pptx"].includes(ext)) return <Presentation className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

async function fetchMaterials(): Promise<Material[]> {
  const token = getToken();
  const res = await fetch(`${import.meta.env.BASE_URL}api/materials`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load materials");
  const data = await res.json() as { materials: Material[] };
  return data.materials;
}

async function uploadMaterials({ files, jobId }: { files: File[]; jobId: string | null }): Promise<void> {
  const token = getToken();
  const formData = new FormData();
  for (const f of files) formData.append("files", f);
  if (jobId) formData.append("jobId", jobId);
  const res = await fetch(`${import.meta.env.BASE_URL}api/materials`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Upload failed");
  }
}

async function deleteMaterial(id: number): Promise<void> {
  const token = getToken();
  const res = await fetch(`${import.meta.env.BASE_URL}api/materials/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Delete failed");
}

export default function Materials() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState<"uploading" | "transcribing" | "saving" | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["materials"],
    queryFn: fetchMaterials,
  });

  function cleanupEventSource() {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, []);

  const uploadMutation = useMutation({
    mutationFn: uploadMaterials,
    onSuccess: () => {
      setUploadError(null);
      setUploadPhase(null);
      cleanupEventSource();
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      setUploadPhase(null);
      cleanupEventSource();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  function openProgressSSE(jobId: string) {
    const token = getToken();
    const url = `${import.meta.env.BASE_URL}api/materials/progress/${jobId}?token=${encodeURIComponent(token ?? "")}`;
    const es = new EventSource(url);

    es.addEventListener("progress", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { phase: string };
      if (data.phase === "transcribing") setUploadPhase("transcribing");
      else if (data.phase === "saving") setUploadPhase("saving");
    });

    es.addEventListener("done", () => {
      es.close();
      eventSourceRef.current = null;
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
    };

    eventSourceRef.current = es;
  }

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setUploadError(null);
    cleanupEventSource();

    const files = Array.from(list);
    const hasAudio = files.some(isAudioFile);

    const jobId = hasAudio ? crypto.randomUUID() : null;
    setUploadPhase("uploading");

    if (jobId) {
      openProgressSSE(jobId);
    }

    uploadMutation.mutate({ files, jobId });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const materials = data ?? [];

  function getPhaseLabel() {
    if (uploadPhase === "transcribing") return "Transcribing audio…";
    if (uploadPhase === "saving") return "Saving…";
    return "Uploading…";
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and store your study files here. You can use them to generate quizzes from the Question Generation page.
          </p>

        </div>

        {/* UPLOAD ZONE */}
        <div className="mb-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">Upload Files</h2>
            <p className="text-xs text-muted-foreground mt-0.5">PDF, Word (.docx), PPTX, Images, Audio or Video files</p>
          </div>
          <div className="p-6">
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
              {uploadMutation.isPending ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              ) : (
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-7 w-7" />
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">
                {uploadMutation.isPending ? getPhaseLabel() : "Click to upload or drag and drop"}
              </p>
              {uploadMutation.isPending && uploadPhase === "transcribing" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  This may take a moment for longer recordings
                </p>
              )}
              {!uploadMutation.isPending && (
                <p className="mt-1 text-xs text-muted-foreground">PDF, Word (.docx), PPTX, Images (JPG/PNG), Audio (MP3) or Video (MP4/MOV/WEBM)</p>
              )}
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploadError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* FILE LIST */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              Saved Files
              {materials.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {materials.length}
                </span>
              )}
            </h2>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="m-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load your materials.
            </div>
          )}

          {!isLoading && !isError && materials.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No files yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Upload your first file above.
              </p>
            </div>
          )}

          {!isLoading && !isError && materials.length > 0 && (
            <ul className="divide-y divide-border">
              {materials.map((mat) => (
                <li
                  key={mat.id}
                  className="flex items-center gap-4 px-6 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {fileIcon(mat.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{mat.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(mat.fileSize)} · {formatDate(mat.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(mat.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete file"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
