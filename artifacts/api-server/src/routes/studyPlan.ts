import { Router } from "express";
import { db, materialsTable, studyPlansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const studyPlanRouter = Router();

interface ScheduleBlock {
  days: string[];
  startTime: string;
  endTime: string;
  label: string;
}

interface StudyPlanRequest {
  fixedSchedule: {
    lectures: ScheduleBlock[];
    church: ScheduleBlock[];
    classes: ScheduleBlock[];
  };
  semiFlexible: {
    gym: string;
    leadershipMeetings: string;
    fellowshipDuties: string;
    sideProjects: string;
  };
  sleepPattern: {
    sleepTime: string;
    wakeTime: string;
  };
  energyPattern: {
    mostFocused: string[];
    mostTired: string[];
    mostActive: string[];
  };
  examTimeline: {
    nextExamDate: string;
    blockTestDates: string;
  };
  planStyle: "strict" | "balanced" | "loose";
  hoursPerDay: number;
  numberOfWeeks: number;
}

export interface StudySession {
  startTime: string;
  endTime: string;
  type: "study" | "revision" | "quiz" | "fixed" | "sleep" | "break";
  subject: string;
  topic: string;
  color: string;
}

export interface DaySchedule {
  day: string;
  sessions: StudySession[];
}

export interface WeekPlan {
  weekNumber: number;
  days: DaySchedule[];
}

export interface StudyPlanResponse {
  plan: WeekPlan[];
  subjects: string[];
  summary: string;
  savedAt?: string;
}

const SESSION_COLORS: Record<string, string> = {
  study: "#93C5FD",
  revision: "#FDA4AF",
  quiz: "#86EFAC",
  fixed: "#FDE68A",
  sleep: "#E2E8F0",
  break: "#D8B4FE",
};

studyPlanRouter.get(
  "/study-plan",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const [saved] = await db
        .select()
        .from(studyPlansTable)
        .where(eq(studyPlansTable.userId, userId))
        .limit(1);

      if (!saved) {
        return res.status(404).json({ error: "No saved study plan found." });
      }

      const response: StudyPlanResponse = {
        plan: JSON.parse(saved.planData) as WeekPlan[],
        subjects: JSON.parse(saved.subjects) as string[],
        summary: saved.summary,
        savedAt: saved.updatedAt.toISOString(),
      };

      return res.json(response);
    } catch (err) {
      req.log?.error(err, "study-plan get error");
      return res.status(500).json({ error: "Failed to fetch saved study plan." });
    }
  }
);

studyPlanRouter.delete(
  "/study-plan",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      await db
        .delete(studyPlansTable)
        .where(eq(studyPlansTable.userId, userId));
      return res.json({ success: true });
    } catch (err) {
      req.log?.error(err, "study-plan delete error");
      return res.status(500).json({ error: "Failed to delete study plan." });
    }
  }
);

