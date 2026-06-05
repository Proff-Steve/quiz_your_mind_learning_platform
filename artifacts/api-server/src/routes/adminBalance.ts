import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const adminBalanceRouter = Router();

function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Admin features are not configured on this server." });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== adminSecret) {
    res.status(401).json({ error: "Unauthorized. Invalid admin secret." });
    return;
  }
  next();
}

adminBalanceRouter.get("/admin/user-balance", requireAdmin, async (req, res) => {
  const { studentId } = req.query as { studentId?: string };
  if (!studentId?.trim()) {
    res.status(400).json({ error: "studentId query parameter is required." });
    return;
  }

  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        studentId: usersTable.studentId,
        level: usersTable.level,
        institution: usersTable.institution,
        country: usersTable.country,
        accountBalance: usersTable.accountBalance,
        subscriptionStatus: usersTable.subscriptionStatus,
        planType: usersTable.planType,
        planCurrency: usersTable.planCurrency,
        planEndDate: usersTable.planEndDate,
      })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId.trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No user found with that Student ID." });
      return;
    }

    res.json({
      ...user,
      accountBalance: parseFloat(user.accountBalance ?? "0").toFixed(2),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch user.", detail: message });
  }
});

adminBalanceRouter.post("/admin/user-balance", requireAdmin, async (req, res) => {
  const { studentId, amount, action } = req.body as {
    studentId?: string;
    amount?: number;
    action?: "add" | "reduce" | "set";
  };

  if (!studentId?.trim()) {
    res.status(400).json({ error: "studentId is required." });
    return;
  }
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    res.status(400).json({ error: "amount must be a non-negative number." });
    return;
  }
  if (!action || !["add", "reduce", "set"].includes(action)) {
    res.status(400).json({ error: "action must be 'add', 'reduce', or 'set'." });
    return;
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id, accountBalance: usersTable.accountBalance, subscriptionStatus: usersTable.subscriptionStatus })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId.trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No user found with that Student ID." });
      return;
    }

    const current = parseFloat(user.accountBalance ?? "0");
    let newBalance: number;

    if (action === "add") {
      newBalance = current + amount;
    } else if (action === "reduce") {
      newBalance = Math.max(0, current - amount);
    } else {
      newBalance = Math.max(0, amount);
    }

    const newStatus = newBalance > 0 ? "active" : "expired";

    await db
      .update(usersTable)
      .set({
        accountBalance: newBalance.toFixed(2),
        subscriptionStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    res.json({
      ok: true,
      previousBalance: current.toFixed(2),
      newBalance: newBalance.toFixed(2),
      subscriptionStatus: newStatus,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update balance.", detail: message });
  }
});

adminBalanceRouter.patch("/admin/user-country", requireAdmin, async (req, res) => {
  const { studentId, country } = req.body as { studentId?: string; country?: string };

  if (!studentId?.trim()) {
    res.status(400).json({ error: "studentId is required." });
    return;
  }
  if (!country?.trim()) {
    res.status(400).json({ error: "country is required." });
    return;
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId.trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No user found with that Student ID." });
      return;
    }

    const newCountry = country.trim();
    const newPlanCurrency = newCountry === "Ghana" ? "GHS" : "USD";

    await db
      .update(usersTable)
      .set({ country: newCountry, planCurrency: newPlanCurrency, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    res.json({ ok: true, country: newCountry, planCurrency: newPlanCurrency });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update country.", detail: message });
  }
});

export default adminBalanceRouter;
