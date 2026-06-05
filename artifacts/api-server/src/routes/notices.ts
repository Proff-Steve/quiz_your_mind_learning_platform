import { Router } from "express";
import { db, noticesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const noticesRouter = Router();

noticesRouter.get("/notices", requireAuth, async (_req, res) => {
  try {
    const notices = await db
      .select({
        id: noticesTable.id,
        title: noticesTable.title,
        content: noticesTable.content,
        createdAt: noticesTable.createdAt,
      })
      .from(noticesTable)
      .orderBy(desc(noticesTable.createdAt))
      .limit(20);

    res.json({ notices });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not fetch notices.", detail: message });
  }
});

noticesRouter.post("/admin/notices", async (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Admin notice posting is not configured on this server." });
    return;
  }

  const providedSecret = req.headers["x-admin-secret"];
  if (!providedSecret || providedSecret !== adminSecret) {
    res.status(401).json({ error: "Unauthorized. Invalid admin secret." });
    return;
  }

  const { title, content } = req.body as { title?: string; content?: string };
  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ error: "Title and content are required." });
    return;
  }
  if (title.trim().length > 255) {
    res.status(400).json({ error: "Title must be 255 characters or fewer." });
    return;
  }
  if (content.trim().length > 10000) {
    res.status(400).json({ error: "Content must be 10,000 characters or fewer." });
    return;
  }

  try {
    const [notice] = await db
      .insert(noticesTable)
      .values({ title: title.trim(), content: content.trim() })
      .returning();

    res.status(201).json({ notice });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not post notice.", detail: message });
  }
});

export default noticesRouter;
