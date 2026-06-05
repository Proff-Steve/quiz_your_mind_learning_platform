import { Router } from "express";
import { db, usersTable, examsTable, attemptsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const userRouter = Router();

userRouter.get("/user/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        studentId: usersTable.studentId,
        email: usersTable.email,
        level: usersTable.level,
        institution: usersTable.institution,
        country: usersTable.country,
        profilePicture: usersTable.profilePicture,
        subscriptionStatus: usersTable.subscriptionStatus,
        accountBalance: usersTable.accountBalance,
        virtualBalance: usersTable.virtualBalance,
        planType: usersTable.planType,
        planCurrency: usersTable.planCurrency,
        planEndDate: usersTable.planEndDate,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({
      ...user,
      accountBalance: parseFloat(user.accountBalance ?? "0").toFixed(2),
      virtualBalance: parseFloat(user.virtualBalance ?? "0").toFixed(2),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch profile.", detail: message });
  }
});

userRouter.post("/user/profile-picture", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dataUrl } = req.body as { dataUrl?: string };
    if (!dataUrl || typeof dataUrl !== "string") {
      res.status(400).json({ error: "No image data provided." });
      return;
    }
    if (!dataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "Invalid image format." });
      return;
    }
    if (dataUrl.length > 2 * 1024 * 1024) {
      res.status(400).json({ error: "Image too large. Maximum 1.5 MB." });
      return;
    }

    await db
      .update(usersTable)
      .set({ profilePicture: dataUrl, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId));

    res.json({ ok: true, profilePicture: dataUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update profile picture.", detail: message });
  }
});

userRouter.put("/user/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, institution, level } = req.body as {
      name?: string;
      institution?: string;
      level?: string;
    };

    const validLevels = ["100", "200", "300", "400", "500", "600"] as const;
    type LevelType = typeof validLevels[number];

    let changed = false;

    if (name && typeof name === "string" && name.trim()) {
      await db.update(usersTable).set({ name: name.trim(), updatedAt: new Date() }).where(eq(usersTable.id, req.user!.userId));
      changed = true;
    }
    if (institution && typeof institution === "string" && institution.trim()) {
      await db.update(usersTable).set({ institution: institution.trim(), updatedAt: new Date() }).where(eq(usersTable.id, req.user!.userId));
      changed = true;
    }
    if (level && (validLevels as readonly string[]).includes(level)) {
      await db.update(usersTable).set({ level: level as LevelType, updatedAt: new Date() }).where(eq(usersTable.id, req.user!.userId));
      changed = true;
    }

    if (!changed) {
      res.status(400).json({ error: "No valid fields to update." });
      return;
    }

    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update profile.", detail: message });
  }
});

userRouter.put("/user/password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Both current and new password are required." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters." });
      return;
    }

    const [user] = await db
      .select({ id: usersTable.id, passwordHash: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      res.status(400).json({ error: "Current password is incorrect." });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId));

    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not change password.", detail: message });
  }
});

userRouter.put("/user/username", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { username } = req.body as { username?: string };

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required." });
      return;
    }

    const trimmed = username.trim();

    if (!trimmed.startsWith("@")) {
      res.status(400).json({ error: "Username must start with @." });
      return;
    }

    const handle = trimmed.slice(1);
    if (handle.length < 2) {
      res.status(400).json({ error: "Username must be at least 3 characters (e.g. @xy)." });
      return;
    }
    if (handle.length > 49) {
      res.status(400).json({ error: "Username must be 50 characters or fewer." });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      res.status(400).json({ error: "Username may only contain letters, numbers, and underscores after @." });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, trimmed))
      .limit(1);

    if (existing.length > 0 && existing[0]!.id !== req.user!.userId) {
      res.status(409).json({ error: "That username is already taken. Please choose another." });
      return;
    }

    await db
      .update(usersTable)
      .set({ username: trimmed, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId));

    res.json({ ok: true, username: trimmed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update username.", detail: message });
  }
});

userRouter.put("/user/email", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const trimmed = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, trimmed))
      .limit(1);

    if (existing.length > 0 && existing[0]!.id !== req.user!.userId) {
      res.status(409).json({ error: "That email address is already in use by another account." });
      return;
    }

    await db
      .update(usersTable)
      .set({ email: trimmed, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.userId));

    res.json({ ok: true, email: trimmed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update email.", detail: message });
  }
});

userRouter.get("/user/activity", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const exams = await db
      .select({
        id: examsTable.id,
        title: examsTable.title,
        durationMinutes: examsTable.durationMinutes,
        difficulty: examsTable.difficulty,
        mode: examsTable.mode,
        createdAt: examsTable.createdAt,
      })
      .from(examsTable)
      .where(eq(examsTable.userId, userId))
      .orderBy(desc(examsTable.createdAt))
      .limit(7);

    const attempts = await db
      .select({
        examId: attemptsTable.examId,
        score: attemptsTable.score,
        createdAt: attemptsTable.createdAt,
      })
      .from(attemptsTable)
      .where(eq(attemptsTable.userId, userId));

    const attemptMap = new Map<number, { score: string; date: Date }>();
    for (const a of attempts) {
      if (a.examId === null) continue;
      const existing = attemptMap.get(a.examId);
      if (!existing || a.createdAt > existing.date) {
        attemptMap.set(a.examId, { score: a.score, date: a.createdAt });
      }
    }

    const activity = exams.map((exam) => {
      const attempt = attemptMap.get(exam.id);
      return {
        id: exam.id,
        title: exam.title,
        createdAt: exam.createdAt,
        difficulty: exam.mode ?? exam.difficulty,
        status: attempt ? "Completed" : "In Progress",
        score: attempt ? attempt.score : null,
      };
    });

    res.json({ activity });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch activity.", detail: message });
  }
});

userRouter.get("/user/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const rows = await db
      .select({
        id: attemptsTable.id,
        examId: attemptsTable.examId,
        examTitle: attemptsTable.examTitle,
        totalQuestions: attemptsTable.totalQuestions,
        score: attemptsTable.score,
        createdAt: attemptsTable.createdAt,
      })
      .from(attemptsTable)
      .where(eq(attemptsTable.userId, userId))
      .orderBy(desc(attemptsTable.createdAt));

    res.json({ history: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch history.", detail: message });
  }
});

export default userRouter;
