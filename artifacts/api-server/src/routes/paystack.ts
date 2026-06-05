import { Router, type Request } from "express";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { seedPlanFields } from "../lib/balanceScheduler.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const USD_PLAN_CODES: Record<"weekly" | "monthly", string> = {
  weekly: "PLN_w4wcatrkx676tqc",
  monthly: "PLN_dgoizxeg0sll10e",
};

const GHS_PLAN_CODES: Record<"weekly" | "monthly", string> = {
  weekly: "PLN_0qbjvklw8g5dbdw",
  monthly: "PLN_ldv3702jkw3eajd",
};

async function createUSDSubscription(
  secretKey: string,
  customerCode: string,
  authCode: string,
  planType: "weekly" | "monthly"
): Promise<string | null> {
  try {
    const res = await fetch("https://api.paystack.co/subscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerCode,
        plan: USD_PLAN_CODES[planType],
        authorization: authCode,
      }),
    });
    const data = await res.json() as { status: boolean; data?: { subscription_code?: string } };
    if (data.status && data.data?.subscription_code) return data.data.subscription_code;
  } catch {
    // non-fatal — subscription creation failure should not block account activation
  }
  return null;
}

/**
 * For MoMo (GHS) charges where `plan` is passed in the charge body, Paystack
 * automatically creates a subscription. This helper fetches the subscription
 * code so we can store it for future webhook matching.
 */
async function fetchGHSSubscriptionCode(
  secretKey: string,
  customerCode: string,
  planCode: string
): Promise<string | null> {
  try {
    const url = `https://api.paystack.co/subscription?customer=${encodeURIComponent(customerCode)}&plan=${encodeURIComponent(planCode)}&status=active`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json() as {
      status: boolean;
      data?: Array<{ subscription_code?: string; status?: string }>;
    };
    if (data.status && data.data?.length) {
      return data.data[0]?.subscription_code ?? null;
    }
  } catch {
    // non-fatal
  }
  return null;
}

const paystackRouter = Router();

paystackRouter.get("/config", (_req, res) => {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    res.status(500).json({ error: "Paystack public key not configured." });
    return;
  }
  res.json({ paystackPublicKey: publicKey });
});

