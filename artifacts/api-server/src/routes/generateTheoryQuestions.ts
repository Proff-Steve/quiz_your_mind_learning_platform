import { Router, type Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";
import { db, theoryExamsTable, theoryQuestionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { verifyToken } from "../lib/jwt.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

type TheoryMode = "easy" | "medium" | "hard" | "clinical_case" | "real_life";

/* ── SSE PROGRESS ─────────────────────────────────────────────────────────── */

type GenProgressEntry = { res: Response; userId: number };
const genProgressClients = new Map<string, GenProgressEntry>();

function emitGenProgress(jobId: string, userId: number, phase: string, percent?: number) {
  const entry = genProgressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: progress\ndata: ${JSON.stringify({ phase, percent })}\n\n`);
  }
}

function closeGenProgress(jobId: string, userId: number) {
  const entry = genProgressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: done\ndata: {}\n\n`);
    genProgressClients.delete(jobId);
  }
}

router.get("/generate-theory-questions/progress/:jobId", (req: AuthRequest, res) => {
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

  genProgressClients.set(jobId, { res, userId });

  req.on("close", () => {
    genProgressClients.delete(jobId);
  });
});

/* ── SYSTEM PROMPTS ───────────────────────────────────────────────────────── */

function buildTheorySystemPrompt(mode: TheoryMode, numQuestions: number): string {
  const easyVerbs = `
EASY MODE — use these question starters/action verbs:
- Define → ask for the exact meaning of a term or concept
- List → ask the student to mention/enumerate key points
- Describe → ask for a sequential or detailed explanation
- Explain → ask for reasons, mechanisms, or causes
- Discuss → ask for a broad explanation including details, advantages, disadvantages, and significance
- Compare/Contrast → ask to show similarities and differences
- Outline → ask for a summarized, organized set of points
- Enumerate → ask to mention items one after another
- State → ask to declare a fact or principle
- "What is…" — ask for definitions or descriptions
- "Comment on…" — ask for observations and analysis
- "Show how…" — ask to demonstrate a process
- "Explain why…" — ask for reasoning
- "How many…" — ask for quantitative answers`;

  const mediumRules = `
MEDIUM MODE — incorporate these question styles and concepts randomly across questions:
- Negative/Exception-Based (e.g. "Which of the following is NOT…", "All EXCEPT…")
- Absolute Terms (Always, Never, Only, Must)
- Vague/Qualifier (Usually, Commonly, Rarely, May, Can be)
- Comparative (More likely, Less likely, Most common)
- Causation vs Association
- Time/Sequence (Early vs Late, Acute vs Chronic)
- Double Negatives
- Clinical Logic (Best next step, Most appropriate action)
- Numerical/Threshold
- Partially True statements
- Cause vs Effect Reversal
- Mechanism vs Outcome
- Priority/Order questions
Also use these written-answer formats:
- Assertion–Reason (give a statement and a reason; ask if both are correct and if the reason explains the assertion)
- Compare and contrast two concepts
- Rank or order steps in a process
- Explain the mechanism underlying a phenomenon
- Discuss advantages and disadvantages
- Describe a real-world application of a concept`;

  const hardRules = `
HARD MODE — same as Medium mode but all questions must be highly application-based, requiring:
- Synthesis of multiple concepts across topics
- Critical thinking and analysis
- Real-world application (not just recall)
- Evaluation of evidence or data
- Problem-solving under constraints
- Justification of decisions
- Prediction of outcomes based on principles`;

  const clinicalCaseRules = `
CLINICAL CASE MODE — Generate ONE detailed clinical case scenario followed by ${numQuestions} related questions.
The scenario must include: patient demographics (age, sex, occupation if relevant), chief complaint, history of present illness, relevant past medical/surgical/family history, current medications, key vital signs, and 1–2 relevant investigation results.
All questions must relate directly to the case scenario and test:
- Diagnosis and differential diagnosis
- Next steps in management
- Treatment plans and rationale
- Pathophysiology and mechanisms
- Why certain interventions were or were not appropriate
Randomly incorporate some Medium mode question styles into the questions.`;

  const realLifeRules = `
REAL LIFE PROBLEM BASED MODE — Generate ONE detailed real-life problem-based scenario followed by ${numQuestions} related questions.
The scenario must include: environmental context, specific resources available, constraints and limitations, stakeholders involved, and the core problem to solve.
All questions must relate directly to the scenario and test:
- Problem identification and root cause analysis
- Resource allocation and prioritization
- Decision-making under uncertainty
- Creative solutions within constraints
- Risk assessment and mitigation
- Implementation steps
Randomly incorporate some Medium mode question styles into the questions.`;

  let modeInstructions = "";
  let isScenarioBased = false;

  if (mode === "easy") {
    modeInstructions = easyVerbs;
  } else if (mode === "medium") {
    modeInstructions = mediumRules;
  } else if (mode === "hard") {
    modeInstructions = hardRules;
  } else if (mode === "clinical_case") {
    modeInstructions = clinicalCaseRules;
    isScenarioBased = true;
  } else if (mode === "real_life") {
    modeInstructions = realLifeRules;
    isScenarioBased = true;
  }

  if (isScenarioBased) {
    return `You are an expert academic examiner creating theory/written-answer exam questions.

${modeInstructions}

CRITICAL OUTPUT FORMAT (JSON only, no markdown, no extra text):
{
  "scenario": "<The full case/problem scenario text here>",
  "questions": [
    {
      "question_text": "<The question text>",
      "model_answer": "<A comprehensive model answer that a top student would give, covering all key points>"
    }
  ]
}

Rules:
- Generate exactly ${numQuestions} questions
- Each model_answer must be comprehensive and cover all key points an examiner would award marks for
- Questions must be derived from and answerable from the provided study material
- Do not include any text outside the JSON object`;
  }

  return `You are an expert academic examiner creating theory/written-answer exam questions.

${modeInstructions}

CRITICAL OUTPUT FORMAT (JSON only, no markdown, no extra text):
[
  {
    "question_text": "<The question text>",
    "model_answer": "<A comprehensive model answer that a top student would give, covering all key points>"
  }
]

Rules:
- Generate exactly ${numQuestions} questions
- Each model_answer must be comprehensive and cover all key points an examiner would award marks for
- Questions must be derived from and answerable from the provided study material
- Vary question types according to the mode rules above
- Do not include any text outside the JSON array`;
}

