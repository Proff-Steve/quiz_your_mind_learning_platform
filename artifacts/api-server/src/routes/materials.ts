import { Router, type Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { toFile } from "openai";
import { db, materialsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { verifyToken } from "../lib/jwt.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import mammoth from "mammoth";

const materialsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "m4a", "ogg", "webm", "flac", "aac", "opus", "mp4", "mov"]);
const AUDIO_MIME_PREFIXES = ["audio/", "video/webm", "video/ogg", "video/mp4", "video/quicktime", "video/x-matroska", "video/avi"];

function isAudioFile(file: Express.Multer.File): boolean {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  if (AUDIO_EXTENSIONS.has(ext)) return true;
  return AUDIO_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
}

async function transcribeAudio(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "mp3";
  const mimeType = file.mimetype || `audio/${ext}`;
  const audioFile = await toFile(file.buffer, file.originalname, { type: mimeType });
  const result = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  return result.text.trim();
}

async function extractText(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "pdf") {
    try {
      const parsed = await pdfParse(file.buffer);
      const text = parsed.text.trim();
      if (!text) throw new Error("PDF parsed but contained no extractable text.");
      return text;
    } catch (err) {
      throw new Error(
        `Could not extract text from "${file.originalname}": ${err instanceof Error ? err.message : "PDF parse failed"}`
      );
    }
  }

  if (ext === "docx") {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const text = result.value.trim();
      if (!text) throw new Error("Word document contained no extractable text.");
      return text;
    } catch (err) {
      throw new Error(
        `Could not extract text from "${file.originalname}": ${err instanceof Error ? err.message : "DOCX parse failed"}`
      );
    }
  }

  if (["txt", "md"].includes(ext)) {
    return file.buffer.toString("utf-8").trim();
  }

  if (isAudioFile(file)) {
    try {
      return await transcribeAudio(file);
    } catch (err) {
      throw new Error(
        `Could not transcribe audio "${file.originalname}": ${err instanceof Error ? err.message : "Transcription failed"}`
      );
    }
  }

  return `[${file.originalname}] — binary content (${Math.round(file.size / 1024)} KB, not directly extractable as text)`;
}

type ProgressEntry = { res: Response; userId: number };
const progressClients = new Map<string, ProgressEntry>();

function emitProgress(jobId: string, userId: number, phase: string) {
  const entry = progressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: progress\ndata: ${JSON.stringify({ phase })}\n\n`);
  }
}

function closeProgress(jobId: string, userId: number) {
  const entry = progressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: done\ndata: {}\n\n`);
    progressClients.delete(jobId);
  }
}

materialsRouter.get("/materials/progress/:jobId", (req: AuthRequest, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.user = verifyToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  const jobId = String(req.params.jobId);
  const userId = req.user!.userId;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("event: connected\ndata: {}\n\n");

  progressClients.set(jobId, { res, userId });

  req.on("close", () => {
    progressClients.delete(jobId);
  });
});

materialsRouter.get("/materials", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const rows = await db
      .select({
        id: materialsTable.id,
        fileName: materialsTable.fileName,
        fileType: materialsTable.fileType,
        fileSize: materialsTable.fileSize,
        createdAt: materialsTable.createdAt,
      })
      .from(materialsTable)
      .where(eq(materialsTable.userId, userId))
      .orderBy(materialsTable.createdAt);

    res.json({ materials: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch materials.", detail: message });
  }
});

materialsRouter.post(
  "/materials",
  requireAuth,
  upload.array("files"),
  async (req: AuthRequest, res) => {
    const jobId = (req.body as Record<string, string>).jobId as string | undefined;

    try {
      const userId = req.user!.userId;
      const files = (req.files ?? []) as Express.Multer.File[];

      if (!files.length) {
        res.status(400).json({ error: "No files uploaded." });
        return;
      }

      if (jobId) {
        emitProgress(jobId, userId, "uploading");
      }

      const saved: { id: number; fileName: string }[] = [];
      const errors: { fileName: string; error: string }[] = [];

      for (const file of files) {
        try {
          if (jobId && isAudioFile(file)) {
            emitProgress(jobId, userId, "transcribing");
          }
          const textContent = await extractText(file);
          if (jobId) {
            emitProgress(jobId, userId, "saving");
          }
          const [row] = await db
            .insert(materialsTable)
            .values({
              userId,
              fileName: file.originalname,
              fileType: file.mimetype,
              fileSize: file.size,
              textContent,
            })
            .returning({ id: materialsTable.id, fileName: materialsTable.fileName });

          saved.push(row);
        } catch (err) {
          errors.push({
            fileName: file.originalname,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      if (jobId) {
        closeProgress(jobId, userId);
      }

      if (saved.length === 0 && errors.length > 0) {
        res.status(400).json({ error: errors[0].error, errors });
        return;
      }

      res.json({ ok: true, saved, errors: errors.length > 0 ? errors : undefined });
    } catch (err: unknown) {
      if (jobId) {
        const userId = req.user?.userId;
        if (userId !== undefined) closeProgress(jobId, userId);
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Could not save material.", detail: message });
    }
  },
);

materialsRouter.delete("/materials/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Invalid material id." });
      return;
    }

    await db
      .delete(materialsTable)
      .where(and(eq(materialsTable.id, id), eq(materialsTable.userId, userId)));

    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not delete material.", detail: message });
  }
});

export default materialsRouter;
