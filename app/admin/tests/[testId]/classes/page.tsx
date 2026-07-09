"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { ClassSession } from "@/types";

export default function ClassSessionsPage() {
  const params = useParams();
  const testId = params.testId as string;
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  function loadSessions() {
    fetch(`/api/admin/classes?testId=${testId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setClassSessions(data.classSessions ?? []);
      })
      .catch(() => setError("반 세션을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSessions();
  }, [testId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, className }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "반 세션 생성에 실패했습니다.");
      setCreating(false);
      return;
    }

    setClassName("");
    setClassSessions((prev) => [...prev, data.classSession]);
    setCreating(false);
  }

  async function handleDelete(session: ClassSession) {
    const confirmed = window.confirm(
      `"${session.class_name}" 반 세션을 삭제할까요?\n\n해당 반의 학생 링크가 더 이상 작동하지 않으며, 제출된 결과도 함께 삭제됩니다.`
    );

    if (!confirmed) return;

    setDeletingId(session.id);
    setError("");

    const res = await fetch(
      `/api/admin/classes?testId=${testId}&classSessionId=${session.id}`,
      { method: "DELETE" }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "반 세션 삭제에 실패했습니다.");
      setDeletingId(null);
      return;
    }

    setClassSessions((prev) => prev.filter((s) => s.id !== session.id));
    setDeletingId(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <AdminPasswordGate>
        <Link href="/admin/tests" className="text-sm text-blue-600 hover:underline">
          ← 시험 목록
        </Link>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">반별 세션 관리</h1>

        <form
          onSubmit={handleCreate}
          className="mb-8 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="반 이름 (예: 3학년 1반)"
            className="min-w-[200px] flex-1 rounded-lg border border-gray-300 px-4 py-3"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "생성 중..." : "반 세션 생성"}
          </button>
        </form>

        {error && <p className="mb-4 text-red-600">{error}</p>}
        {loading && <p className="text-gray-500">불러오는 중...</p>}

        <div className="space-y-4">
          {classSessions.map((session) => {
            const link = `${baseUrl}/test/${session.session_code}`;
            return (
              <div
                key={session.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{session.class_name}</h2>
                    <p className="mt-1 text-sm text-gray-500">코드: {session.session_code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(session)}
                    disabled={deletingId === session.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingId === session.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm break-all">{link}</code>
                  <CopyLinkButton url={link} />
                </div>
              </div>
            );
          })}
        </div>

        {!loading && classSessions.length === 0 && (
          <p className="text-center text-gray-500">아직 생성된 반 세션이 없습니다.</p>
        )}
      </AdminPasswordGate>
    </main>
  );
}