async function extractTextFromBuffer(buffer: Buffer, mimetype: string, originalname: string): Promise<string> {
  const ext = originalname.split(".").pop()?.toLowerCase() ?? "";

  if (mimetype === "application/pdf" || ext === "pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || ext === "pptx") {
    const zip = await JSZip.loadAsync(buffer);
    const texts: string[] = [];
    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.startsWith("ppt/slides/slide") && filename.endsWith(".xml")) {
        const xml = await file.async("string");
        const text = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text) texts.push(text);
      }
    }
    return texts.join("\n");
  }

  if (["txt", "md", "csv"].includes(ext)) {
    return buffer.toString("utf-8");
  }

  return "";
}

router.post("/generate-theory-questions", requireAuth, upload.array("files", 20), async (req: AuthRequest, res) => {
  const jobId = (req.body as Record<string, string>).jobId as string | undefined;

  try {
    const userId = req.user!.userId;
    const files = (req.files ?? []) as Express.Multer.File[];
    const pastedText = (req.body.pastedText as string | undefined) ?? "";
    const numQuestions = Math.min(10, Math.max(1, parseInt(req.body.numQuestions as string, 10) || 5));
    const duration = Math.max(1, parseInt(req.body.duration as string, 10) || 30);
    const mode = (req.body.mode as TheoryMode) || "easy";

    if (jobId) emitGenProgress(jobId, userId, "extracting", 10);

    const textParts: string[] = [];

    if (pastedText.trim()) {
      textParts.push(pastedText.trim());
    }

    const extractedParts = await Promise.all(
      files.map(async (file) => {
        try {
          const extracted = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);
          return extracted.trim() || null;
        } catch {
          return null;
        }
      })
    );
    for (const part of extractedParts) {
      if (part) textParts.push(part);
    }

    const combinedText = textParts.join("\n\n");

    if (combinedText.trim().length < 50) {
      res.status(400).json({ error: "Not enough study material extracted. Please provide more content." });
      return;
    }

    const truncatedMaterial = combinedText.length > 40000 ? combinedText.slice(0, 40000) : combinedText;

    if (jobId) emitGenProgress(jobId, userId, "generating", 30);

    const systemPrompt = buildTheorySystemPrompt(mode, numQuestions);
    const userMessage = `Study material:\n\n${truncatedMaterial}\n\nGenerate exactly ${numQuestions} written-answer theory questions based on this material.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: Math.min(8000, Math.max(2000, numQuestions * 600)),
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (!jsonMatch) {
      res.status(500).json({ error: "AI did not return valid questions. Please try again." });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]) as
      | Array<{ question_text: string; model_answer: string }>
      | { scenario: string; questions: Array<{ question_text: string; model_answer: string }> };

    let questionsArray: Array<{ question_text: string; model_answer: string }>;
    let caseScenario: string | null = null;

    if (Array.isArray(parsed)) {
      questionsArray = parsed;
    } else {
      caseScenario = parsed.scenario ?? null;
      questionsArray = parsed.questions ?? [];
    }

    questionsArray = questionsArray.filter((q) => q.question_text && q.model_answer).slice(0, numQuestions);

    if (questionsArray.length === 0) {
      res.status(500).json({ error: "No valid questions were generated. Please try again." });
      return;
    }

    if (jobId) emitGenProgress(jobId, userId, "saving", 85);

    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));
    const title = `Theory Exam — ${user?.name ?? "Student"} — ${new Date().toLocaleDateString()}`;

    const [theoryExam] = await db.insert(theoryExamsTable).values({
      userId,
      title,
      durationMinutes: duration,
      mode,
      studyMaterialText: truncatedMaterial,
      caseScenario,
    }).returning({ id: theoryExamsTable.id });

    const theoryExamId = theoryExam.id;

    await db.insert(theoryQuestionsTable).values(
      questionsArray.map((q, i) => ({
        theoryExamId,
        questionText: q.question_text,
        modelAnswer: q.model_answer,
        orderIndex: i,
      }))
    );

    const oldExams = await db
      .select({ id: theoryExamsTable.id })
      .from(theoryExamsTable)
      .where(eq(theoryExamsTable.userId, userId))
      .orderBy(desc(theoryExamsTable.createdAt));

    if (oldExams.length > 10) {
      await Promise.all(
        oldExams.slice(10).map((old) =>
          db.delete(theoryExamsTable).where(eq(theoryExamsTable.id, old.id))
        )
      );
    }

    if (jobId) closeGenProgress(jobId, userId);

    res.json({
      theoryExamId,
      questionCount: questionsArray.length,
      duration,
      mode,
      caseScenario,
      questions: questionsArray.map((q, i) => ({ orderIndex: i, questionText: q.question_text })),
    });
  } catch (err: unknown) {
    if (jobId) {
      const authReq = req as AuthRequest;
      const uid = authReq.user?.userId;
      if (uid !== undefined) closeGenProgress(jobId, uid);
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
