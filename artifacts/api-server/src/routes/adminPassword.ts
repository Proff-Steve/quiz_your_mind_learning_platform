import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const adminPasswordRouter = Router();

function requireAdmin(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
) {
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

adminPasswordRouter.post("/admin/user-password", requireAdmin, async (req, res) => {
  const { studentId, newPassword } = req.body as {
    studentId?: string;
    newPassword?: string;
  };

  if (!studentId?.trim()) {
    res.status(400).json({ error: "studentId is required." });
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters." });
    return;
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, studentId: usersTable.studentId })
      .from(usersTable)
      .where(eq(usersTable.studentId, studentId.trim()))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "No user found with that Student ID." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    res.json({ ok: true, studentId: user.studentId, name: user.name });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update password.", detail: message });
  }
});

export default adminPasswordRouter;
