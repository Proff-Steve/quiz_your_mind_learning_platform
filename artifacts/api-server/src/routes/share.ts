import { Router } from "express";
import { db, examShareCodesTable, attemptsTable, examsTable, usersTable, questionsTable } from "@workspace/db";
import { eq, count, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const shareRouter = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

shareRouter.post("/exam-share", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { examId } = req.body;
    const userId = req.user!.userId;

    if (!examId) {
      res.status(400).json({ error: "examId is required" });
      return;
    }

    const [exam] = await db
      .select({ id: examsTable.id })
      .from(examsTable)
      .where(eq(examsTable.id, Number(examId)))
      .limit(1);

    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    let code = generateCode();
    for (let i = 0; i < 10; i++) {
      const [existing] = await db
        .select({ id: examShareCodesTable.id })
        .from(examShareCodesTable)
        .where(eq(examShareCodesTable.code, code))
        .limit(1);
      if (!existing) break;
      code = generateCode();
    }

    await db.insert(examShareCodesTable).values({
      code,
      examId: exam.id,
      createdByUserId: userId,
    });

    res.json({ code, examId: exam.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not generate share code.", detail: message });
  }
});

shareRouter.get("/exam-share/:code", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code } = req.params;

    const [shareRow] = await db
      .select({ examId: examShareCodesTable.examId })
      .from(examShareCodesTable)
      .where(eq(examShareCodesTable.code, code.toUpperCase()))
      .limit(1);

    if (!shareRow) {
      res.status(404).json({ error: "Invalid or expired code" });
      return;
    }

    const [exam] = await db
      .select({
        id: examsTable.id,
        durationMinutes: examsTable.durationMinutes,
        difficulty: examsTable.difficulty,
        mode: examsTable.mode,
        title: examsTable.title,
      })
      .from(examsTable)
      .where(eq(examsTable.id, shareRow.examId))
      .limit(1);

    if (!exam) {
      res.status(404).json({ error: "Exam not found" });
      return;
    }

    const [countRow] = await db
      .select({ count: count() })
      .from(questionsTable)
      .where(eq(questionsTable.examId, exam.id));

    const questionCount = countRow?.count ?? 0;

    res.json({
      examId: exam.id,
      durationMinutes: exam.durationMinutes,
      difficulty: exam.difficulty,
      mode: exam.mode,
      title: exam.title,
      questionCount,
      code: code.toUpperCase(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch exam by code.", detail: message });
  }
});

shareRouter.get("/exam-share/:code/results", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code } = req.params;

    const [shareRow] = await db
      .select({ examId: examShareCodesTable.examId })
      .from(examShareCodesTable)
      .where(eq(examShareCodesTable.code, code.toUpperCase()))
      .limit(1);

    if (!shareRow) {
      res.status(404).json({ error: "Invalid code" });
      return;
    }

    const results = await db
      .select({
        attemptId: attemptsTable.id,
        score: attemptsTable.score,
        totalQuestions: attemptsTable.totalQuestions,
        createdAt: attemptsTable.createdAt,
        userName: usersTable.name,
        studentId: usersTable.studentId,
      })
      .from(attemptsTable)
      .innerJoin(usersTable, eq(attemptsTable.userId, usersTable.id))
      .where(eq(attemptsTable.examId, shareRow.examId))
      .orderBy(asc(usersTable.studentId));

    res.json({ examId: shareRow.examId, code: code.toUpperCase(), results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch group results.", detail: message });
  }
});

export default shareRouter;
