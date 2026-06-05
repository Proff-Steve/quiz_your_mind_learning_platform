import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, emailVerificationsTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { sendVerificationEmail } from "../lib/resend.js";

const authRouter = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

authRouter.post("/auth/register", async (req, res) => {
  const { fullName, studentId, email, level, institution, country, password } = req.body;

  if (!fullName || !studentId || !email || !level || !institution || !password) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const validLevels = ["100", "200", "300", "400", "500", "600"];
  if (!validLevels.includes(level)) {
    res.status(400).json({ error: "Invalid level selected." });
    return;
  }

  try {
    const existingById = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId))
      .limit(1);

    if (existingById.length > 0) {
      res.status(409).json({ error: "A user with this Student ID already exists." });
      return;
    }

    const existingByEmail = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingByEmail.length > 0) {
      res.status(409).json({ error: "An account with this email address already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(usersTable)
        .values({
          name: fullName,
          studentId,
          email: email.toLowerCase().trim(),
          level: level as "100" | "200" | "300" | "400" | "500" | "600",
          institution,
          country: country ?? null,
          passwordHash,
          subscriptionStatus: "expired",
          accountBalance: "0.00",
          planType: null,
          planStartDate: null,
          planEndDate: null,
          lastDeductedDate: null,
        })
        .returning({ id: usersTable.id });

      await tx.insert(emailVerificationsTable).values({
        userId: inserted.id,
        code: otp,
        expiresAt,
      });

      return inserted;
    });

    try {
      await sendVerificationEmail(email.toLowerCase().trim(), fullName, otp);
    } catch (emailErr) {
      req.log.error({ err: emailErr }, "Failed to send verification email");
    }

    const token = signToken({ userId: newUser.id, studentId });
    res.status(201).json({ success: true, token, userId: newUser.id, requiresVerification: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Registration failed. Please try again.", detail: message });
  }
});

authRouter.post("/auth/verify-email", async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    res.status(400).json({ error: "User ID and verification code are required." });
    return;
  }

  try {
    const now = new Date();
    const [verification] = await db
      .select()
      .from(emailVerificationsTable)
      .where(
        and(
          eq(emailVerificationsTable.userId, Number(userId)),
          eq(emailVerificationsTable.code, String(code).trim()),
          gt(emailVerificationsTable.expiresAt, now)
        )
      )
      .limit(1);

    if (!verification) {
      res.status(400).json({ error: "Invalid or expired verification code." });
      return;
    }

    const [userRow] = await db
      .select({ country: usersTable.country })
      .from(usersTable)
      .where(eq(usersTable.id, Number(userId)))
      .limit(1);

    const isGhana = (userRow?.country ?? "").toLowerCase().trim() === "ghana";
    const trialBalance = isGhana ? "1.71" : "0.57";
    const trialCurrency = isGhana ? "GHS" : "USD";
    const trialEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await db
      .update(usersTable)
      .set({
        emailVerified: now,
        subscriptionStatus: "active",
        accountBalance: trialBalance,
        planCurrency: trialCurrency,
        planEndDate: trialEndDate,
        updatedAt: now,
      })
      .where(eq(usersTable.id, Number(userId)));

    await db
      .delete(emailVerificationsTable)
      .where(eq(emailVerificationsTable.userId, Number(userId)));

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Verification failed. Please try again.", detail: message });
  }
});

authRouter.post("/auth/resend-verification", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: "User ID is required." });
    return;
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, emailVerified: usersTable.emailVerified })
      .from(usersTable)
      .where(eq(usersTable.id, Number(userId)))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email is already verified." });
      return;
    }

    if (!user.email) {
      res.status(400).json({ error: "No email address on file." });
      return;
    }

    await db
      .delete(emailVerificationsTable)
      .where(eq(emailVerificationsTable.userId, Number(userId)));

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(emailVerificationsTable).values({
      userId: Number(userId),
      code: otp,
      expiresAt,
    });

    try {
      await sendVerificationEmail(user.email, user.name, otp);
    } catch (emailErr) {
      req.log.error({ err: emailErr }, "Failed to send verification email on resend");
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not resend code. Please try again.", detail: message });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  const { studentId, password } = req.body;

  if (!studentId || !password) {
    res.status(400).json({ error: "Student ID and password are required." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid Student ID or password." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid Student ID or password." });
      return;
    }

    if (!user.emailVerified) {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db
        .delete(emailVerificationsTable)
        .where(eq(emailVerificationsTable.userId, user.id));

      await db.insert(emailVerificationsTable).values({
        userId: user.id,
        code: otp,
        expiresAt,
      });

      if (user.email) {
        try {
          await sendVerificationEmail(user.email, user.name, otp);
        } catch (emailErr) {
          req.log.error({ err: emailErr }, "Failed to send verification email on login");
        }
      }

      const token = signToken({ userId: user.id, studentId: user.studentId });
      res.status(403).json({
        error: "Email not verified.",
        requiresVerification: true,
        token,
        userId: user.id,
        email: user.email ?? "",
      });
      return;
    }

    const token = signToken({ userId: user.id, studentId: user.studentId });
    res.json({ success: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Login failed. Please try again.", detail: message });
  }
});

export default authRouter;
