import { Router } from "express";
import {
  db,
  dailyMcqSetsTable,
  dailyMcqQuestionsTable,
  userMcqAttemptsTable,
  usersTable,
  virtualTransactionsTable,
  leaderboardPositionPurchasesTable,
} from "@workspace/db";
import { eq, and, desc, asc, lt, sql, inArray } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const GHANA_REWARDS = [16, 14, 10, 8, 5];
const NON_GHANA_REWARDS = [8, 6.5, 5, 4, 3];

const GHS_POSITION_PRICES = [10, 9, 6, 5, 3];
const USD_POSITION_PRICES = [5, 4, 3, 2.5, 1.5];

function getUtcTotalMinutes(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function isInBuyWindow(date: Date): boolean {
  const m = getUtcTotalMinutes(date);
  return m >= 20 * 60 && m < 23 * 60 + 55;
}

function isPastRewardTime(date: Date): boolean {
  return getUtcTotalMinutes(date) >= 23 * 60 + 59;
}

interface TopEntry {
  userId: number;
  planCurrency: string | null;
}

async function distributeLeaderboardRewards(setId: number, setType: string, top5: TopEntry[]) {
  if (top5.length === 0) return;
  const rewardKey = `leaderboard_reward_${setType}_${setId}`;
  const existing = await db
    .select({ id: virtualTransactionsTable.id })
    .from(virtualTransactionsTable)
    .where(sql`${virtualTransactionsTable.description} LIKE ${"%" + rewardKey + "%"}`)
    .limit(1);
  if (existing.length > 0) return;

  for (let i = 0; i < Math.min(5, top5.length); i++) {
    const entry = top5[i];
    const isGhana = (entry.planCurrency ?? "GHS") === "GHS";
    const reward = isGhana ? GHANA_REWARDS[i] : NON_GHANA_REWARDS[i];
    try {
      await db.update(usersTable)
        .set({ virtualBalance: sql`${usersTable.virtualBalance}::numeric + ${reward}` })
        .where(eq(usersTable.id, entry.userId));
      await db.insert(virtualTransactionsTable).values({
        userId: entry.userId,
        amount: reward.toFixed(2),
        type: "credit",
        description: `#${i + 1} leaderboard prize - ${rewardKey}`,
      });
    } catch {
      // non-fatal
    }
  }
}

const dailyMcqRouter = Router();

function getTodayUtc(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function requireAdmin(
  req: AuthRequest,
  res: Parameters<typeof requireAuth>[1],
  next: Parameters<typeof requireAuth>[2],
): void {
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

dailyMcqRouter.get("/mcq/today/cards", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const today = getTodayUtc();
    const now = new Date();

    const sets = await db
      .select()
      .from(dailyMcqSetsTable)
      .where(and(eq(dailyMcqSetsTable.setDate, today), eq(dailyMcqSetsTable.isActive, true)));

    const attempts = await db
      .select({ mcqSetId: userMcqAttemptsTable.mcqSetId, submittedAt: userMcqAttemptsTable.submittedAt, isLocked: userMcqAttemptsTable.isLocked })
      .from(userMcqAttemptsTable)
      .where(eq(userMcqAttemptsTable.userId, userId));

    const attemptedSetIds = new Set(attempts.filter((a) => a.isLocked).map((a) => a.mcqSetId));

    const preClinicalSet = sets.find((s) => s.type === "pre_clinical") ?? null;
    const clinicalSet = sets.find((s) => s.type === "clinical") ?? null;

    const revealAt = preClinicalSet?.revealResultsAt ?? clinicalSet?.revealResultsAt ?? null;
    const leaderboardAvailable = revealAt ? now >= revealAt : false;

    res.json({
      preClinical: preClinicalSet
        ? {
            id: preClinicalSet.id,
            timeLimitMinutes: preClinicalSet.timeLimitMinutes,
            totalQuestions: preClinicalSet.totalQuestions,
            revealResultsAt: preClinicalSet.revealResultsAt,
            completed: attemptedSetIds.has(preClinicalSet.id),
          }
        : null,
      clinical: clinicalSet
        ? {
            id: clinicalSet.id,
            timeLimitMinutes: clinicalSet.timeLimitMinutes,
            totalQuestions: clinicalSet.totalQuestions,
            revealResultsAt: clinicalSet.revealResultsAt,
            completed: attemptedSetIds.has(clinicalSet.id),
          }
        : null,
      leaderboardAvailable,
      revealAt,
      userAttemptedAny: attemptedSetIds.size > 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch today's MCQ cards.", detail: message });
  }
});

dailyMcqRouter.get("/mcq/today/:type", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const type = req.params["type"] as string;

    if (type !== "pre_clinical" && type !== "clinical") {
      res.status(400).json({ error: "Type must be 'pre_clinical' or 'clinical'." });
      return;
    }

    const today = getTodayUtc();

    const [set] = await db
      .select()
      .from(dailyMcqSetsTable)
      .where(
        and(
          eq(dailyMcqSetsTable.setDate, today),
          eq(dailyMcqSetsTable.type, type),
          eq(dailyMcqSetsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!set) {
      res.json({ set: null });
      return;
    }

    const otherType = type === "pre_clinical" ? "clinical" : "pre_clinical";
    const [otherSet] = await db
      .select({ id: dailyMcqSetsTable.id })
      .from(dailyMcqSetsTable)
      .where(
        and(
          eq(dailyMcqSetsTable.setDate, today),
          eq(dailyMcqSetsTable.type, otherType),
          eq(dailyMcqSetsTable.isActive, true),
        ),
      )
      .limit(1);

    if (otherSet) {
      const [otherAttempt] = await db
        .select({ id: userMcqAttemptsTable.id, isLocked: userMcqAttemptsTable.isLocked })
        .from(userMcqAttemptsTable)
        .where(
          and(
            eq(userMcqAttemptsTable.userId, userId),
            eq(userMcqAttemptsTable.mcqSetId, otherSet.id),
          ),
        )
        .limit(1);

      if (otherAttempt?.isLocked) {
        res.status(403).json({ error: "You already attempted the other track today. Only one MCQ set per day is allowed." });
        return;
      }
    }

    const questions = await db
      .select({
        id: dailyMcqQuestionsTable.id,
        questionText: dailyMcqQuestionsTable.questionText,
        optionA: dailyMcqQuestionsTable.optionA,
        optionB: dailyMcqQuestionsTable.optionB,
        optionC: dailyMcqQuestionsTable.optionC,
        optionD: dailyMcqQuestionsTable.optionD,
        orderIndex: dailyMcqQuestionsTable.orderIndex,
      })
      .from(dailyMcqQuestionsTable)
      .where(eq(dailyMcqQuestionsTable.mcqSetId, set.id))
      .orderBy(asc(dailyMcqQuestionsTable.orderIndex));

    const [existingAttempt] = await db
      .select()
      .from(userMcqAttemptsTable)
      .where(
        and(
          eq(userMcqAttemptsTable.userId, userId),
          eq(userMcqAttemptsTable.mcqSetId, set.id),
        ),
      )
      .limit(1);

    let attemptData: {
      id: number;
      score: number;
      scorePercentage: string;
      timeTakenSeconds: number | null;
      submittedAt: Date | null;
      includedInLeaderboard: boolean;
      results: {
        questionId: number;
        questionText: string;
        userAnswer: string;
        correctAnswer: string;
        rationale: string;
        isCorrect: boolean;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
      }[];
    } | null = null;

    if (existingAttempt?.isLocked) {
      const fullQuestions = await db
        .select()
        .from(dailyMcqQuestionsTable)
        .where(eq(dailyMcqQuestionsTable.mcqSetId, set.id))
        .orderBy(asc(dailyMcqQuestionsTable.orderIndex));

      const answers: string[] = JSON.parse(existingAttempt.answersJson) as string[];
      const results = fullQuestions.map((q, i) => {
        const userAnswer = answers[i] ?? "";
        const isCorrect = userAnswer.toUpperCase() === q.correctAnswer.toUpperCase();
        return {
          questionId: q.id,
          questionText: q.questionText,
          userAnswer,
          correctAnswer: q.correctAnswer,
          rationale: q.rationale,
          isCorrect,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
        };
      });

      attemptData = {
        id: existingAttempt.id,
        score: existingAttempt.score,
        scorePercentage: existingAttempt.scorePercentage,
        timeTakenSeconds: existingAttempt.timeTakenSeconds,
        submittedAt: existingAttempt.submittedAt,
        includedInLeaderboard: existingAttempt.includedInLeaderboard,
        results,
      };
    }

    res.json({
      set: {
        id: set.id,
        type: set.type,
        timeLimitMinutes: set.timeLimitMinutes,
        totalQuestions: set.totalQuestions,
        revealResultsAt: set.revealResultsAt,
        setDate: set.setDate,
      },
      questions,
      hasAttempted: !!existingAttempt?.isLocked,
      attempt: attemptData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch MCQ set.", detail: message });
  }
});

dailyMcqRouter.post("/mcq/submit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { mcqSetId, answers, timeTakenSeconds } = req.body as {
      mcqSetId?: number;
      answers?: string[];
      timeTakenSeconds?: number;
    };

    if (!mcqSetId || !Array.isArray(answers)) {
      res.status(400).json({ error: "mcqSetId and answers array are required." });
      return;
    }

    const [set] = await db
      .select()
      .from(dailyMcqSetsTable)
      .where(eq(dailyMcqSetsTable.id, mcqSetId))
      .limit(1);

    if (!set) {
      res.status(404).json({ error: "MCQ set not found." });
      return;
    }

    const [existingAttempt] = await db
      .select()
      .from(userMcqAttemptsTable)
      .where(
        and(
          eq(userMcqAttemptsTable.userId, userId),
          eq(userMcqAttemptsTable.mcqSetId, mcqSetId),
        ),
      )
      .limit(1);

    if (existingAttempt?.isLocked) {
      res.status(409).json({ error: "You have already submitted this MCQ set." });
      return;
    }

    const questions = await db
      .select()
      .from(dailyMcqQuestionsTable)
      .where(eq(dailyMcqQuestionsTable.mcqSetId, mcqSetId))
      .orderBy(asc(dailyMcqQuestionsTable.orderIndex));

    let correct = 0;
    const results = questions.map((q, i) => {
      const userAnswer = (answers[i] ?? "").toUpperCase();
      const isCorrect = userAnswer === q.correctAnswer.toUpperCase();
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer: answers[i] ?? "",
        correctAnswer: q.correctAnswer,
        rationale: q.rationale,
        isCorrect,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
      };
    });

    const total = questions.length;
    const scorePercentage = total > 0 ? (correct / total) * 100 : 0;
    const now = new Date();
    const includedInLeaderboard = now < set.revealResultsAt;

    const values = {
      userId,
      mcqSetId,
      answersJson: JSON.stringify(answers),
      score: correct,
      scorePercentage: scorePercentage.toFixed(2),
      timeTakenSeconds: timeTakenSeconds ?? null,
      startedAt: now,
      submittedAt: now,
      isLocked: true,
      includedInLeaderboard,
    };

    let attemptId: number;
    if (existingAttempt) {
      await db.update(userMcqAttemptsTable).set(values).where(eq(userMcqAttemptsTable.id, existingAttempt.id));
      attemptId = existingAttempt.id;
    } else {
      const [inserted] = await db.insert(userMcqAttemptsTable).values(values).returning({ id: userMcqAttemptsTable.id });
      attemptId = inserted.id;
    }

    res.json({
      attemptId,
      score: correct,
      total,
      scorePercentage: scorePercentage.toFixed(2),
      includedInLeaderboard,
      revealResultsAt: set.revealResultsAt,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not submit MCQ answers.", detail: message });
  }
});

dailyMcqRouter.get("/mcq/leaderboard/today", requireAuth, async (req: AuthRequest, res) => {
  try {
    const today = getTodayUtc();
    const now = new Date();
    const userId = req.user!.userId;

    const sets = await db
      .select()
      .from(dailyMcqSetsTable)
      .where(and(eq(dailyMcqSetsTable.setDate, today), eq(dailyMcqSetsTable.isActive, true)));

    const preClinicalSet = sets.find((s) => s.type === "pre_clinical") ?? null;
    const clinicalSet = sets.find((s) => s.type === "clinical") ?? null;

    const revealAt = preClinicalSet?.revealResultsAt ?? clinicalSet?.revealResultsAt ?? null;

    if (!revealAt || now < revealAt) {
      res.json({ available: false, revealAt, preClinical: null, clinical: null });
      return;
    }

    async function getLeaderboard(setId: number | undefined, revealTime: Date, setType: string) {
      if (!setId) return { entries: [], purchasedPositions: [] };
      const rows = await db
        .select({
          userId: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          scorePercentage: userMcqAttemptsTable.scorePercentage,
          score: userMcqAttemptsTable.score,
          timeTakenSeconds: userMcqAttemptsTable.timeTakenSeconds,
          submittedAt: userMcqAttemptsTable.submittedAt,
          planCurrency: usersTable.planCurrency,
        })
        .from(userMcqAttemptsTable)
        .innerJoin(usersTable, eq(userMcqAttemptsTable.userId, usersTable.id))
        .where(
          and(
            eq(userMcqAttemptsTable.mcqSetId, setId),
            lt(userMcqAttemptsTable.submittedAt, revealTime),
          ),
        )
        .orderBy(
          desc(userMcqAttemptsTable.scorePercentage),
          asc(userMcqAttemptsTable.timeTakenSeconds),
        );

      const purchases = await db
        .select()
        .from(leaderboardPositionPurchasesTable)
        .where(
          and(
            eq(leaderboardPositionPurchasesTable.setId, setId),
            eq(leaderboardPositionPurchasesTable.setType, setType),
          ),
        )
        .orderBy(asc(leaderboardPositionPurchasesTable.createdAt));

      // Apply position swaps in purchase order
      const ranked = [...rows];
      for (const purchase of purchases) {
        const targetIdx = purchase.position - 1;
        const buyerIdx = ranked.findIndex((e) => e.userId === purchase.userId);
        if (buyerIdx === -1 || buyerIdx === targetIdx) continue;
        const temp = ranked[targetIdx];
        ranked[targetIdx] = ranked[buyerIdx];
        ranked[buyerIdx] = temp;
      }

      // Distribute rewards only once it's past 11:59pm
      if (isPastRewardTime(now)) {
        void distributeLeaderboardRewards(setId, setType, ranked.slice(0, 5));
      }

      const purchaserIds = purchases.map((p) => p.userId);
      let purchaserNames: Record<number, string> = {};
      if (purchaserIds.length > 0) {
        const purchaserRows = await db
          .select({ id: usersTable.id, name: usersTable.name })
          .from(usersTable)
          .where(inArray(usersTable.id, purchaserIds));
        purchaserNames = Object.fromEntries(purchaserRows.map((r) => [r.id, r.name]));
      }

      // Build a set of purchased positions for badge display (keyed by userId after swap)
      const purchasedByUserId = new Set(purchases.map((p) => p.userId));

      return {
        entries: ranked.map((r) => ({
          userId: r.userId,
          name: r.username ?? r.name,
          score: r.score,
          scorePercentage: r.scorePercentage,
          timeTakenSeconds: r.timeTakenSeconds,
          boughtPosition: purchasedByUserId.has(r.userId),
        })),
        purchasedPositions: purchases.map((p) => ({
          position: p.position,
          userId: p.userId,
          name: purchaserNames[p.userId] ?? "Unknown",
          amountPaid: p.amountPaid,
          currency: p.currency,
        })),
      };
    }

    const userAttemptedPre = preClinicalSet
      ? (await db.select({ id: userMcqAttemptsTable.id }).from(userMcqAttemptsTable)
          .where(and(eq(userMcqAttemptsTable.userId, userId), eq(userMcqAttemptsTable.mcqSetId, preClinicalSet.id)))
          .limit(1)).length > 0
      : false;
    const userAttemptedClinical = clinicalSet
      ? (await db.select({ id: userMcqAttemptsTable.id }).from(userMcqAttemptsTable)
          .where(and(eq(userMcqAttemptsTable.userId, userId), eq(userMcqAttemptsTable.mcqSetId, clinicalSet.id)))
          .limit(1)).length > 0
      : false;

    const [preClinicalLb, clinicalLb] = await Promise.all([
      getLeaderboard(preClinicalSet?.id, revealAt, "mcq_pre_clinical"),
      getLeaderboard(clinicalSet?.id, revealAt, "mcq_clinical"),
    ]);

    const [currentUser] = await db
      .select({ virtualBalance: usersTable.virtualBalance, planCurrency: usersTable.planCurrency })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.json({
      available: true,
      revealAt,
      userId,
      virtualBalance: parseFloat(currentUser?.virtualBalance ?? "0").toFixed(2),
      planCurrency: currentUser?.planCurrency ?? "GHS",
      canBuyPositions: isInBuyWindow(now),
      rewardsDistributed: isPastRewardTime(now),
      preClinical: preClinicalSet
        ? { setId: preClinicalSet.id, entries: preClinicalLb.entries, purchasedPositions: preClinicalLb.purchasedPositions, userAttempted: userAttemptedPre }
        : null,
      clinical: clinicalSet
        ? { setId: clinicalSet.id, entries: clinicalLb.entries, purchasedPositions: clinicalLb.purchasedPositions, userAttempted: userAttemptedClinical }
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch leaderboard.", detail: message });
  }
});

dailyMcqRouter.post("/mcq/leaderboard/buy-position", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { setId, setType, position } = req.body as { setId?: number; setType?: string; position?: number };

  if (!setId || !setType || !position) {
    res.status(400).json({ error: "setId, setType, and position are required." });
    return;
  }
  if (position < 1 || position > 5) {
    res.status(400).json({ error: "Position must be between 1 and 5." });
    return;
  }

  const validSetTypes = ["mcq_pre_clinical", "mcq_clinical"];
  if (!validSetTypes.includes(setType)) {
    res.status(400).json({ error: "Invalid setType." });
    return;
  }

  const purchaseNow = new Date();
  if (!isInBuyWindow(purchaseNow)) {
    const m = getUtcTotalMinutes(purchaseNow);
    const tooEarly = m < 20 * 60;
    const msg = tooEarly
      ? "Position buying opens at 8:00 PM. Come back then!"
      : "Position buying closed at 11:55 PM. Check back tomorrow.";
    res.status(403).json({ error: msg });
    return;
  }

  try {
    const mcqType = setType === "mcq_pre_clinical" ? "pre_clinical" : "clinical";
    const attempted = await db
      .select({ id: userMcqAttemptsTable.id })
      .from(userMcqAttemptsTable)
      .where(and(eq(userMcqAttemptsTable.userId, userId), eq(userMcqAttemptsTable.mcqSetId, setId)))
      .limit(1);

    if (attempted.length === 0) {
      res.status(403).json({ error: "You must attempt the quiz before buying a position." });
      return;
    }
    void mcqType;

    const alreadyTaken = await db
      .select({ id: leaderboardPositionPurchasesTable.id })
      .from(leaderboardPositionPurchasesTable)
      .where(
        and(
          eq(leaderboardPositionPurchasesTable.setId, setId),
          eq(leaderboardPositionPurchasesTable.setType, setType),
          eq(leaderboardPositionPurchasesTable.position, position),
        ),
      )
      .limit(1);

    if (alreadyTaken.length > 0) {
      res.status(409).json({ error: `Position ${position} has already been purchased.` });
      return;
    }

    const [userRow] = await db
      .select({ virtualBalance: usersTable.virtualBalance, planCurrency: usersTable.planCurrency })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userRow) { res.status(404).json({ error: "User not found." }); return; }

    const isGhana = (userRow.planCurrency ?? "GHS") === "GHS";
    const price = isGhana ? GHS_POSITION_PRICES[position - 1] : USD_POSITION_PRICES[position - 1];
    const currentBalance = parseFloat(userRow.virtualBalance ?? "0");

    if (currentBalance < price) {
      res.status(402).json({
        error: `Insufficient balance. Position ${position} costs ${isGhana ? "GH₵" : "$"}${price}. Your balance: ${isGhana ? "GH₵" : "$"}${currentBalance.toFixed(2)}.`,
      });
      return;
    }

    await db.update(usersTable)
      .set({ virtualBalance: sql`${usersTable.virtualBalance}::numeric - ${price}` })
      .where(eq(usersTable.id, userId));

    await db.insert(leaderboardPositionPurchasesTable).values({
      userId,
      setId,
      setType,
      position,
      amountPaid: price.toFixed(2),
      currency: isGhana ? "GHS" : "USD",
    });

    await db.insert(virtualTransactionsTable).values({
      userId,
      amount: price.toFixed(2),
      type: "debit",
      description: `Purchased leaderboard position #${position} (${setType})`,
    });

    const newBalance = currentBalance - price;
    res.json({ success: true, position, pricePaid: price, newBalance: newBalance.toFixed(2) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      res.status(409).json({ error: `Position ${position} has already been purchased.` });
      return;
    }
    res.status(500).json({ error: "Could not buy position.", detail: message });
  }
});

dailyMcqRouter.post("/admin/mcq/sets", requireAdmin as any, async (req, res) => {
  try {
    const { setDate, type, questions } = req.body as {
      setDate?: string;
      type?: string;
      questions?: {
        questionText: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        correctAnswer: string;
        rationale: string;
      }[];
    };

    if (!setDate || !type || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: "setDate, type, and at least one question are required." });
      return;
    }

    if (type !== "pre_clinical" && type !== "clinical") {
      res.status(400).json({ error: "type must be 'pre_clinical' or 'clinical'." });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(setDate)) {
      res.status(400).json({ error: "setDate must be YYYY-MM-DD." });
      return;
    }

    if (questions.length !== 10) {
      res.status(400).json({ error: "Exactly 10 questions are required." });
      return;
    }

    for (const q of questions) {
      if (!["A", "B", "C", "D"].includes(q.correctAnswer?.toUpperCase())) {
        res.status(400).json({ error: "correctAnswer must be A, B, C, or D." });
        return;
      }
    }

    const postedAt = new Date(`${setDate}T00:00:00.000Z`);
    const revealResultsAt = new Date(postedAt.getTime() + 20 * 60 * 60 * 1000);

    const [created] = await db
      .insert(dailyMcqSetsTable)
      .values({
        setDate,
        type: type as "pre_clinical" | "clinical",
        timeLimitMinutes: 8,
        totalQuestions: 10,
        postedAt,
        revealResultsAt,
        isActive: true,
      })
      .returning();

    const qValues = questions.map((q, i) => ({
      mcqSetId: created.id,
      questionText: q.questionText.trim(),
      optionA: q.optionA.trim(),
      optionB: q.optionB.trim(),
      optionC: q.optionC.trim(),
      optionD: q.optionD.trim(),
      correctAnswer: q.correctAnswer.toUpperCase(),
      rationale: q.rationale?.trim() ?? "",
      orderIndex: i,
    }));

    await db.insert(dailyMcqQuestionsTable).values(qValues);

    res.status(201).json({ set: created, questionsCreated: qValues.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      res.status(409).json({ error: "An MCQ set of this type already exists for this date." });
      return;
    }
    res.status(500).json({ error: "Could not create MCQ set.", detail: message });
  }
});

dailyMcqRouter.get("/admin/mcq/sets", requireAdmin as any, async (_req, res) => {
  try {
    const sets = await db
      .select()
      .from(dailyMcqSetsTable)
      .orderBy(desc(dailyMcqSetsTable.setDate));

    const setsWithCounts = await Promise.all(
      sets.map(async (s) => {
        const qs = await db
          .select({ id: dailyMcqQuestionsTable.id })
          .from(dailyMcqQuestionsTable)
          .where(eq(dailyMcqQuestionsTable.mcqSetId, s.id));
        const attempts = await db
          .select({ id: userMcqAttemptsTable.id })
          .from(userMcqAttemptsTable)
          .where(and(eq(userMcqAttemptsTable.mcqSetId, s.id), eq(userMcqAttemptsTable.isLocked, true)));
        return { ...s, questionCount: qs.length, attemptCount: attempts.length };
      }),
    );

    res.json({ sets: setsWithCounts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch MCQ sets.", detail: message });
  }
});

dailyMcqRouter.delete("/admin/mcq/sets/:id", requireAdmin as any, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid set id." });
      return;
    }
    await db.delete(dailyMcqSetsTable).where(eq(dailyMcqSetsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not delete MCQ set.", detail: message });
  }
});

export default dailyMcqRouter;
