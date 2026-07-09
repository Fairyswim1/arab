import type { AnswerChoice, ScoreResult } from "@/types";

export function calculateScores(
  studentAnswers: Record<string, string>,
  correctAnswers: Map<number, AnswerChoice>
): ScoreResult {
  let scoreTotal = 0;
  let score10 = 0;
  let score20 = 0;
  let score30 = 0;
  let score50 = 0;

  for (let n = 1; n <= 50; n++) {
    const studentChoice = studentAnswers[String(n)] as AnswerChoice | undefined;
    const correct = correctAnswers.get(n);
    const isCorrect = studentChoice !== undefined && studentChoice === correct;

    if (isCorrect) {
      scoreTotal += 1;
      if (n <= 10) score10 += 1;
      if (n <= 20) score20 += 1;
      if (n <= 30) score30 += 1;
      score50 += 1;
    }
  }

  return {
    score_total: scoreTotal,
    score_10: score10,
    score_20: score20,
    score_30: score30,
    score_50: score50,
  };
}
