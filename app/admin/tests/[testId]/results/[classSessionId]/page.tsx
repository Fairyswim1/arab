"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import ResultsSummary from "@/components/ResultsSummary";
import ResultsTable from "@/components/ResultsTable";
import { submissionsToCsv, downloadCsv } from "@/lib/csv";
import type { ClassStats, Submission, Test } from "@/types";

interface ClassResultData {
  test: Test;
  classSession: { id: string; class_name: string };
  submissions: Submission[];
  stats: ClassStats;
}

export default function ClassResultsPage() {
  const params = useParams();
  const testId = params.testId as string;
  const classSessionId = params.classSessionId as string;
  const [data, setData] = useState<ClassResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/results/${testId}/${classSessionId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("결과를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [testId, classSessionId]);

  function handleCsvDownload() {
    if (!data) return;
    const csv = submissionsToCsv(data.submissions);
    downloadCsv(
      `${data.test.title}_${data.classSession.class_name}_결과.csv`,
      csv
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <AdminPasswordGate>
        <Link
          href={`/admin/tests/${testId}/results`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← 전체 결과
        </Link>
        <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {data?.classSession.class_name ?? "반"} 결과
            </h1>
            <p className="text-sm text-gray-600">{data?.test.title}</p>
          </div>
          {data && data.submissions.length > 0 && (
            <button
              onClick={handleCsvDownload}
              className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900"
            >
              CSV 다운로드
            </button>
          )}
        </div>

        {loading && <p className="text-gray-500">불러오는 중...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <>
            <ResultsSummary
              title={`${data.classSession.class_name} 결과`}
              scoreTotals={data.stats.scoreTotals}
            />

            <h2 className="mb-3 mt-8 text-lg font-semibold">학생별 결과</h2>
            <ResultsTable submissions={data.submissions} />
          </>
        )}
      </AdminPasswordGate>
    </main>
  );
}
