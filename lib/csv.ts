import type { Submission } from "@/types";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function submissionsToCsv(submissions: Submission[]): string {
  const headers = [
    "제출시각",
    "반",
    "학번",
    "이름",
    ...Array.from({ length: 50 }, (_, i) => `${i + 1}번답`),
    "총점",
    "10문제점수",
    "20문제점수",
    "30문제점수",
    "50문제점수",
    "풀이시간초",
  ];

  const rows = submissions.map((s) => {
    const answerCols = Array.from({ length: 50 }, (_, i) => {
      const key = String(i + 1);
      return s.answers_json[key] ?? "";
    });

    return [
      s.submitted_at,
      s.student_class,
      s.student_id,
      s.student_name,
      ...answerCols,
      s.score_total,
      s.score_10,
      s.score_20,
      s.score_30,
      s.score_50,
      s.duration_seconds,
    ].map(escapeCsvField);
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
