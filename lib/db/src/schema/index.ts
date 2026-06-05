import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  numeric,
  pgEnum,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planTypeEnum = pgEnum("plan_type", ["weekly", "monthly"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "free",
  "active",
  "expired",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const levelEnum = pgEnum("level", [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique(),
  studentId: varchar("student_id", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("email_verified"),
  level: levelEnum("level").notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  profilePicture: text("profile_picture"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("free"),
  tokenBalance: integer("token_balance").default(1000).notNull(),
  paystackCustomerCode: varchar("paystack_customer_code", { length: 255 }),
  paystackSubscriptionCode: varchar("paystack_subscription_code", { length: 255 }),
  cardAuthCode: varchar("card_auth_code", { length: 255 }),
  accountBalance: numeric("account_balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  virtualBalance: numeric("virtual_balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  planType: planTypeEnum("plan_type"),
  planStartDate: timestamp("plan_start_date"),
  planEndDate: timestamp("plan_end_date"),
  lastDeductedDate: varchar("last_deducted_date", { length: 10 }),
  pendingRenewalRef: varchar("pending_renewal_ref", { length: 100 }),
  pendingVirtualRef: varchar("pending_virtual_ref", { length: 100 }),
  planCurrency: varchar("plan_currency", { length: 3 }).default("GHS").notNull(),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  mode: varchar("mode", { length: 50 }),
  userId: integer("user_id"),
  studyMaterialRef: text("study_material_ref"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
  rationale: text("rationale"),
  imageData: text("image_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  examId: integer("exam_id")
    .references(() => examsTable.id, { onDelete: "set null" }),
  examTitle: varchar("exam_title", { length: 255 }).notNull().default(""),
  totalQuestions: integer("total_questions").notNull().default(0),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examSessionsTable = pgTable("exam_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  examId: integer("exam_id")
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  timerRemaining: integer("timer_remaining").notNull(),
  answers: text("answers").notNull().default("[]"),
  flagged: text("flagged").notNull().default("[]"),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  textContent: text("text_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertExamSchema = createInsertSchema(examsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof examsTable.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;

export const noticesTable = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examShareCodesTable = pgTable("exam_share_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  examId: integer("exam_id")
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  createdByUserId: integer("created_by_user_id")
    .references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyPlansTable = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  planData: text("plan_data").notNull(),
  subjects: text("subjects").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;

export const insertNoticeSchema = createInsertSchema(noticesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof noticesTable.$inferSelect;

export const emailVerificationsTable = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerificationsTable.$inferSelect;

export const clinicalCasesTable = pgTable("clinical_cases", {
  id: serial("id").primaryKey(),
  caseDate: varchar("case_date", { length: 10 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  caseContent: text("case_content").notNull(),
  imageData: text("image_data"),
  postedAt: timestamp("posted_at").notNull(),
  revealResultsAt: timestamp("reveal_results_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const caseQuestionsTable = pgTable("case_questions", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id")
    .notNull()
    .references(() => clinicalCasesTable.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  correctAnswerText: text("correct_answer_text").notNull(),
  rationale: text("rationale").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCaseAttemptsTable = pgTable(
  "user_case_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    caseId: integer("case_id")
      .notNull()
      .references(() => clinicalCasesTable.id, { onDelete: "cascade" }),
    answersJson: text("answers_json").notNull().default("[]"),
    resultsJson: text("results_json").default("[]"),
    score: numeric("score", { precision: 5, scale: 2 }).notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    isLocked: boolean("is_locked").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("uq_user_case_attempt").on(table.userId, table.caseId)],
);

export type ClinicalCase = typeof clinicalCasesTable.$inferSelect;
export type CaseQuestion = typeof caseQuestionsTable.$inferSelect;
export type UserCaseAttempt = typeof userCaseAttemptsTable.$inferSelect;

export { supportChatsTable, supportMessagesTable, chatStatusEnum, chatSenderRoleEnum } from "./supportChat";
export type { SupportChat, InsertSupportChat, SupportMessage, InsertSupportMessage } from "./supportChat";

export const theoryExamsTable = pgTable("theory_exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  mode: varchar("mode", { length: 50 }).notNull().default("easy"),
  studyMaterialText: text("study_material_text").notNull().default(""),
  caseScenario: text("case_scenario"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const theoryQuestionsTable = pgTable("theory_questions", {
  id: serial("id").primaryKey(),
  theoryExamId: integer("theory_exam_id")
    .notNull()
    .references(() => theoryExamsTable.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  modelAnswer: text("model_answer").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const theoryAttemptsTable = pgTable("theory_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  theoryExamId: integer("theory_exam_id")
    .references(() => theoryExamsTable.id, { onDelete: "set null" }),
  answersJson: text("answers_json").notNull().default("[]"),
  scoresJson: text("scores_json").notNull().default("[]"),
  totalScore: numeric("total_score", { precision: 5, scale: 2 }).notNull().default("0"),
  totalPossible: integer("total_possible").notNull().default(0),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  timeTakenSeconds: integer("time_taken_seconds"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TheoryExam = typeof theoryExamsTable.$inferSelect;
export type TheoryQuestion = typeof theoryQuestionsTable.$inferSelect;
export type TheoryAttempt = typeof theoryAttemptsTable.$inferSelect;

export const virtualTxTypeEnum = pgEnum("virtual_tx_type", ["credit", "debit"]);

export const virtualTransactionsTable = pgTable("virtual_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: virtualTxTypeEnum("type").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VirtualTransaction = typeof virtualTransactionsTable.$inferSelect;

export const leaderboardPositionPurchasesTable = pgTable("leaderboard_position_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  setId: integer("set_id").notNull(),
  setType: varchar("set_type", { length: 30 }).notNull(),
  position: integer("position").notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LeaderboardPositionPurchase = typeof leaderboardPositionPurchasesTable.$inferSelect;

export const mcqSetTypeEnum = pgEnum("mcq_set_type", ["pre_clinical", "clinical"]);

export const dailyMcqSetsTable = pgTable(
  "daily_mcq_sets",
  {
    id: serial("id").primaryKey(),
    setDate: varchar("set_date", { length: 10 }).notNull(),
    type: mcqSetTypeEnum("type").notNull(),
    timeLimitMinutes: integer("time_limit_minutes").notNull().default(8),
    totalQuestions: integer("total_questions").notNull().default(10),
    postedAt: timestamp("posted_at").notNull(),
    revealResultsAt: timestamp("reveal_results_at").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("uq_daily_mcq_set_date_type").on(table.setDate, table.type)],
);

export const dailyMcqQuestionsTable = pgTable("daily_mcq_questions", {
  id: serial("id").primaryKey(),
  mcqSetId: integer("mcq_set_id")
    .notNull()
    .references(() => dailyMcqSetsTable.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
  rationale: text("rationale").notNull().default(""),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMcqAttemptsTable = pgTable(
  "user_mcq_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    mcqSetId: integer("mcq_set_id")
      .notNull()
      .references(() => dailyMcqSetsTable.id, { onDelete: "cascade" }),
    answersJson: text("answers_json").notNull().default("[]"),
    score: integer("score").notNull().default(0),
    scorePercentage: numeric("score_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
    timeTakenSeconds: integer("time_taken_seconds"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    isLocked: boolean("is_locked").notNull().default(false),
    includedInLeaderboard: boolean("included_in_leaderboard").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("uq_user_mcq_attempt").on(table.userId, table.mcqSetId)],
);

export type DailyMcqSet = typeof dailyMcqSetsTable.$inferSelect;
export type DailyMcqQuestion = typeof dailyMcqQuestionsTable.$inferSelect;
export type UserMcqAttempt = typeof userMcqAttemptsTable.$inferSelect;
