import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./index";

export const chatStatusEnum = pgEnum("chat_status", ["open", "closed"]);
export const chatSenderRoleEnum = pgEnum("chat_sender_role", ["user", "admin"]);

export const supportChatsTable = pgTable("support_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  status: chatStatusEnum("status").notNull().default("open"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const supportMessagesTable = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .notNull()
    .references(() => supportChatsTable.id, { onDelete: "cascade" }),
  senderRole: chatSenderRoleEnum("sender_role").notNull(),
  content: text("content").notNull().default(""),
  fileData: text("file_data"),
  fileName: text("file_name"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSupportChatSchema = createInsertSchema(supportChatsTable).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertSupportMessageSchema = createInsertSchema(supportMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type SupportChat = typeof supportChatsTable.$inferSelect;
export type InsertSupportChat = z.infer<typeof insertSupportChatSchema>;
export type SupportMessage = typeof supportMessagesTable.$inferSelect;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
