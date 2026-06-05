/**
 * One-time backfill script: assigns a GH₵ 12.00 / 7-day weekly plan
 * to all users whose planType is currently NULL (users registered before
 * the virtual balance feature was introduced).
 *
 * Run once: pnpm --filter @workspace/scripts run seed-user-balances
 * Safe to re-run: users with an existing plan are skipped.
 */

import { db, usersTable } from "@workspace/db";
import { eq, isNull } from "drizzle-orm";

const WEEKLY_AMOUNT = 12.0;
const WEEKLY_DAYS = 7;

async function main() {
  const unseeded = await db
    .select({ id: usersTable.id, studentId: usersTable.studentId })
    .from(usersTable)
    .where(isNull(usersTable.planType));

  if (unseeded.length === 0) {
    console.log("No users to seed — all users already have a plan type.");
    process.exit(0);
  }

  console.log(`Seeding ${unseeded.length} users with GH₵${WEEKLY_AMOUNT} weekly plan…`);

  const now = new Date();
  const planEndDate = new Date(now.getTime() + WEEKLY_DAYS * 24 * 60 * 60 * 1000);

  for (const user of unseeded) {
    await db
      .update(usersTable)
      .set({
        accountBalance: WEEKLY_AMOUNT.toFixed(2),
        planType: "weekly",
        planStartDate: now,
        planEndDate,
        lastDeductedDate: null,
        subscriptionStatus: "active",
        updatedAt: now,
      })
      .where(eq(usersTable.id, user.id));
  }

  console.log(`Done. Seeded ${unseeded.length} users.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
