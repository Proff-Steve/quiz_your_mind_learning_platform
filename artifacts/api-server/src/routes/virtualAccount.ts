import { Router } from "express";
import { db, usersTable, virtualTransactionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const USD_TO_GHS_RATE = 14;

router.get("/virtual-account/balance", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  try {
    const [user] = await db
      .select({ virtualBalance: usersTable.virtualBalance, planCurrency: usersTable.planCurrency })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const transactions = await db
      .select()
      .from(virtualTransactionsTable)
      .where(eq(virtualTransactionsTable.userId, userId))
      .orderBy(desc(virtualTransactionsTable.createdAt))
      .limit(20);

    res.json({
      balance: parseFloat(user.virtualBalance ?? "0").toFixed(2),
      currency: user.planCurrency ?? "GHS",
      transactions: transactions.map(t => ({
        id: t.id,
        amount: parseFloat(t.amount).toFixed(2),
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch balance.", detail: message });
  }
});

router.post("/virtual-account/load/momo", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const studentId = req.user!.studentId;
  const { phone, provider, amount } = req.body as {
    phone?: string;
    provider?: string;
    amount?: number;
  };

  if (!phone || !provider || !amount) {
    res.status(400).json({ error: "Phone, provider, and amount are required." });
    return;
  }

  const validProviders = ["mtn", "vod", "atl"];
  if (!validProviders.includes(provider)) {
    res.status(400).json({ error: "Invalid mobile money provider." });
    return;
  }

  if (amount < 1 || amount > 500) {
    res.status(400).json({ error: "Amount must be between GH₵1 and GH₵500." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) { res.status(500).json({ error: "Payment system not configured." }); return; }

  const amountPesewas = Math.round(amount * 100);
  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const email = `${safeId}@quizyourmind.com`;
  const reference = `vload${safeId}${Date.now()}`;

  await db.update(usersTable).set({ pendingVirtualRef: reference }).where(eq(usersTable.id, userId));

  try {
    const chargeRes = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountPesewas,
        currency: "GHS",
        reference,
        mobile_money: { phone, provider },
      }),
    });

    const rawText = await chargeRes.text();
    let chargeData: {
      status: boolean | string;
      message?: string;
      data?: { status: string; reference: string; display_text?: string };
    };
    try { chargeData = JSON.parse(rawText) as typeof chargeData; }
    catch { res.status(500).json({ error: "Invalid response from payment gateway." }); return; }

    const chargeStatus = chargeData.data?.status ?? "";
    const pendingStatuses = ["pay_offline", "send_otp", "pending", "charge_attempted", "ongoing"];

    if (chargeStatus === "success") { res.json({ status: "success", reference }); return; }

    if (pendingStatuses.includes(chargeStatus)) {
      res.json({
        status: "pending",
        reference,
        requiresOtp: chargeStatus === "send_otp",
        displayText: chargeData.data?.display_text ?? "A prompt has been sent to your phone. Enter your MoMo PIN to approve.",
      });
      return;
    }

    await db.update(usersTable).set({ pendingVirtualRef: null }).where(eq(usersTable.id, userId));
    const outerOk = chargeData.status === true || chargeData.status === "true";
    if (!outerOk) {
      res.status(400).json({ error: chargeData.message ?? "Failed to initiate charge." });
      return;
    }
    res.status(400).json({ error: chargeData.data?.display_text ?? "Could not initiate MoMo charge." });
  } catch (err: unknown) {
    await db.update(usersTable).set({ pendingVirtualRef: null }).where(eq(usersTable.id, userId)).catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

router.post("/virtual-account/load/init-card", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const studentId = req.user!.studentId;
  const { amount } = req.body as { amount?: number };

  if (!amount || amount < 1 || amount > 200) {
    res.status(400).json({ error: "Amount must be between $1 and $200." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) { res.status(500).json({ error: "Payment system not configured." }); return; }

  const amountPesewas = Math.round(amount * USD_TO_GHS_RATE * 100);
  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const email = `${safeId}@quizyourmind.com`;
  const reference = `vcard${safeId}${Date.now()}`;

  await db.update(usersTable).set({ pendingVirtualRef: reference }).where(eq(usersTable.id, userId));

  try {
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountPesewas,
        currency: "GHS",
        reference,
        channels: ["card", "bank"],
        metadata: { virtualLoad: true, usdAmount: amount },
      }),
    });

    const initData = await initRes.json() as {
      status: boolean;
      message?: string;
      data?: { access_code: string; reference: string };
    };

    if (!initData.status || !initData.data) {
      await db.update(usersTable).set({ pendingVirtualRef: null }).where(eq(usersTable.id, userId));
      res.status(400).json({ error: initData.message ?? "Failed to initialize payment." });
      return;
    }

    res.json({ accessCode: initData.data.access_code, reference: initData.data.reference });
  } catch (err: unknown) {
    await db.update(usersTable).set({ pendingVirtualRef: null }).where(eq(usersTable.id, userId)).catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

router.post("/virtual-account/load/confirm", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { reference } = req.body as { reference?: string };

  if (!reference) { res.status(400).json({ error: "Reference is required." }); return; }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) { res.status(500).json({ error: "Payment system not configured." }); return; }

  const [user] = await db
    .select({ pendingVirtualRef: usersTable.pendingVirtualRef, planCurrency: usersTable.planCurrency, virtualBalance: usersTable.virtualBalance })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) { res.status(404).json({ error: "User not found." }); return; }
  if (user.pendingVirtualRef !== reference) {
    res.status(400).json({ error: "Reference mismatch. Please try again." });
    return;
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" } },
    );
    const verifyData = await verifyRes.json() as {
      status: boolean;
      data?: { status: string; amount?: number; channel?: string };
    };

    if (!verifyData.status || verifyData.data?.status !== "success") {
      res.status(402).json({ error: "Payment not yet confirmed. Please wait and try again." });
      return;
    }

    const paidPesewas = verifyData.data?.amount ?? 0;
    const channel = verifyData.data?.channel ?? "";
    const isMoMo = channel === "mobile_money";

    let creditAmount: number;
    if (isMoMo || (user.planCurrency ?? "GHS") === "GHS") {
      creditAmount = paidPesewas / 100;
    } else {
      creditAmount = paidPesewas / 100 / USD_TO_GHS_RATE;
    }

    creditAmount = Math.round(creditAmount * 100) / 100;

    await db.update(usersTable).set({
      virtualBalance: sql`${usersTable.virtualBalance}::numeric + ${creditAmount}`,
      pendingVirtualRef: null,
    }).where(eq(usersTable.id, userId));

    const currency = (user.planCurrency ?? "GHS") === "GHS" ? "GHS" : "USD";
    await db.insert(virtualTransactionsTable).values({
      userId,
      amount: creditAmount.toFixed(2),
      type: "credit",
      description: `Account top-up via ${isMoMo ? "MoMo" : "card"}`,
    });

    const newBalance = parseFloat(user.virtualBalance ?? "0") + creditAmount;
    res.json({ success: true, credited: creditAmount.toFixed(2), currency, newBalance: newBalance.toFixed(2) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not confirm payment.", detail: message });
  }
});

export default router;
