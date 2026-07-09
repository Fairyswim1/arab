import type { AnswerChoice, QuestionInput } from "@/types";

type RawQuestion = Record<string, unknown>;

function pickString(raw: RawQuestion, keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function pickNumber(raw: RawQuestion, keys: string[]): number {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") {
      const num = Number(value);
      if (!Number.isNaN(num)) return num;
    }
  }
  return 0;
}

export function normalizeQuestion(raw: RawQuestion): QuestionInput | null {
  const question_number = pickNumber(raw, [
    "question_number",
    "questionNumber",
    "id",
    "number",
    "no",
  ]);

  const arabic_word = pickString(raw, ["arabic_word", "arabicWord", "arabic", "word"]);
  const choice_a = pickString(raw, ["choice_a", "choiceA", "a", "optionA", "option_a"]);
  const choice_b = pickString(raw, ["choice_b", "choiceB", "b", "optionB", "option_b"]);
  const answerRaw = pickString(raw, ["answer", "correct", "correctAnswer"]).toUpperCase();

  if (
    question_number < 1 ||
    question_number > 50 ||
    !arabic_word ||
    !choice_a ||
    !choice_b ||
    (answerRaw !== "A" && answerRaw !== "B")
  ) {
    return null;
  }

  return {
    question_number,
    arabic_word,
    choice_a,
    choice_b,
    answer: answerRaw as AnswerChoice,
  };
}

function extractArrayText(input: string): string {
  const trimmed = input.trim();

  const exportMatch = trimmed.match(
    /^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(\[[\s\S]*\])\s*;?\s*$/
  );
  if (exportMatch) {
    return exportMatch[1];
  }

  const arrayMatch = trimmed.match(/(\[[\s\S]*\])/);
  if (arrayMatch) {
    return arrayMatch[1];
  }

  return trimmed;
}

function parseArrayInput(input: string): unknown[] {
  const arrayText = extractArrayText(input);

  try {
    const parsed = JSON.parse(arrayText);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // JSON.parse 실패 시 JS 객체 리터럴 형식 시도 (export const questions = [...])
  }

  try {
    const parsed = new Function(`"use strict"; return (${arrayText});`)();
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }

  throw new Error("JSON 형식이 올바르지 않습니다.");
}

export function parseQuestionsInput(input: string): QuestionInput[] {
  const rawList = parseArrayInput(input);

  if (!Array.isArray(rawList) || rawList.length !== 50) {
    throw new Error("정확히 50문제 배열이어야 합니다.");
  }

  const normalized = rawList.map((item, index) => {
    const question = normalizeQuestion(item as RawQuestion);
    if (!question) {
      throw new Error(`${index + 1}번째 항목 형식이 올바르지 않습니다.`);
    }
    return question;
  });

  const numbers = new Set(normalized.map((q) => q.question_number));
  if (numbers.size !== 50) {
    throw new Error("1번부터 50번까지 중복 없이 문제 번호가 필요합니다.");
  }

  return normalized.sort((a, b) => a.question_number - b.question_number);
}

export function normalizeQuestionsList(questions: unknown[]): QuestionInput[] {
  if (!Array.isArray(questions) || questions.length !== 50) {
    throw new Error("정확히 50문제를 입력해야 합니다.");
  }

  return parseQuestionsInput(JSON.stringify(questions));
}
