"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import { parseQuestionsInput } from "@/lib/normalizeQuestions";
import type { AnswerChoice, QuestionInput } from "@/types";
import sampleQuestions from "@/data/sample-questions.json";

const emptyQuestion = (n: number): QuestionInput => ({
  question_number: n,
  arabic_word: "",
  choice_a: "",
  choice_b: "",
  answer: "A",
});

export default function NewTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>(
    Array.from({ length: 50 }, (_, i) => emptyQuestion(i + 1))
  );
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);

  function updateQuestion(index: number, field: keyof QuestionInput, value: string) {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function loadSample() {
    try {
      setQuestions(parseQuestionsInput(JSON.stringify(sampleQuestions)));
      if (!title.trim()) setTitle("아랍어 단어시험");
      setError("");
      setShowJson(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "샘플을 불러오지 못했습니다.");
    }
  }

  function applyJson() {
    try {
      const sorted = parseQuestionsInput(jsonInput);
      setQuestions(sorted);
      setError("");
      setShowJson(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON 형식이 올바르지 않습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, questions }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "시험 생성에 실패했습니다.");
      setLoading(false);
      return;
    }

    router.push("/admin/tests");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <AdminPasswordGate>
        <Link href="/admin/tests" className="text-sm text-blue-600 hover:underline">
          ← 시험 목록
        </Link>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">새 시험 만들기</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium">시험 제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
              required
            />
            <label className="mb-1 block text-sm font-medium">설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">문제 입력 (50문항)</h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-sm text-green-700 hover:underline"
                >
                  샘플 50문항 불러오기
                </button>
                <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showJson ? "개별 입력으로" : "JSON/JS로 붙여넣기"}
                </button>
              </div>
            </div>

            {showJson ? (
              <div>
                <p className="mb-2 text-xs text-gray-500">
                  JSON 배열 또는{" "}
                  <code className="rounded bg-gray-100 px-1">export const questions = [...]</code>{" "}
                  형식 모두 가능합니다. 필드명은{" "}
                  <code className="rounded bg-gray-100 px-1">id/arabic/choiceA/choiceB</code> 또는{" "}
                  <code className="rounded bg-gray-100 px-1">question_number/arabic_word/choice_a/choice_b</code>{" "}
                  를 사용할 수 있습니다.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  placeholder='export const questions = [{ id: 1, arabic: "أم", choiceA: "아버지", choiceB: "어머니", answer: "B" }, ...]'
                  className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={applyJson}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white"
                >
                  JSON 적용
                </button>
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                {questions.map((q, i) => (
                  <div key={q.question_number} className="rounded-lg border border-gray-100 p-4">
                    <p className="mb-2 font-semibold text-gray-700">{q.question_number}번</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={q.arabic_word}
                        onChange={(e) => updateQuestion(i, "arabic_word", e.target.value)}
                        placeholder="아랍어 단어"
                        dir="rtl"
                        className="rounded border px-3 py-2 text-lg"
                        required
                      />
                      <select
                        value={q.answer}
                        onChange={(e) =>
                          updateQuestion(i, "answer", e.target.value as AnswerChoice)
                        }
                        className="rounded border px-3 py-2"
                      >
                        <option value="A">정답: A</option>
                        <option value="B">정답: B</option>
                      </select>
                      <input
                        value={q.choice_a}
                        onChange={(e) => updateQuestion(i, "choice_a", e.target.value)}
                        placeholder="선택지 A"
                        className="rounded border px-3 py-2"
                        required
                      />
                      <input
                        value={q.choice_b}
                        onChange={(e) => updateQuestion(i, "choice_b", e.target.value)}
                        placeholder="선택지 B"
                        className="rounded border px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "생성 중..." : "시험 생성"}
          </button>
        </form>
      </AdminPasswordGate>
    </main>
  );
}
