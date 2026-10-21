"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import type { Test } from "@/types";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // 삭제 확인 상태: 어떤 시험을, 제출 기록 몇 건과 함께 지우려는지
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string;
    title: string;
    submissionCount: number | null;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch("/api/admin/tests")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTests(data.tests ?? []);
        }
      })
      .catch(() => setError("시험 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  async function openDeleteConfirm(test: Test) {
    setDeleteError("");
    setConfirmTarget({ id: test.id, title: test.title, submissionCount: null });
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`);
      const data = await res.json();
      setConfirmTarget((prev) =>
        prev && prev.id === test.id
          ? { ...prev, submissionCount: data.submissionCount ?? 0 }
          : prev
      );
    } catch {
      setConfirmTarget((prev) =>
        prev && prev.id === test.id ? { ...prev, submissionCount: 0 } : prev
      );
    }
  }

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError("");

    const res = await fetch(`/api/admin/tests/${confirmTarget.id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      setDeleteError(data.error ?? "삭제에 실패했습니다.");
      setDeleting(false);
      return;
    }

    setTests((prev) => prev.filter((t) => t.id !== confirmTarget.id));
    setConfirmTarget(null);
    setDeleting(false);
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <AdminPasswordGate>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              ← 관리자 홈
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">시험 목록</h1>
          </div>
          <Link
            href="/admin/tests/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + 새 시험 만들기
          </Link>
        </div>

        {loading && <p className="text-gray-500">불러오는 중...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && tests.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            아직 생성된 시험이 없습니다.
          </div>
        )}

        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
                  {test.description && (
                    <p className="mt-1 text-sm text-gray-600">{test.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    생성: {new Date(test.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/tests/${test.id}/edit`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    문제 수정
                  </Link>
                  <Link
                    href={`/admin/tests/${test.id}/classes`}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
                  >
                    반별 세션
                  </Link>
                  <Link
                    href={`/admin/tests/${test.id}/results`}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    결과 보기
                  </Link>
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(test)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {confirmTarget?.id === test.id && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">
                    &quot;{test.title}&quot; 시험을 삭제할까요?
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    문항, 반별 세션, 학생 제출 기록
                    {confirmTarget.submissionCount === null
                      ? " (확인 중...)"
                      : ` ${confirmTarget.submissionCount}건`}
                    이 모두 함께 삭제되며 되돌릴 수 없습니다.
                  </p>
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-700">{deleteError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || confirmTarget.submissionCount === null}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
                    >
                      {deleting ? "삭제 중..." : "삭제 확인"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(null)}
                      disabled={deleting}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminPasswordGate>
    </main>
  );
}
