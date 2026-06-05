import { Router } from "express";
import { db, usersTable, virtualTransactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const TOKENS_PER_GHS5 = 50000;
const GHS_UNIT = 5;

router.get("/tokens/balance", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const [user] = await db
      .select({ tokenBalance: usersTable.tokenBalance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    res.json({ tokenBalance: user.tokenBalance ?? 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch token balance.", detail: message });
  }
});

router.post("/tokens/purchase", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { ghsAmount } = req.body as { ghsAmount?: number };

  if (!ghsAmount || ghsAmount < GHS_UNIT || ghsAmount % GHS_UNIT !== 0) {
    res.status(400).json({ error: `Amount must be a multiple of GH₵${GHS_UNIT} (minimum GH₵${GHS_UNIT}).` });
    return;
  }

  if (ghsAmount > 500) {
    res.status(400).json({ error: "Maximum purchase is GH₵500 per transaction." });
    return;
  }

  const tokensToAdd = (ghsAmount / GHS_UNIT) * TOKENS_PER_GHS5;

  try {
    const [user] = await db
      .select({ virtualBalance: usersTable.virtualBalance, tokenBalance: usersTable.tokenBalance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const currentBalance = parseFloat(user.virtualBalance ?? "0");
    if (currentBalance < ghsAmount) {
      res.status(402).json({
        error: `Insufficient virtual balance. You need GH₵${ghsAmount.toFixed(2)} but have GH₵${currentBalance.toFixed(2)}.`,
        currentBalance: currentBalance.toFixed(2),
        required: ghsAmount.toFixed(2),
      });
      return;
    }

    await db.update(usersTable).set({
      virtualBalance: sql`${usersTable.virtualBalance}::numeric - ${ghsAmount}`,
      tokenBalance: sql`${usersTable.tokenBalance} + ${tokensToAdd}`,
    }).where(eq(usersTable.id, userId));

    await db.insert(virtualTransactionsTable).values({
      userId,
      amount: ghsAmount.toFixed(2),
      type: "debit",
      description: `Purchased ${tokensToAdd.toLocaleString()} Proff-Steve tokens`,
    });

    const newTokenBalance = (user.tokenBalance ?? 0) + tokensToAdd;
    const newVirtualBalance = currentBalance - ghsAmount;

    res.json({
      success: true,
      tokensAdded: tokensToAdd,
      tokenBalance: newTokenBalance,
      virtualBalance: newVirtualBalance.toFixed(2),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not complete purchase.", detail: message });
  }
});

export default router;
