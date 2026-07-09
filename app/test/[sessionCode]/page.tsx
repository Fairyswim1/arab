"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import StudentInfoForm from "@/components/StudentInfoForm";
import TestQuestion from "@/components/TestQuestion";
import TestProgress from "@/components/TestProgress";
import type { AnswerChoice, QuestionPublic } from "@/types";

interface TestData {
  testTitle: string;
  testDescription: string | null;
  className: string;
  sessionCode: string;
  questions: QuestionPublic[];
}

export default function StudentTestPage() {
  const params = useParams();
  const sessionCode = params.sessionCode as string;

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerChoice>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetch(`/api/test/${sessionCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTestData(data);
          startTimeRef.current = Date.now();
        }
      })
      .catch(() => setError("시험 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [sessionCode]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const allAnswered = answeredCount === 50;

  function handleSelect(questionNumber: number, choice: AnswerChoice) {
    setAnswers((prev) => ({ ...prev, [String(questionNumber)]: choice }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!allAnswered) {
      const unanswered = Array.from({ length: 50 }, (_, i) => i + 1).filter(
        (n) => !answers[String(n)]
      );
      setSubmitError(`미응답 문항: ${unanswered.join(", ")}번`);
      return;
    }

    if (!studentId || !studentName.trim()) {
      setSubmitError("학번과 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionCode,
        studentId,
        studentName: studentName.trim(),
        answers,
        durationSeconds,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setSubmitError(data.error ?? "제출에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">시험을 불러오는 중...</p>
      </main>
    );
  }

  if (error || !testData) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700">{error || "시험을 찾을 수 없습니다."}</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">✓</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">제출 완료</h1>
          <p className="text-gray-600">
            {testData.className} · {studentName} (학번 {studentId})
          </p>
          <p className="mt-4 text-sm text-gray-500">
            답안이 성공적으로 제출되었습니다. 창을 닫아도 됩니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-32">
      <header className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{testData.testTitle}</h1>
        <p className="mt-1 text-sm text-blue-700 font-medium">{testData.className}</p>
        {testData.testDescription && (
          <p className="mt-2 text-sm text-gray-600">{testData.testDescription}</p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">학생 정보</h2>
          <StudentInfoForm
            studentId={studentId}
            studentName={studentName}
            onStudentIdChange={setStudentId}
            onNameChange={setStudentName}
            disabled={submitting}
          />
        </section>

        <TestProgress answeredCount={answeredCount} totalCount={50} />

        <section className="space-y-4">
          {testData.questions.map((q) => (
            <TestQuestion
              key={q.question_number}
              questionNumber={q.question_number}
              arabicWord={q.arabic_word}
              choiceA={q.choice_a}
              choiceB={q.choice_b}
              selected={answers[String(q.question_number)]}
              onSelect={(choice) => handleSelect(q.question_number, choice)}
            />
          ))}
        </section>

        {submitError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
          <div className="mx-auto max-w-2xl">
            <button
              type="submit"
              disabled={!allAnswered || submitting || !studentId || !studentName.trim()}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting ? "제출 중..." : allAnswered ? "답안 제출" : `미응답 ${50 - answeredCount}문항`}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
