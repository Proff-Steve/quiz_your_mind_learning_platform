import { Router } from "express";
import multer from "multer";
import { db, clinicalCasesTable, caseQuestionsTable, userCaseAttemptsTable, usersTable } from "@workspace/db";
import { eq, and, lt, desc, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const clinicalCaseRouter = Router();

function getTodayUtc(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function requireAdmin(req: AuthRequest, res: Parameters<typeof requireAuth>[1], next: Parameters<typeof requireAuth>[2]): void {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Admin functionality not configured." });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== adminSecret) {
    res.status(401).json({ error: "Unauthorized. Invalid admin secret." });
    return;
  }
  next();
}

clinicalCaseRouter.get("/case/today", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const today = getTodayUtc();

    const [caseRow] = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.caseDate, today))
      .limit(1);

    if (!caseRow) {
      res.json({ case: null });
      return;
    }

    const questions = await db
      .select({
        id: caseQuestionsTable.id,
        questionText: caseQuestionsTable.questionText,
        orderIndex: caseQuestionsTable.orderIndex,
      })
      .from(caseQuestionsTable)
      .where(eq(caseQuestionsTable.caseId, caseRow.id))
      .orderBy(asc(caseQuestionsTable.orderIndex));

    const [existingAttempt] = await db
      .select()
      .from(userCaseAttemptsTable)
      .where(
        and(
          eq(userCaseAttemptsTable.userId, userId),
          eq(userCaseAttemptsTable.caseId, caseRow.id),
        ),
      )
      .limit(1);

    let attemptData: {
      score: string;
      submittedAt: Date;
      results: { questionId: number; questionText: string; userAnswer: string; correctAnswer: string; rationale: string; marks: number; maxMarks: number; grade: string; feedback: string }[];
    } | null = null;

    if (existingAttempt) {
      const fullQuestions = await db
        .select()
        .from(caseQuestionsTable)
        .where(eq(caseQuestionsTable.caseId, caseRow.id))
        .orderBy(asc(caseQuestionsTable.orderIndex));

      const answers: string[] = JSON.parse(existingAttempt.answersJson) as string[];

      let results: typeof attemptData.results;
      if (existingAttempt.resultsJson && existingAttempt.resultsJson !== "[]") {
        results = JSON.parse(existingAttempt.resultsJson) as typeof attemptData.results;
      } else {
        results = fullQuestions.map((q, i) => ({
          questionId: q.id,
          questionText: q.questionText,
          userAnswer: answers[i] ?? "",
          correctAnswer: q.correctAnswerText,
          rationale: q.rationale,
          marks: 0,
          maxMarks: 5,
          grade: "Not scored",
          feedback: "",
        }));
      }

      attemptData = {
        score: existingAttempt.score,
        submittedAt: existingAttempt.submittedAt,
        results,
      };
    }

    res.json({
      case: {
        id: caseRow.id,
        title: caseRow.title,
        caseContent: caseRow.caseContent,
        imageData: caseRow.imageData ?? null,
        postedAt: caseRow.postedAt,
        revealResultsAt: caseRow.revealResultsAt,
        caseDate: caseRow.caseDate,
      },
      questions,
      hasAttempted: !!existingAttempt,
      attempt: attemptData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch today's case.", detail: message });
  }
});

