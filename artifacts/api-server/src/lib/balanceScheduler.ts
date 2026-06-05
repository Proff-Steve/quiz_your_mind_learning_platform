import { db, usersTable } from "@workspace/db";
import { and, eq, isNotNull, isNull, lt, lte, ne, or } from "drizzle-orm";
import { logger } from "./logger.js";

// GHS plan constants
const GHS_WEEKLY_AMOUNT = 12.0;
const GHS_MONTHLY_AMOUNT = 48.0;
const GHS_WEEKLY_DAYS = 7;
const GHS_MONTHLY_DAYS = 28;

// USD plan constants (weekly = 7 days, monthly = 28 days)
const USD_WEEKLY_AMOUNT = 4.0;
const USD_MONTHLY_AMOUNT = 15.0;
const USD_WEEKLY_DAYS = 7;
const USD_MONTHLY_DAYS = 28;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPlanParams(
  planType: "weekly" | "monthly",
  currency: "GHS" | "USD" = "GHS"
): { amount: number; days: number } {
  if (currency === "USD") {
    return planType === "monthly"
      ? { amount: USD_MONTHLY_AMOUNT, days: USD_MONTHLY_DAYS }
      : { amount: USD_WEEKLY_AMOUNT, days: USD_WEEKLY_DAYS };
  }
  return planType === "monthly"
    ? { amount: GHS_MONTHLY_AMOUNT, days: GHS_MONTHLY_DAYS }
    : { amount: GHS_WEEKLY_AMOUNT, days: GHS_WEEKLY_DAYS };
}

export function seedPlanFields(
  planType: "weekly" | "monthly",
  currency: "GHS" | "USD" = "GHS",
  startDate: Date = new Date()
): {
  accountBalance: string;
  planType: "weekly" | "monthly";
  planCurrency: string;
  planStartDate: Date;
  planEndDate: Date;
  lastDeductedDate: null;
} {
  const { amount, days } = getPlanParams(planType, currency);
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    accountBalance: amount.toFixed(2),
    planType,
    planCurrency: currency,
    planStartDate: startDate,
    planEndDate: endDate,
    lastDeductedDate: null,
  };
}

async function runDailyDeduction(): Promise<void> {
  const today = todayUTC();
  const now = new Date();

  // --- Pass 1: Expire all active users whose planEndDate has passed ---
  // USD users with a Paystack subscription are renewed automatically via webhook.
  // The scheduler simply expires them here; the webhook reactivates them when
  // Paystack confirms the charge.
  const toExpire = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.subscriptionStatus, "active"),
        isNotNull(usersTable.planEndDate),
        lte(usersTable.planEndDate, now)
      )
    );

  let expired = 0;
  for (const user of toExpire) {
    await db
      .update(usersTable)
      .set({
        accountBalance: "0.00",
        subscriptionStatus: "expired",
        lastDeductedDate: today,
        updatedAt: now,
      })
      .where(eq(usersTable.id, user.id));
    expired++;
  }

  if (expired > 0) {
    logger.info(`Daily balance run: ${expired} expired`);
  }

  // --- Pass 2: Deduct daily amount from active users who haven't been deducted today ---
  // NOTE: ne(col, value) returns NULL (not TRUE) when col IS NULL in PostgreSQL,
  // so we must explicitly include isNull() to catch first-time deductions.
  const toDeduct = await db
    .select({
      id: usersTable.id,
      accountBalance: usersTable.accountBalance,
      planType: usersTable.planType,
      planCurrency: usersTable.planCurrency,
    })
    .from(usersTable)
    .where(
      and(
        isNotNull(usersTable.planType),
        eq(usersTable.subscriptionStatus, "active"),
        or(
          isNull(usersTable.lastDeductedDate),
          ne(usersTable.lastDeductedDate, today)
        )
      )
    );

  let deducted = 0;
  for (const user of toDeduct) {
    const planType = user.planType as "weekly" | "monthly";
    const currency = (user.planCurrency ?? "GHS") as "GHS" | "USD";
    const { amount, days } = getPlanParams(planType, currency);
    const dailyRate = amount / days;
    const currentBalance = parseFloat(user.accountBalance ?? "0");
    const newBalance = Math.max(0, currentBalance - dailyRate);

    await db
      .update(usersTable)
      .set({
        accountBalance: newBalance.toFixed(2),
        lastDeductedDate: today,
        updatedAt: now,
      })
      .where(eq(usersTable.id, user.id));
    deducted++;
  }

  if (deducted > 0) {
    logger.info(`Daily balance run: ${deducted} deducted`);
  }
}

function msUntilNextMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return nextMidnight.getTime() - now.getTime();
}

export async function startBalanceScheduler(): Promise<void> {
  try {
    await runDailyDeduction();
  } catch (err) {
    logger.error({ err }, "Initial daily deduction check failed");
  }

  // Primary: fire exactly at UTC midnight each day
  function scheduleNextRun(): void {
    const delay = msUntilNextMidnightUTC();
    setTimeout(async () => {
      try {
        await runDailyDeduction();
      } catch (err) {
        logger.error({ err }, "Daily balance deduction failed");
      }
      scheduleNextRun();
    }, delay);
  }

  scheduleNextRun();

  // Backup: run every hour so missed midnight runs (e.g. server restart) are
  // caught within 60 minutes. runDailyDeduction() is idempotent — it checks
  // lastDeductedDate so it never double-deducts on the same calendar day.
  setInterval(async () => {
    try {
      await runDailyDeduction();
    } catch (err) {
      logger.error({ err }, "Hourly balance deduction check failed");
    }
  }, 60 * 60 * 1000);

  logger.info("Balance scheduler started — next deduction at UTC midnight (hourly backup active)");
}
