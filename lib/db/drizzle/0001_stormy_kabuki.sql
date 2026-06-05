CREATE TYPE "public"."plan_type" AS ENUM('weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"text_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_exam_id_exams_id_fk";
--> statement-breakpoint
ALTER TABLE "attempts" ALTER COLUMN "exam_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "exam_title" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "attempts" ADD COLUMN "total_questions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "mode" varchar(50);--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_balance" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_type" "plan_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_deducted_date" varchar(10);--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE set null ON UPDATE no action;