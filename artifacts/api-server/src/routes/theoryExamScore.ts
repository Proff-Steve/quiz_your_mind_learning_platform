import { Router } from "express";
import { db, theoryExamsTable, theoryQuestionsTable, theoryAttemptsTable, usersTable, virtualTransactionsTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

interface UserAnswer {
  questionIndex: number;
  userAnswer: string;
}

interface ScoreResult {
  questionIndex: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  marks: number;
  maxMarks: number;
  grade: string;
  feedback: string;
}

router.post("/theory-exam/score", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { theoryExamId, answers, timeTakenSeconds } = req.body as {
      theoryExamId: number;
      answers: UserAnswer[];
      timeTakenSeconds?: number;
    };

    if (!theoryExamId || !Array.isArray(answers)) {
      res.status(400).json({ error: "theoryExamId and answers are required." });
      return;
    }

    const [exam] = await db
      .select()
      .from(theoryExamsTable)
      .where(eq(theoryExamsTable.id, theoryExamId))
      .limit(1);

    if (!exam) {
      res.status(404).json({ error: "Theory exam not found." });
      return;
    }

    const questions = await db
      .select()
      .from(theoryQuestionsTable)
      .where(eq(theoryQuestionsTable.theoryExamId, theoryExamId))
      .orderBy(asc(theoryQuestionsTable.orderIndex));

    if (questions.length === 0) {
      res.status(404).json({ error: "No questions found for this exam." });
      return;
    }

    const answerMap = new Map<number, string>();
    for (const a of answers) {
      answerMap.set(a.questionIndex, a.userAnswer ?? "");
    }

    const scoringInput = questions.map((q, i) => ({
      questionNumber: i + 1,
      questionText: q.questionText,
      modelAnswer: q.modelAnswer,
      userAnswer: answerMap.get(q.orderIndex) ?? answerMap.get(i) ?? "",
    }));

    const systemPrompt = `You are an expert academic examiner scoring written-answer theory exam responses.

For each question, compare the student's answer to the model answer semantically — what matters is whether the key concepts and facts are conveyed, not exact wording.

Scoring rubric (each question is worth 5 marks):
- 5/5 (Excellent): Answer is complete, accurate, includes all key points from the model answer
- 4/5 (Good): Mostly correct, only missing minor details
- 3/5 (Satisfactory): Core idea is correct but missing important details
- 2/5 (Fair): Some relevant information but significant gaps or errors
- 1/5 (Poor): Minimal relevant content, mostly incorrect
- 0/5 (Very Poor): Completely wrong, off-topic, or empty answer

Return ONLY a JSON array with no markdown, no extra text:
[
  {
    "questionIndex": <0-based index>,
    "marks": <0 to 5, can be decimal like 3.5>,
    "grade": "<Excellent|Good|Satisfactory|Fair|Poor|Very Poor>",
    "correctAnswer": "<concise version of the model answer highlighting key points>",
    "feedback": "<specific, constructive feedback on what was right, what was wrong or missing, and how to improve>"
  }
]`;

    const userMessage = `Study material context:\n${exam.studyMaterialText.slice(0, 8000)}\n\nQuestions and answers to score:\n${JSON.stringify(scoringInput, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 6000,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      res.status(500).json({ error: "AI scoring failed. Please try again." });
      return;
    }

    const aiScores = JSON.parse(jsonMatch[0]) as Array<{
      questionIndex: number;
      marks: number;
      grade: string;
      correctAnswer: string;
      feedback: string;
    }>;

    const scoreMap = new Map(aiScores.map((s) => [s.questionIndex, s]));

    const results: ScoreResult[] = questions.map((q, i) => {
      const ai = scoreMap.get(i) ?? scoreMap.get(q.orderIndex);
      const marks = Math.min(5, Math.max(0, ai?.marks ?? 0));
      return {
        questionIndex: i,
        questionText: q.questionText,
        userAnswer: answerMap.get(q.orderIndex) ?? answerMap.get(i) ?? "",
        correctAnswer: ai?.correctAnswer ?? q.modelAnswer,
        marks,
        maxMarks: 5,
        grade: ai?.grade ?? "Very Poor",
        feedback: ai?.feedback ?? "No feedback available.",
      };
    });

    const totalScore = results.reduce((sum, r) => sum + r.marks, 0);
    const totalPossible = results.length * 5;
    const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

    await db.insert(theoryAttemptsTable).values({
      userId,
      theoryExamId,
      answersJson: JSON.stringify(answers),
      scoresJson: JSON.stringify(results),
      totalScore: totalScore.toFixed(2),
      totalPossible,
      percentage: percentage.toFixed(2),
      timeTakenSeconds: timeTakenSeconds ?? null,
    });

    let virtualReward: number | null = null;
    if (percentage >= 80 && results.length > 0) {
      try {
        const reward = 0.50;
        virtualReward = reward;
        await db.update(usersTable)
          .set({ virtualBalance: sql`${usersTable.virtualBalance}::numeric + ${reward}` })
          .where(eq(usersTable.id, userId));
        await db.insert(virtualTransactionsTable).values({
          userId,
          amount: reward.toFixed(2),
          type: "credit",
          description: `Theory exam reward: scored ${percentage.toFixed(0)}%`,
        });
      } catch {
        virtualReward = null;
      }
    }

    res.json({
      results,
      totalScore,
      totalPossible,
      percentage: Math.round(percentage * 10) / 10,
      passed: percentage >= 60,
      timeTakenSeconds: timeTakenSeconds ?? null,
      caseScenario: exam.caseScenario,
      virtualReward,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
});

export default router;