clinicalCaseRouter.post("/case/submit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { caseId, answers } = req.body as { caseId?: number; answers?: string[] };

    if (!caseId || !Array.isArray(answers)) {
      res.status(400).json({ error: "caseId and answers array are required." });
      return;
    }

    const [caseRow] = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (!caseRow) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    const now = new Date();
    if (now >= caseRow.revealResultsAt) {
      res.status(403).json({ error: "Submission deadline passed. Results are now being revealed." });
      return;
    }

    const [existingAttempt] = await db
      .select({ id: userCaseAttemptsTable.id })
      .from(userCaseAttemptsTable)
      .where(
        and(
          eq(userCaseAttemptsTable.userId, userId),
          eq(userCaseAttemptsTable.caseId, caseId),
        ),
      )
      .limit(1);

    if (existingAttempt) {
      res.status(409).json({ error: "You have already submitted this case." });
      return;
    }

    const questions = await db
      .select()
      .from(caseQuestionsTable)
      .where(eq(caseQuestionsTable.caseId, caseId))
      .orderBy(asc(caseQuestionsTable.orderIndex));

    if (answers.length !== questions.length) {
      res.status(400).json({ error: `Expected ${questions.length} answers, got ${answers.length}.` });
      return;
    }

    const scoringInput = questions.map((q, i) => ({
      questionNumber: i + 1,
      questionText: q.questionText,
      correctAnswer: q.correctAnswerText,
      rationale: q.rationale,
      userAnswer: answers[i] ?? "",
    }));

    const systemPrompt = `You are an expert clinical examiner scoring short written answers for a Clinical Case of the Day exercise.

For each question, assess whether the student's answer captures the correct clinical concept. Award marks based on semantic closeness — exact wording is NOT required, but the key medical concept must be conveyed.

Scoring rubric (each question is worth 5 marks):
- 5/5 (Excellent): Correct concept fully captured; terminology may vary but meaning is complete and accurate
- 4/5 (Good): Core concept correct; minor detail missing or slightly imprecise
- 3/5 (Satisfactory): Partially correct; right direction but missing an important qualifier or specificity
- 2/5 (Fair): Some clinical relevance but significant conceptual gap or meaningful error
- 1/5 (Poor): Vaguely related but mostly incorrect or incomplete
- 0/5 (Very Poor): Completely wrong, off-topic, irrelevant, or empty

Return ONLY a JSON array — no markdown, no extra text:
[
  {
    "questionIndex": <0-based index>,
    "marks": <0 to 5, decimals allowed e.g. 3.5>,
    "grade": "<Excellent|Good|Satisfactory|Fair|Poor|Very Poor>",
    "correctAnswer": "<the key correct concept in concise clinical terms>",
    "feedback": "<specific clinical feedback: what the student got right, what was missing or wrong, and the learning point>"
  }
]`;

    const userMessage = `Clinical case context (for scoring reference):\nTitle: ${caseRow.title}\n${caseRow.caseContent}\n\nStudent answers to score:\n${JSON.stringify(scoringInput, null, 2)}`;

    let aiScores: Array<{ questionIndex: number; marks: number; grade: string; correctAnswer: string; feedback: string }> = [];
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiScores = JSON.parse(jsonMatch[0]) as typeof aiScores;
      }
    } catch {
      aiScores = [];
    }

    const scoreMap = new Map(aiScores.map((s) => [s.questionIndex, s]));

    const results = questions.map((q, i) => {
      const ai = scoreMap.get(i);
      const marks = ai ? Math.min(5, Math.max(0, ai.marks)) : 0;
      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer: answers[i] ?? "",
        correctAnswer: ai?.correctAnswer ?? q.correctAnswerText,
        rationale: q.rationale,
        marks,
        maxMarks: 5,
        grade: ai?.grade ?? "Very Poor",
        feedback: ai?.feedback ?? "Could not generate feedback.",
      };
    });

    const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
    const totalPossible = questions.length * 5;
    const scoreValue = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

    await db.insert(userCaseAttemptsTable).values({
      userId,
      caseId,
      answersJson: JSON.stringify(answers),
      resultsJson: JSON.stringify(results),
      score: scoreValue.toFixed(2),
      submittedAt: now,
      isLocked: true,
    });

    res.json({
      score: scoreValue.toFixed(2),
      totalMarks,
      totalPossible,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not submit case.", detail: message });
  }
});