/* ── Initiate a MoMo charge directly (no popup needed) ── */
paystackRouter.post("/paystack/initiate-charge", async (req, res) => {
  const { phone, provider, studentId } = req.body as {
    phone?: string;
    provider?: string;
    studentId?: string;
  };

  if (!phone || !provider || !studentId) {
    res.status(400).json({ error: "Phone number, provider, and student ID are required." });
    return;
  }

  const validProviders = ["mtn", "vod", "atl"];
  if (!validProviders.includes(provider)) {
    res.status(400).json({ error: "Invalid mobile money provider." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const email = `${safeId}@quizyourmind.com`;
  const reference = `reg${safeId}${Date.now()}`;

  try {
    const chargeRes = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: 1200,
        currency: "GHS",
        reference,
        plan: "PLN_0qbjvklw8g5dbdw",
        mobile_money: {
          phone,
          provider,
        },
      }),
    });

    const rawText = await chargeRes.text();

    let chargeData: {
      status: boolean | string;
      message?: string;
      data?: {
        status: string;
        reference: string;
        display_text?: string;
      };
    };

    try {
      chargeData = JSON.parse(rawText) as typeof chargeData;
    } catch {
      res.status(500).json({ error: "Invalid response from payment gateway." });
      return;
    }

    const outerOk = chargeData.status === true || chargeData.status === "true";

    const chargeStatus = chargeData.data?.status ?? "";

    const pendingStatuses = ["pay_offline", "send_otp", "pending", "charge_attempted", "ongoing"];

    if (chargeStatus === "success") {
      res.json({ status: "success", reference });
      return;
    }

    if (pendingStatuses.includes(chargeStatus)) {
      res.json({
        status: "pending",
        reference,
        requiresOtp: chargeStatus === "send_otp",
        displayText: chargeData.data?.display_text ?? "A prompt has been sent to your phone. Enter your MoMo PIN to approve the payment.",
      });
      return;
    }

    if (!outerOk) {
      const detail = (chargeData.data as { message?: string } | undefined)?.message;
      res.status(400).json({ error: detail ?? chargeData.message ?? "Failed to initiate charge." });
      return;
    }

    const detail = (chargeData.data as { message?: string } | undefined)?.message;
    res.status(400).json({ error: chargeData.data?.display_text ?? detail ?? chargeData.message ?? "Could not initiate MoMo charge. Please try again." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

/* ── Initialize a Paystack Popup transaction for international card/bank payments (registration) ── */
paystackRouter.post("/paystack/init-transaction", async (req, res) => {
  const { plan, studentId } = req.body as {
    plan?: "weekly" | "monthly";
    studentId?: string;
  };

  if (!plan || !studentId) {
    res.status(400).json({ error: "Plan and student ID are required." });
    return;
  }

  if (plan !== "weekly" && plan !== "monthly") {
    res.status(400).json({ error: "Plan must be 'weekly' or 'monthly'." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  // GHS amounts in pesewas: weekly (14 days) = GH₵44.80 = 4480, monthly (28 days) = GH₵168.00 = 16800
  const amount = plan === "monthly" ? 16800 : 4480;
  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const email = `${safeId}@quizyourmind.com`;
  const reference = `intl${safeId}${Date.now()}`;

  try {
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        reference,
        channels: ["card", "bank", "ussd", "qr", "mobile_money"],
        metadata: {
          studentId,
          plan,
          currency: "GHS",
          acceptsInternational: true,
        },
      }),
    });

    const initData = await initRes.json() as {
      status: boolean;
      message?: string;
      data?: { access_code: string; authorization_url: string; reference: string };
    };

    if (!initData.status || !initData.data) {
      res.status(400).json({ error: initData.message ?? "Failed to initialize payment." });
      return;
    }

    res.json({
      accessCode: initData.data.access_code,
      reference: initData.data.reference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

/* ── Initialize a Paystack Popup transaction for international card/bank payments (renewal) ── */
paystackRouter.post("/paystack/init-renewal-transaction", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const studentId = req.user?.studentId;
  if (!userId || !studentId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const { plan } = req.body as { plan?: "weekly" | "monthly" };

  if (!plan || (plan !== "weekly" && plan !== "monthly")) {
    res.status(400).json({ error: "Plan must be 'weekly' or 'monthly'." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  // GHS amounts in pesewas: weekly (14 days) = GH₵44.80 = 4480, monthly (28 days) = GH₵168.00 = 16800
  const amount = plan === "monthly" ? 16800 : 4480;
  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const reference = `intlrenew${safeId}${Date.now()}`;

  const [userRowIntl] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const email = userRowIntl?.email ?? `${safeId}@quizyourmind.com`;

  // Pre-bind the reference so confirm-renewal can validate ownership
  await db.update(usersTable).set({ pendingRenewalRef: reference }).where(eq(usersTable.id, userId));

  try {
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        reference,
        channels: ["card", "bank", "ussd", "qr", "mobile_money"],
        metadata: {
          studentId,
          plan,
          currency: "GHS",
          acceptsInternational: true,
        },
      }),
    });

    const initData = await initRes.json() as {
      status: boolean;
      message?: string;
      data?: { access_code: string; authorization_url: string; reference: string };
    };

    if (!initData.status || !initData.data) {
      await db.update(usersTable).set({ pendingRenewalRef: null }).where(eq(usersTable.id, userId));
      res.status(400).json({ error: initData.message ?? "Failed to initialize payment." });
      return;
    }

    res.json({
      accessCode: initData.data.access_code,
      reference: initData.data.reference,
      email,
      amount,
    });
  } catch (err: unknown) {
    await db.update(usersTable).set({ pendingRenewalRef: null }).where(eq(usersTable.id, userId)).catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

/* ── Submit OTP for a pending charge ── */
paystackRouter.post("/paystack/submit-otp", async (req, res) => {
  const { otp, reference } = req.body as { otp?: string; reference?: string };
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  if (!otp || !reference) {
    res.status(400).json({ error: "OTP and reference are required." });
    return;
  }

  try {
    const submitRes = await fetch("https://api.paystack.co/charge/submit_otp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp, reference }),
    });

    const raw = await submitRes.text();

    let submitData: {
      status: boolean | string;
      message?: string;
      data?: { status: string; reference: string; display_text?: string };
    };

    try {
      submitData = JSON.parse(raw) as typeof submitData;
    } catch {
      res.status(500).json({ error: "Invalid response from payment gateway." });
      return;
    }

    const dataStatus = submitData.data?.status ?? "";

    if (dataStatus === "success") {
      res.json({ status: "success", reference });
      return;
    }

    const stillPending = ["pay_offline", "pending", "charge_attempted", "ongoing", "send_otp"];
    if (stillPending.includes(dataStatus)) {
      res.json({
        status: "pending",
        reference,
        displayText: submitData.data?.display_text ?? "Payment is being processed.",
      });
      return;
    }

    const detail = (submitData.data as { message?: string } | undefined)?.message;
    res.status(400).json({ error: detail ?? submitData.message ?? "OTP verification failed. Please try again." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

/* ── Poll the status of a pending charge ── */
paystackRouter.get("/paystack/check-charge/:reference", async (req, res) => {
  const { reference } = req.params;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  try {
    const checkRes = await fetch(
      `https://api.paystack.co/charge/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkData = await checkRes.json() as {
      status: boolean;
      message?: string;
      data?: {
        status: string;
        reference: string;
        display_text?: string;
        gateway_response?: string;
        message?: string;
        failure_code?: string;
        failure_message?: string;
      };
    };

    req.log.info({
      paystackChargeStatus: checkData.data?.status,
      paystackDisplayText: checkData.data?.display_text,
      paystackGatewayResponse: checkData.data?.gateway_response,
      paystackFailureCode: checkData.data?.failure_code,
      paystackFailureMessage: checkData.data?.failure_message,
      paystackMessage: checkData.message,
      reference,
    }, "Paystack check-charge response");

    if (!checkData.status || !checkData.data) {
      res.status(400).json({ error: "Could not verify charge status." });
      return;
    }

    res.json({
      status: checkData.data.status,
      reference: checkData.data.reference,
      displayText: checkData.data.display_text || checkData.data.failure_message || checkData.data.gateway_response || "",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to check charge status.", detail: message });
  }
});

/* ── Verify payment and create account ── */
paystackRouter.post("/auth/verify-payment", async (req, res) => {
  const { reference, fullName, studentId, level, institution, password, country } = req.body;

  if (!reference || !fullName || !studentId || !level || !institution || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const validLevels = ["100", "200", "300", "400", "500", "600"];
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: "Invalid level selected." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json() as {
      status: boolean;
      data?: {
        status: string;
        amount?: number;
        currency?: string;
        channel?: string;
        customer?: { customer_code?: string };
        authorization?: { authorization_code?: string };
      };
    };

    if (!verifyData.status || verifyData.data?.status !== "success") {
      res.status(402).json({ error: "Payment verification failed. Transaction was not successful." });
      return;
    }

    const customerCode = verifyData.data?.customer?.customer_code ?? null;
    const cardAuthCode = verifyData.data?.authorization?.authorization_code ?? null;
    const paystackCurrency = (verifyData.data?.currency ?? "GHS").toUpperCase();
    const amountRaw = verifyData.data?.amount ?? 0;
    const paymentChannel = (verifyData.data?.channel ?? "").toLowerCase();

    // Determine plan type and currency from actual Paystack response
    let planType: "weekly" | "monthly";
    let planCurrency: "GHS" | "USD";

    // Detect payment method via channel: "mobile_money" → Ghana MoMo → GHS virtual balance
    // Card/bank → non-Ghana → USD virtual balance
    // Thresholds (pesewas): MoMo weekly=1200, card weekly=4480, MoMo monthly=4800, card monthly=16800
    // >= 4800 → monthly; < 4800 → weekly (card weekly 4480 < 4800 ✓)
    const isMoMo = paymentChannel === "mobile_money";
    planCurrency = isMoMo ? "GHS" : "USD";
    planType = amountRaw >= 4800 ? "monthly" : "weekly";
    void paystackCurrency;

    // Card payments → use weekly/monthly plan codes for non-Ghana users
    // MoMo payments → plan is embedded in the charge itself (PLN_0qbjvklw8g5dbdw)
    let subscriptionCode: string | null = null;
    if (customerCode && cardAuthCode && !isMoMo) {
      try {
        const createSubRes = await fetch("https://api.paystack.co/subscription", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer: customerCode, plan: USD_PLAN_CODES[planType], authorization: cardAuthCode }),
        });
        const createSubData = await createSubRes.json() as {
          status: boolean;
          data?: { subscription_code?: string };
        };
        if (createSubData.status && createSubData.data?.subscription_code) {
          subscriptionCode = createSubData.data.subscription_code;
        }
      } catch {
        // non-fatal
      }
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "A user with this Student ID already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const planFields = seedPlanFields(planType, planCurrency);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        name: fullName,
        studentId,
        level: level as "100" | "200" | "300" | "400" | "500" | "600",
        institution,
        passwordHash,
        subscriptionStatus: "active",
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subscriptionCode,
        cardAuthCode: cardAuthCode,
        accountBalance: planFields.accountBalance,
        planType: planFields.planType,
        planCurrency: planFields.planCurrency,
        planStartDate: planFields.planStartDate,
        planEndDate: planFields.planEndDate,
        lastDeductedDate: planFields.lastDeductedDate,
        country: country ?? null,
      })
      .returning({ id: usersTable.id });

    const token = signToken({ userId: newUser.id, studentId });
    res.status(201).json({ success: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Registration failed. Please try again.", detail: message });
  }
});

/* ── Initiate a renewal MoMo charge for an existing authenticated user ── */
paystackRouter.post("/paystack/renew-charge", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const studentId = req.user?.studentId;
  if (!userId || !studentId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const { phone, provider, plan } = req.body as {
    phone?: string;
    provider?: string;
    plan?: "weekly" | "monthly";
  };

  if (!phone || !provider || !plan) {
    res.status(400).json({ error: "Phone number, provider, and plan are required." });
    return;
  }

  const validProviders = ["mtn", "vod", "atl"];
  if (!validProviders.includes(provider)) {
    res.status(400).json({ error: "Invalid mobile money provider." });
    return;
  }

  if (plan !== "weekly" && plan !== "monthly") {
    res.status(400).json({ error: "Plan must be 'weekly' or 'monthly'." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  const amount = plan === "monthly" ? 4800 : 1200;
  const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
  const reference = `renew${safeId}${Date.now()}`;

  const [userRow] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const email = userRow?.email ?? `${safeId}@quizyourmind.com`;

  /* Pre-bind the reference so confirm-renewal can validate ownership */
  await db.update(usersTable).set({ pendingRenewalRef: reference }).where(eq(usersTable.id, userId));

  try {
    const chargeRes = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        reference,
        plan: GHS_PLAN_CODES[plan],
        mobile_money: { phone, provider },
      }),
    });

    const rawText = await chargeRes.text();

    let chargeData: {
      status: boolean | string;
      message?: string;
      data?: { status: string; reference: string; display_text?: string };
    };

    try {
      chargeData = JSON.parse(rawText) as typeof chargeData;
    } catch {
      res.status(500).json({ error: "Invalid response from payment gateway." });
      return;
    }

    const chargeStatus = chargeData.data?.status ?? "";
    const pendingStatuses = ["pay_offline", "send_otp", "pending", "charge_attempted", "ongoing"];

    req.log.info({ chargeStatus, chargeMessage: chargeData.message, displayText: chargeData.data?.display_text, reference }, "Paystack renew-charge response");

    if (chargeStatus === "success") {
      res.json({ status: "success", reference });
      return;
    }

    if (pendingStatuses.includes(chargeStatus)) {
      res.json({
        status: "pending",
        reference,
        requiresOtp: chargeStatus === "send_otp",
        displayText: chargeData.data?.display_text ?? "A prompt has been sent to your phone. Enter your MoMo PIN to approve the payment.",
      });
      return;
    }

    // Non-success, non-pending: clear the pre-bound reference
    await db.update(usersTable).set({ pendingRenewalRef: null }).where(eq(usersTable.id, userId));

    const outerOk = chargeData.status === true || chargeData.status === "true";
    if (!outerOk) {
      const detail = (chargeData.data as { message?: string } | undefined)?.message;
      res.status(400).json({ error: detail ?? chargeData.message ?? "Failed to initiate charge." });
      return;
    }

    const detail = (chargeData.data as { message?: string } | undefined)?.message;
    res.status(400).json({ error: chargeData.data?.display_text ?? detail ?? chargeData.message ?? "Could not initiate MoMo charge. Please try again." });
  } catch (err: unknown) {
    await db.update(usersTable).set({ pendingRenewalRef: null }).where(eq(usersTable.id, userId)).catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to reach payment gateway.", detail: message });
  }
});

/* ── Confirm renewal after successful charge polling ── */
paystackRouter.post("/paystack/confirm-renewal", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const studentId = req.user?.studentId;
  if (!userId || !studentId) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const { reference } = req.body as { reference?: string };
  if (!reference) {
    res.status(400).json({ error: "Reference is required." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  try {
    // Validate reference was issued for this user (prevents replay)
    const [userRow] = await db
      .select({ pendingRenewalRef: usersTable.pendingRenewalRef, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userRow || userRow.pendingRenewalRef !== reference) {
      res.status(403).json({ error: "Invalid or expired payment reference." });
      return;
    }

    // Store the user's actual email for the ownership check below
    const userEmail = userRow.email;

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" } }
    );

    const verifyData = await verifyRes.json() as {
      status: boolean;
      data?: {
        status: string;
        amount?: number;
        currency?: string;
        channel?: string;
        customer?: { email?: string; customer_code?: string };
        authorization?: { authorization_code?: string };
      };
    };

    if (!verifyData.status || verifyData.data?.status !== "success") {
      res.status(402).json({ error: "Payment not confirmed. Please try again." });
      return;
    }

    // Derive plan from actual Paystack currency and amount — never trust client-supplied values
    const paystackCurrency = (verifyData.data?.currency ?? "GHS").toUpperCase();
    const amountRaw = verifyData.data?.amount ?? 0;
    const renewalCardAuthCode = verifyData.data?.authorization?.authorization_code ?? null;
    const renewalChannel = (verifyData.data?.channel ?? "").toLowerCase();
    const verifiedCustomerCode = verifyData.data?.customer?.customer_code ?? null;

    let planType: "weekly" | "monthly";
    let planCurrency: "GHS" | "USD";

    // Detect payment method via channel: "mobile_money" → Ghana MoMo → GHS virtual balance
    // Card/bank → non-Ghana → USD virtual balance
    // Thresholds (pesewas): MoMo weekly=1200, card weekly=4480, MoMo monthly=4800, card monthly=16800
    const isRenewalMoMo = renewalChannel === "mobile_money";
    planCurrency = isRenewalMoMo ? "GHS" : "USD";
    planType = amountRaw >= 4800 ? "monthly" : "weekly";
    void paystackCurrency;

    // Ensure the charge email matches this user.
    // The charge was initiated with the user's stored email (or synthetic fallback),
    // so we compare against the DB email first, then the synthetic fallback.
    const safeId = studentId.replace(/[^a-zA-Z0-9]/g, "");
    const syntheticEmail = `${safeId}@quizyourmind.com`;
    const chargeEmail = (verifyData.data?.customer?.email ?? "").toLowerCase();
    const dbEmail = (userEmail ?? "").toLowerCase();
    const expectedEmails = [syntheticEmail.toLowerCase()];
    if (dbEmail) expectedEmails.push(dbEmail);
    if (chargeEmail && !expectedEmails.includes(chargeEmail)) {
      res.status(403).json({ error: "Payment reference does not belong to this account." });
      return;
    }

    const planFields = seedPlanFields(planType, planCurrency);
    const now = new Date();

    const renewalUpdate: Record<string, unknown> = {
      subscriptionStatus: "active",
      accountBalance: planFields.accountBalance,
      planType: planFields.planType,
      planCurrency: planFields.planCurrency,
      planStartDate: planFields.planStartDate,
      planEndDate: planFields.planEndDate,
      lastDeductedDate: null,
      pendingRenewalRef: null,
      updatedAt: now,
    };

    // Always save the customer code from the verified transaction if we have it
    if (verifiedCustomerCode) {
      renewalUpdate.paystackCustomerCode = verifiedCustomerCode;
    }

    // Fetch the existing customer code (may already be set from a previous payment)
    const [userForSub] = await db
      .select({ paystackCustomerCode: usersTable.paystackCustomerCode })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const effectiveCustomerCode = verifiedCustomerCode ?? userForSub?.paystackCustomerCode ?? null;

    if (isRenewalMoMo) {
      // MoMo: Paystack auto-creates a subscription when `plan` is passed in the charge.
      // Fetch the subscription code so future webhook renewals are matched to this user.
      if (effectiveCustomerCode) {
        const planCode = GHS_PLAN_CODES[planType];
        const ghsSubCode = await fetchGHSSubscriptionCode(secretKey, effectiveCustomerCode, planCode);
        if (ghsSubCode) {
          renewalUpdate.paystackSubscriptionCode = ghsSubCode;
        }
      }
    } else if (renewalCardAuthCode) {
      // Card payments (non-Ghana) → subscribe/re-subscribe to USD plan
      renewalUpdate.cardAuthCode = renewalCardAuthCode;

      if (effectiveCustomerCode) {
        const subCode = await createUSDSubscription(secretKey, effectiveCustomerCode, renewalCardAuthCode, planType);
        if (subCode) {
          renewalUpdate.paystackSubscriptionCode = subCode;
        }
      }
    }

    await db
      .update(usersTable)
      .set(renewalUpdate)
      .where(eq(usersTable.id, userId));

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Renewal failed. Please try again.", detail: message });
  }
});

/* ── Charge card directly for registration ── */
paystackRouter.post("/paystack/charge-card-registration", async (req, res) => {
  const { cardNumber, cvv, expiryMonth, expiryYear, plan, studentId } = req.body;

  if (!cardNumber || !cvv || !expiryMonth || !expiryYear || !plan || !studentId) {
    res.status(400).json({ error: "All card details are required." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  // GHS amounts in pesewas: weekly (14 days) = GH₵44.80 = 4480, monthly (28 days) = GH₵168.00 = 16800
  const amount = plan === "monthly" ? 16800 : 4480;
  const safeId = String(studentId).replace(/[^a-zA-Z0-9]/g, "");
  const email = `${safeId}@quizyourmind.com`;

  try {
    const chargeRes = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "GHS",
        card: {
          number: String(cardNumber).replace(/\s/g, ""),
          cvv: String(cvv),
          expiry_month: String(expiryMonth).padStart(2, "0"),
          expiry_year: String(expiryYear).length === 2 ? `20${expiryYear}` : String(expiryYear),
        },
      }),
    });

    const chargeData = await chargeRes.json() as {
      status: boolean;
      message?: string;
      data?: {
        status: string;
        reference?: string;
        display_text?: string;
        url?: string;
      };
    };

    if (!chargeData.status) {
      res.status(400).json({ error: chargeData.message ?? "Card charge failed. Please check your card details." });
      return;
    }

    const d = chargeData.data ?? {};
    res.json({ status: d.status, reference: d.reference, displayText: d.display_text, url: d.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not reach payment gateway.", detail: message });
  }
});

/* ── Submit OTP for card registration charge ── */
paystackRouter.post("/paystack/submit-card-otp", async (req, res) => {
  const { otp, reference } = req.body;

  if (!otp || !reference) {
    res.status(400).json({ error: "OTP and reference are required." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  try {
    const otpRes = await fetch("https://api.paystack.co/charge/submit_otp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp, reference }),
    });

    const otpData = await otpRes.json() as {
      status: boolean;
      message?: string;
      data?: { status: string; reference?: string; display_text?: string };
    };

    if (!otpData.status) {
      res.status(400).json({ error: otpData.message ?? "OTP verification failed." });
      return;
    }

    const d = otpData.data ?? {};
    res.json({ status: d.status, reference: d.reference, displayText: d.display_text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not reach payment gateway.", detail: message });
  }
});

/* ── Submit PIN for card registration charge ── */
paystackRouter.post("/paystack/submit-card-pin", async (req, res) => {
  const { pin, reference } = req.body;

  if (!pin || !reference) {
    res.status(400).json({ error: "PIN and reference are required." });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment system not configured." });
    return;
  }

  try {
    const pinRes = await fetch("https://api.paystack.co/charge/submit_pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin, reference }),
    });

    const pinData = await pinRes.json() as {
      status: boolean;
      message?: string;
      data?: { status: string; reference?: string; display_text?: string };
    };

    if (!pinData.status) {
      res.status(400).json({ error: pinData.message ?? "PIN verification failed." });
      return;
    }

    const d = pinData.data ?? {};
    res.json({ status: d.status, reference: d.reference, displayText: d.display_text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not reach payment gateway.", detail: message });
  }
});

/* ── Paystack webhook — handles automatic subscription renewals ── */
paystackRouter.post("/paystack/webhook", async (req: Request & { rawBody?: Buffer }, res) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.sendStatus(500);
    return;
  }

  // Verify webhook signature
  const signature = req.headers["x-paystack-signature"] as string | undefined;
  const rawBody = req.rawBody;

  if (rawBody && signature) {
    const hash = createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (hash !== signature) {
      res.sendStatus(401);
      return;
    }
  }

  const event = req.body as {
    event?: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      customer?: { customer_code?: string };
      subscription?: { subscription_code?: string };
      authorization?: { authorization_code?: string };
    };
  };

  // Handle successful subscription charge (GHS MoMo auto-renew OR USD card auto-renew)
  if (event.event === "charge.success" && event.data?.subscription) {
    const customerCode = event.data.customer?.customer_code;
    const currency = (event.data.currency ?? "").toUpperCase();
    const amount = event.data.amount ?? 0;
    const newAuthCode = event.data.authorization?.authorization_code;
    const subCode = event.data.subscription?.subscription_code;

    if (customerCode) {
      try {
        const [user] = await db
          .select({ id: usersTable.id, planType: usersTable.planType })
          .from(usersTable)
          .where(eq(usersTable.paystackCustomerCode, customerCode))
          .limit(1);

        if (user) {
          // GHS = MoMo (Ghana), anything else = card/bank (non-Ghana → treat as USD)
          const planCurrency: "GHS" | "USD" = currency === "GHS" ? "GHS" : "USD";
          // GHS thresholds: weekly=1200 pesewas, monthly=4800 pesewas
          // USD thresholds: weekly=400 cents ($4), monthly=1500 cents ($15)
          const planType: "weekly" | "monthly" = planCurrency === "GHS"
            ? (amount >= 4800 ? "monthly" : "weekly")
            : (amount >= 1500 ? "monthly" : "weekly");
          const planFields = seedPlanFields(planType, planCurrency);
          const now = new Date();

          await db
            .update(usersTable)
            .set({
              subscriptionStatus: "active",
              accountBalance: planFields.accountBalance,
              planType: planFields.planType,
              planCurrency: planFields.planCurrency,
              planStartDate: planFields.planStartDate,
              planEndDate: planFields.planEndDate,
              lastDeductedDate: null,
              updatedAt: now,
              ...(newAuthCode ? { cardAuthCode: newAuthCode } : {}),
              ...(subCode ? { paystackSubscriptionCode: subCode } : {}),
            })
            .where(eq(usersTable.id, user.id));
        }
      } catch {
        // Non-fatal — respond 200 so Paystack doesn't retry indefinitely
      }
    }
  }

  res.sendStatus(200);
});

export default paystackRouter;