studyPlanRouter.post(
  "/study-plan/generate",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const body = req.body as StudyPlanRequest;

      const materials = await db
        .select({ fileName: materialsTable.fileName, textContent: materialsTable.textContent })
        .from(materialsTable)
        .where(eq(materialsTable.userId, userId));

      if (materials.length === 0) {
        return res.status(400).json({
          error: "No study materials found. Please upload materials first.",
        });
      }

      const subjectList = materials
        .map((m) => m.fileName.replace(/\.[^.]+$/, ""))
        .filter(Boolean);

      const textSnippets = materials
        .slice(0, 8)
        .map((m) => {
          const text = m.textContent ?? "";
          return `[${m.fileName}]: ${text.slice(0, 600)}`;
        })
        .join("\n\n");

      const prompt = `You are an expert academic scheduler. Create a detailed weekly study plan for a student.

STUDENT INPUTS:
- Study Materials/Subjects: ${subjectList.join(", ")}
- Hours to study per day: ${body.hoursPerDay}
- Number of weeks: ${body.numberOfWeeks}
- Plan style: ${body.planStyle}
- Sleep: ${body.sleepPattern.wakeTime} wake up, ${body.sleepPattern.sleepTime} sleep
- Most focused periods: ${body.energyPattern.mostFocused.join(", ")}
- Most tired periods: ${body.energyPattern.mostTired.join(", ")}
- Next major exam: ${body.examTimeline.nextExamDate || "Not specified"}
- Block tests: ${body.examTimeline.blockTestDates || "None"}
- Semi-flexible (gym, meetings etc): ${JSON.stringify(body.semiFlexible)}

FIXED NON-NEGOTIABLE SCHEDULE (build around these, never overlap):
${JSON.stringify(body.fixedSchedule, null, 2)}

SAMPLE CONTENT FROM MATERIALS (to determine topics):
${textSnippets}

INSTRUCTIONS:
1. Generate a weekly study plan for ${body.numberOfWeeks} week(s).
2. For each week (Mon–Sun), create sessions that fit within available time slots (not during fixed schedule, not during sleep).
3. Distribute subjects evenly, putting hardest subjects during most-focused periods.
4. Include: study sessions, revision sessions (reviewing previously studied topics), and self-quiz sessions (MCQs/theory).
5. Each session card must show: time, subject, specific topic or subtopics, and session type.
6. Plan style "${body.planStyle}": ${
  body.planStyle === "strict"
    ? "Schedule every available hour with minimal gaps"
    : body.planStyle === "balanced"
    ? "Schedule structured but leave some buffer/free time"
    : "Create guidelines with generous free time"
}
7. As weeks progress towards exam date, gradually increase revision and quiz sessions.
8. For revision and quiz sessions, reference specific topics already studied in earlier sessions.

OUTPUT FORMAT: Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "subjects": ["Subject1", "Subject2"],
  "summary": "Brief 2-sentence overview of the plan",
  "plan": [
    {
      "weekNumber": 1,
      "days": [
        {
          "day": "Monday",
          "sessions": [
            {
              "startTime": "08:00",
              "endTime": "10:00",
              "type": "study",
              "subject": "Biology",
              "topic": "Chapter 1: Cell Structure – organelles, membrane transport"
            },
            {
              "startTime": "10:30",
              "endTime": "11:00",
              "type": "quiz",
              "subject": "Biology",
              "topic": "MCQ self-test: Cell structure questions"
            }
          ]
        }
      ]
    }
  ]
}

Session types: "study" (new content), "revision" (review), "quiz" (self-testing MCQ/theory), "fixed" (lecture/church/class), "break" (free time/rest).
Only include days Monday through Sunday. Only include sessions that have actual content (skip empty days if style is "loose"). Do NOT include sleep sessions.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const raw = completion.choices[0]?.message?.content ?? "";

      let parsed: { subjects: string[]; summary: string; plan: WeekPlan[] };
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("AI returned invalid JSON");
        parsed = JSON.parse(match[0]);
      }

      const coloredPlan: WeekPlan[] = parsed.plan.map((week) => ({
        ...week,
        days: week.days.map((day) => ({
          ...day,
          sessions: day.sessions.map((session) => ({
            ...session,
            color: SESSION_COLORS[session.type] ?? SESSION_COLORS.study,
          })),
        })),
      }));

      const subjects = parsed.subjects ?? subjectList;
      const summary = parsed.summary ?? "";
      const now = new Date();

      await db
        .insert(studyPlansTable)
        .values({
          userId,
          planData: JSON.stringify(coloredPlan),
          subjects: JSON.stringify(subjects),
          summary,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: studyPlansTable.userId,
          set: {
            planData: JSON.stringify(coloredPlan),
            subjects: JSON.stringify(subjects),
            summary,
            updatedAt: now,
          },
        });

      const response: StudyPlanResponse = {
        plan: coloredPlan,
        subjects,
        summary,
        savedAt: now.toISOString(),
      };

      return res.json(response);
    } catch (err) {
      req.log?.error(err, "study-plan generate error");
      return res.status(500).json({ error: "Failed to generate study plan. Please try again." });
    }
  }
);

export default studyPlanRouter;
