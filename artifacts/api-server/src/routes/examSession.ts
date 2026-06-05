import { Router } from "express";
import { db, examSessionsTable, attemptsTable, questionsTable, examsTable, usersTable, virtualTransactionsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const examSessionRouter = Router();

examSessionRouter.get("/exam-session", requireAuth, async (req: AuthRequest, res) => {
  try {
    const examId = req.query.examId ? Number(req.query.examId) : 1;
    const userId = req.user!.userId;

    const [session] = await db
      .select()
      .from(examSessionsTable)
      .where(
        and(
          eq(examSessionsTable.userId, userId),
          eq(examSessionsTable.examId, examId),
          eq(examSessionsTable.status, "in_progress"),
        ),
      )
      .limit(1);

    if (!session) {
      res.json({ session: null });
      return;
    }

    res.json({
      session: {
        id: session.id,
        timerRemaining: session.timerRemaining,
        answers: JSON.parse(session.answers),
        flagged: JSON.parse(session.flagged),
        status: session.status,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch session.", detail: message });
  }
});

examSessionRouter.put("/exam-session", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { examId = 1, timerRemaining, answers = [], flagged = [] } = req.body;
    const userId = req.user!.userId;

    const [existing] = await db
      .select({ id: examSessionsTable.id })
      .from(examSessionsTable)
      .where(
        and(
          eq(examSessionsTable.userId, userId),
          eq(examSessionsTable.examId, examId),
          eq(examSessionsTable.status, "in_progress"),
        ),
      )
      .limit(1);

    const payload = {
      timerRemaining: Math.round(timerRemaining),
      answers: JSON.stringify(answers),
      flagged: JSON.stringify(flagged),
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(examSessionsTable)
        .set(payload)
        .where(eq(examSessionsTable.id, existing.id));
    } else {
      await db.insert(examSessionsTable).values({
        userId,
        examId,
        ...payload,
        status: "in_progress",
      });
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not save session.", detail: message });
  }
});

examSessionRouter.post("/exam-session/submit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { examId = 1, answers = [] } = req.body;
    const userId = req.user!.userId;

    const allQuestions = await db
      .select({ id: questionsTable.id, correctAnswer: questionsTable.correctAnswer })
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId));

    const optionMap: Record<number, string> = { 0: "A", 1: "B", 2: "C", 3: "D" };
    let correct = 0;
    for (const q of allQuestions) {
      const found = (answers as { questionId: number; answerIndex: number }[]).find(
        (a) => a.questionId === q.id,
      );
      if (found !== undefined && optionMap[found.answerIndex] === q.correctAnswer) {
        correct++;
      }
    }

    const score =
      allQuestions.length > 0
        ? ((correct / allQuestions.length) * 100).toFixed(2)
        : "0.00";

    const [examRow] = await db
      .select({ title: examsTable.title })
      .from(examsTable)
      .where(eq(examsTable.id, examId))
      .limit(1);

    await db.insert(attemptsTable).values({
      userId,
      examId,
      examTitle: examRow?.title ?? "Untitled Exam",
      totalQuestions: allQuestions.length,
      score,
    });

    await db
      .update(examSessionsTable)
      .set({
        status: "submitted",
        answers: JSON.stringify(answers),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(examSessionsTable.userId, userId),
          eq(examSessionsTable.examId, examId),
          eq(examSessionsTable.status, "in_progress"),
        ),
      );

    const scoreFloat = parseFloat(score);
    let virtualReward: number | null = null;
    if (scoreFloat >= 80 && allQuestions.length > 0) {
      try {
        const [userRow] = await db
          .select({ planCurrency: usersTable.planCurrency })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);
        const reward = 0.50;
        virtualReward = reward;
        await db.update(usersTable)
          .set({ virtualBalance: sql`${usersTable.virtualBalance}::numeric + ${reward}` })
          .where(eq(usersTable.id, userId));
        await db.insert(virtualTransactionsTable).values({
          userId,
          amount: reward.toFixed(2),
          type: "credit",
          description: `Quiz reward: scored ${scoreFloat.toFixed(0)}% on MCQ`,
        });
        void userRow;
      } catch {
        virtualReward = null;
      }
    }

    res.json({ ok: true, score, correct, total: allQuestions.length, virtualReward });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not submit exam.", detail: message });
  }
});

examSessionRouter.get("/exam-result", requireAuth, async (req: AuthRequest, res) => {
  try {
    const examId = req.query.examId ? Number(req.query.examId) : 1;
    const userId = req.user!.userId;

    const [attempt] = await db
      .select()
      .from(attemptsTable)
      .where(and(eq(attemptsTable.userId, userId), eq(attemptsTable.examId, examId)))
      .orderBy(desc(attemptsTable.createdAt))
      .limit(1);

    const [session] = await db
      .select()
      .from(examSessionsTable)
      .where(
        and(
          eq(examSessionsTable.userId, userId),
          eq(examSessionsTable.examId, examId),
          eq(examSessionsTable.status, "submitted"),
        ),
      )
      .orderBy(desc(examSessionsTable.updatedAt))
      .limit(1);

    const questions = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId));

    if (!attempt || !questions.length) {
      res.status(404).json({ error: "No result found for this exam." });
      return;
    }

    const userAnswers: { questionId: number; answerIndex: number }[] = session
      ? JSON.parse(session.answers)
      : [];

    const optionMap: Record<number, string> = { 0: "A", 1: "B", 2: "C", 3: "D" };

    let correct = 0;
    const enrichedQuestions = questions.map((q) => {
      const ua = userAnswers.find((a) => a.questionId === q.id);
      const userAnswerLetter = ua !== undefined ? (optionMap[ua.answerIndex] ?? null) : null;
      if (userAnswerLetter && userAnswerLetter === q.correctAnswer) correct++;
      return {
        id: q.id,
        text: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        rationale: q.rationale ?? "",
        userAnswer: userAnswerLetter,
      };
    });

    res.json({
      attemptId: attempt.id,
      attemptDate: attempt.createdAt,
      score: attempt.score,
      correct,
      total: questions.length,
      questions: enrichedQuestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch result.", detail: message });
  }
});

examSessionRouter.get("/exam-info", requireAuth, async (req: AuthRequest, res) => {
  try {
    const examId = req.query.examId ? Number(req.query.examId) : 0;
    if (!examId) {
      res.status(400).json({ error: "examId required" });
      return;
    }

    const [exam] = await db
      .select({
        id: examsTable.id,
        title: examsTable.title,
        durationMinutes: examsTable.durationMinutes,
        difficulty: examsTable.difficulty,
        mode: examsTable.mode,
      })
      .from(examsTable)
      .where(eq(examsTable.id, examId))
      .limit(1);

    if (!exam) {
      res.status(404).json({ error: "Exam not found." });
      return;
    }

    res.json(exam);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch exam info.", detail: message });
  }
});

export default examSessionRouter;
