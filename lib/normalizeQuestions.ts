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

/**
 * JS 객체 리터럴 형식(작은따옴표, 따옴표 없는 키, 끝 쉼표, 주석)을 JSON으로 변환한다.
 * 코드를 실행하지 않고 문자 단위로만 변환하므로 안전하다.
 */
export function jsLiteralToJson(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;

  while (i < n) {
    const ch = src[i];

    // 문자열 리터럴 ("..." / '...' / `...`)
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let str = "";
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < n) {
          const next = src[i + 1];
          if (next === quote) {
            str += quote;
          } else {
            str += src[i] + next;
          }
          i += 2;
          continue;
        }
        str += src[i];
        i++;
      }
      i++; // 닫는 따옴표
      out += JSON.stringify(str);
      continue;
    }

    // 주석
    if (ch === "/" && src[i + 1] === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    // 따옴표 없는 키: identifier 뒤에 ':' 가 오는 경우
    if (/[A-Za-z_$]/.test(ch)) {
      let ident = "";
      while (i < n && /[A-Za-z0-9_$]/.test(src[i])) {
        ident += src[i];
        i++;
      }
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      if (src[j] === ":") {
        out += JSON.stringify(ident);
      } else {
        out += ident; // true / false / null 등
      }
      continue;
    }

    // 끝 쉼표: ']' 또는 '}' 를 만났을 때 바로 앞에 쉼표(와 공백·주석)만 있으면 제거
    if (ch === "]" || ch === "}") {
      out = out.replace(/,\s*$/, "");
    }

    out += ch;
    i++;
  }

  return out;
}

function parseArrayInput(input: string): unknown[] {
  const arrayText = extractArrayText(input);

  try {
    const parsed = JSON.parse(arrayText);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // JSON.parse 실패 시 JS 객체 리터럴 형식(export const questions = [...])을 JSON으로 변환해 재시도
  }

  try {
    const parsed = JSON.parse(jsLiteralToJson(arrayText));
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
