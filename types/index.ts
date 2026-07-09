export type AnswerChoice = "A" | "B";

export interface Test {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  test_id: string;
  question_number: number;
  arabic_word: string;
  choice_a: string;
  choice_b: string;
  answer: AnswerChoice;
  created_at: string;
}

export interface QuestionInput {
  question_number: number;
  arabic_word: string;
  choice_a: string;
  choice_b: string;
  answer: AnswerChoice;
}

export interface QuestionPublic {
  question_number: number;
  arabic_word: string;
  choice_a: string;
  choice_b: string;
}

export interface ClassSession {
  id: string;
  test_id: string;
  class_name: string;
  session_code: string;
  created_at: string;
  is_active: boolean;
}

export interface Submission {
  id: string;
  test_id: string;
  class_session_id: string;
  student_class: string;
  student_id: string;
  student_name: string;
  answers_json: Record<string, AnswerChoice>;
  score_total: number;
  score_10: number;
  score_20: number;
  score_30: number;
  score_50: number;
  duration_seconds: number;
  submitted_at: string;
}

export interface ScoreResult {
  score_total: number;
  score_10: number;
  score_20: number;
  score_30: number;
  score_50: number;
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
  label: string;
}

export interface FrequencyEntry {
  value: number;
  count: number;
}

export interface ClassStats {
  classSessionId: string;
  className: string;
  count: number;
  mean: number;
  standardDeviation: number;
  median: number;
  min: number;
  max: number;
  scoreTotals: number[];
  score10: number[];
  score20: number[];
  score30: number[];
  score50: number[];
}

export interface TestResultsSummary {
  testId: string;
  testTitle: string;
  totalCount: number;
  overall: {
    mean: number;
    standardDeviation: number;
    median: number;
    min: number;
    max: number;
    scoreTotals: number[];
    score10: number[];
    score20: number[];
    score30: number[];
    score50: number[];
  };
  byClass: ClassStats[];
  classSessions: ClassSession[];
}
