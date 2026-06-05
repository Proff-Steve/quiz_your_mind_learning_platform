export type UploadType = "pdf" | "ppt" | "image" | "text" | "audio" | "youtube";

export interface UploadedFile {
  id: string;
  name: string;
  type: UploadType;
  url?: string;
  youtubeUrl?: string;
  uploadedAt: string;
  status: "pending" | "processing" | "ready" | "error";
}

export interface MCQOption {
  id: string;
  label: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  text: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  sourceReference?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  questions: MCQQuestion[];
  durationSeconds: number;
  createdAt: string;
  sourceFiles: UploadedFile[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, string>;
  score?: number;
  totalQuestions: number;
}

export interface ExamResult {
  attempt: ExamAttempt;
  exam: Exam;
  score: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  question: MCQQuestion;
  selectedOptionId: string | null;
  isCorrect: boolean;
}
