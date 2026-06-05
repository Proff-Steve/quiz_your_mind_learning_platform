import { Router } from "express";
import multer from "multer";
import { db, supportChatsTable, supportMessagesTable, usersTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const chatRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

function adminCheck(req: AuthRequest, res: import("express").Response): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Admin chat is not configured on this server." });
    return false;
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== adminSecret) {
    res.status(401).json({ error: "Unauthorized. Invalid admin secret." });
    return false;
  }
  return true;
}

async function getOrCreateChat(userId: number): Promise<number> {
  const existing = await db
    .select({ id: supportChatsTable.id })
    .from(supportChatsTable)
    .where(eq(supportChatsTable.userId, userId))
    .orderBy(desc(supportChatsTable.createdAt))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const [created] = await db
    .insert(supportChatsTable)
    .values({ userId, status: "open" })
    .returning({ id: supportChatsTable.id });

  return created.id;
}

chatRouter.get("/chat/messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const chatId = await getOrCreateChat(userId);

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.chatId, chatId))
      .orderBy(asc(supportMessagesTable.createdAt));

    res.json({ chatId, messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not load chat messages.", detail: message });
  }
});

chatRouter.post(
  "/chat/message",
  requireAuth,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const chatId = await getOrCreateChat(userId);

      const content: string = req.body.content?.trim() ?? "";
      const file = req.file;

      if (!content && !file) {
        res.status(400).json({ error: "Message content or file is required." });
        return;
      }

      let fileData: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (file) {
        fileData = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        fileName = file.originalname;
        fileType = file.mimetype;
      }

      const [msg] = await db
        .insert(supportMessagesTable)
        .values({
          chatId,
          senderRole: "user",
          content,
          fileData: fileData ?? null,
          fileName: fileName ?? null,
          fileType: fileType ?? null,
        })
        .returning();

      await db
        .update(supportChatsTable)
        .set({ lastMessageAt: new Date(), status: "open" })
        .where(eq(supportChatsTable.id, chatId));

      res.status(201).json({ message: msg });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Could not send message.", detail: message });
    }
  }
);

chatRouter.get("/admin/chat/conversations", async (req: AuthRequest, res) => {
  if (!adminCheck(req, res)) return;
  try {
    const chats = await db
      .select({
        id: supportChatsTable.id,
        userId: supportChatsTable.userId,
        status: supportChatsTable.status,
        lastMessageAt: supportChatsTable.lastMessageAt,
        createdAt: supportChatsTable.createdAt,
        userName: usersTable.name,
        studentId: usersTable.studentId,
        institution: usersTable.institution,
      })
      .from(supportChatsTable)
      .leftJoin(usersTable, eq(supportChatsTable.userId, usersTable.id))
      .orderBy(desc(supportChatsTable.lastMessageAt));

    res.json({ chats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not load conversations.", detail: message });
  }
});

chatRouter.get("/admin/chat/conversations/:chatId/messages", async (req: AuthRequest, res) => {
  if (!adminCheck(req, res)) return;
  try {
    const chatId = Number(req.params.chatId);
    if (!chatId) {
      res.status(400).json({ error: "Invalid chat id." });
      return;
    }

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.chatId, chatId))
      .orderBy(asc(supportMessagesTable.createdAt));

    res.json({ messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not load messages.", detail: message });
  }
});

chatRouter.post(
  "/admin/chat/conversations/:chatId/reply",
  upload.single("file"),
  async (req: AuthRequest, res) => {
    if (!adminCheck(req, res)) return;
    try {
      const chatId = Number(req.params.chatId);
      if (!chatId) {
        res.status(400).json({ error: "Invalid chat id." });
        return;
      }

      const content: string = req.body.content?.trim() ?? "";
      const file = req.file;

      if (!content && !file) {
        res.status(400).json({ error: "Reply content or file is required." });
        return;
      }

      let fileData: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (file) {
        fileData = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        fileName = file.originalname;
        fileType = file.mimetype;
      }

      const [msg] = await db
        .insert(supportMessagesTable)
        .values({
          chatId,
          senderRole: "admin",
          content,
          fileData: fileData ?? null,
          fileName: fileName ?? null,
          fileType: fileType ?? null,
        })
        .returning();

      await db
        .update(supportChatsTable)
        .set({ lastMessageAt: new Date() })
        .where(eq(supportChatsTable.id, chatId));

      res.status(201).json({ message: msg });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Could not send reply.", detail: message });
    }
  }
);

chatRouter.patch("/admin/chat/conversations/:chatId/status", async (req: AuthRequest, res) => {
  if (!adminCheck(req, res)) return;
  try {
    const chatId = Number(req.params.chatId);
    const { status } = req.body as { status?: "open" | "closed" };
    if (!chatId || !status || !["open", "closed"].includes(status)) {
      res.status(400).json({ error: "Invalid chat id or status." });
      return;
    }

    await db
      .update(supportChatsTable)
      .set({ status })
      .where(eq(supportChatsTable.id, chatId));

    res.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Could not update status.", detail: message });
  }
});

export default chatRouter;
