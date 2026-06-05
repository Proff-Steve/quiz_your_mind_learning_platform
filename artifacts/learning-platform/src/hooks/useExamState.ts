import { useCallback, useState } from "react";

export type AnswerMap = Record<number, string>;
export type FlagSet = Set<number>;

interface ExamState {
  currentQuestion: number;
  answers: AnswerMap;
  flagged: Set<number>;
  isSubmitted: boolean;
}

interface UseExamStateReturn extends ExamState {
  goToQuestion: (index: number) => void;
  answerQuestion: (questionIndex: number, answer: string) => void;
  toggleFlag: (questionIndex: number) => void;
  submitExam: () => void;
  resetExam: () => void;
}

export function useExamState(totalQuestions: number): UseExamStateReturn {
  const [state, setState] = useState<ExamState>({
    currentQuestion: 0,
    answers: {},
    flagged: new Set(),
    isSubmitted: false,
  });

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setState((prev) => ({ ...prev, currentQuestion: index }));
    }
  }, [totalQuestions]);

  const answerQuestion = useCallback((questionIndex: number, answer: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionIndex]: answer },
    }));
  }, []);

  const toggleFlag = useCallback((questionIndex: number) => {
    setState((prev) => {
      const next = new Set(prev.flagged);
      if (next.has(questionIndex)) {
        next.delete(questionIndex);
      } else {
        next.add(questionIndex);
      }
      return { ...prev, flagged: next };
    });
  }, []);

  const submitExam = useCallback(() => {
    setState((prev) => ({ ...prev, isSubmitted: true }));
  }, []);

  const resetExam = useCallback(() => {
    setState({
      currentQuestion: 0,
      answers: {},
      flagged: new Set(),
      isSubmitted: false,
    });
  }, []);

  return {
    ...state,
    goToQuestion,
    answerQuestion,
    toggleFlag,
    submitExam,
    resetExam,
  };
}
