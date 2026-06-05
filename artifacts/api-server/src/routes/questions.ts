import { Router } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const questionsRouter = Router();

questionsRouter.get("/questions", requireAuth, async (req, res) => {
  try {
    const examIdParam = req.query.examId;
    const examId = examIdParam ? Number(examIdParam) : 1;

    if (isNaN(examId) || examId <= 0) {
      res.status(400).json({ error: "Invalid examId." });
      return;
    }

    const questions = await db
      .select({
        id: questionsTable.id,
        text: questionsTable.text,
        optionA: questionsTable.optionA,
        optionB: questionsTable.optionB,
        optionC: questionsTable.optionC,
        optionD: questionsTable.optionD,
        imageData: questionsTable.imageData,
      })
      .from(questionsTable)
      .where(eq(questionsTable.examId, examId))
      .limit(200);

    res.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch questions.", detail: message });
  }
});

export default questionsRouter;
