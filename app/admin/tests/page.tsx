"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import type { Test } from "@/types";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminPasswordGate>
    </main>
  );
}