clinicalCaseRouter.get("/case/results/:caseId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const caseId = parseInt(req.params["caseId"] as string, 10);
    if (isNaN(caseId)) {
      res.status(400).json({ error: "Invalid caseId." });
      return;
    }

    const [caseRow] = await db
      .select()
      .from(clinicalCasesTable)
      .where(eq(clinicalCasesTable.id, caseId))
      .limit(1);

    if (!caseRow) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    const now = new Date();
    if (now < caseRow.revealResultsAt) {
      res.json({
        available: false,
        revealAt: caseRow.revealResultsAt,
      });
      return;
    }

    const rows = await db
      .select({
        name: usersTable.name,
        username: usersTable.username,
        score: userCaseAttemptsTable.score,
        submittedAt: userCaseAttemptsTable.submittedAt,
      })
      .from(userCaseAttemptsTable)
      .innerJoin(usersTable, eq(userCaseAttemptsTable.userId, usersTable.id))
      .where(
        and(
          eq(userCaseAttemptsTable.caseId, caseId),
          lt(userCaseAttemptsTable.submittedAt, caseRow.revealResultsAt),
        ),
      )
      .orderBy(desc(userCaseAttemptsTable.score));

    res.json({
      available: true,
      revealAt: caseRow.revealResultsAt,
      results: rows.map((r) => ({ name: r.username ?? r.name, score: r.score })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch results.", detail: message });
  }
});

clinicalCaseRouter.post("/admin/cases", requireAdmin as any, upload.single("image"), async (req, res) => {
  try {
    const { caseDate, title, caseContent, questions: questionsRaw } = req.body as {
      caseDate?: string;
      title?: string;
      caseContent?: string;
      questions?: string;
    };

    const questions = questionsRaw ? (JSON.parse(questionsRaw) as { questionText: string; correctAnswerText: string; rationale: string }[]) : undefined;

    if (!caseDate || !title?.trim() || !caseContent?.trim() || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: "caseDate, title, caseContent, and at least one question are required." });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(caseDate)) {
      res.status(400).json({ error: "caseDate must be in YYYY-MM-DD format." });
      return;
    }

    let imageData: string | null = null;
    if (req.file) {
      const mime = req.file.mimetype;
      imageData = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    }

    const postedAt = new Date(`${caseDate}T00:00:00.000Z`);
    const revealResultsAt = new Date(postedAt.getTime() + 20 * 60 * 60 * 1000);

    const [created] = await db
      .insert(clinicalCasesTable)
      .values({
        caseDate,
        title: title.trim(),
        caseContent: caseContent.trim(),
        imageData,
        postedAt,
        revealResultsAt,
      })
      .returning();

    const qValues = questions.map((q, i) => ({
      caseId: created.id,
      questionText: q.questionText.trim(),
      correctAnswerText: q.correctAnswerText.trim(),
      rationale: q.rationale.trim(),
      orderIndex: i,
    }));

    await db.insert(caseQuestionsTable).values(qValues);

    res.status(201).json({ case: created, questionsCreated: qValues.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      res.status(409).json({ error: "A case already exists for this date." });
      return;
    }
    res.status(500).json({ error: "Could not create case.", detail: message });
  }
});

clinicalCaseRouter.get("/admin/cases", requireAdmin as any, async (_req, res) => {
  try {
    const cases = await db
      .select()
      .from(clinicalCasesTable)
      .orderBy(desc(clinicalCasesTable.caseDate));

    const casesWithCounts = await Promise.all(
      cases.map(async (c) => {
        const qs = await db
          .select({ id: caseQuestionsTable.id })
          .from(caseQuestionsTable)
          .where(eq(caseQuestionsTable.caseId, c.id));
        const attempts = await db
          .select({ id: userCaseAttemptsTable.id })
          .from(userCaseAttemptsTable)
          .where(eq(userCaseAttemptsTable.caseId, c.id));
        return { ...c, questionCount: qs.length, attemptCount: attempts.length };
      }),
    );

    res.json({ cases: casesWithCounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch cases.", detail: message });
  }
});

clinicalCaseRouter.delete("/admin/cases/:id", requireAdmin as any, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case id." });
      return;
    }

    await db.delete(clinicalCasesTable).where(eq(clinicalCasesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not delete case.", detail: message });
  }
});

export default clinicalCaseRouter;
