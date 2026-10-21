"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import ResultsSummary from "@/components/ResultsSummary";
import ScoreDistributionComparison from "@/components/ScoreDistributionComparison";
import ClassComparisonChart from "@/components/ClassComparisonChart";
import type { TestResultsSummary } from "@/types";

export default function TestResultsPage() {
  const params = useParams();
  const testId = params.testId as string;
  const [data, setData] = useState<TestResultsSummary | null>(null);
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/results/${testId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("결과를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [testId]);

  const filtered =
    filterClassId === "all"
      ? data?.overall
      : data?.byClass.find((c) => c.classSessionId === filterClassId);

  const scoreTotals = filtered?.scoreTotals ?? [];
  const filterLabel =
    filterClassId === "all"
      ? data?.testTitle ?? "시험"
      : data?.byClass.find((c) => c.classSessionId === filterClassId)?.className ?? "반";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <AdminPasswordGate>
        <Link href="/admin/tests" className="text-sm text-blue-600 hover:underline">
          ← 시험 목록
        </Link>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-gray-900">결과 통계</h1>

        {loading && <p className="text-gray-500">불러오는 중...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <>
            {data.byClass.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <label className="text-sm font-medium text-gray-700">반 선택:</label>
                <select
                  value={filterClassId}
                  onChange={(e) => setFilterClassId(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="all">전체 ({data.totalCount}명)</option>
                  {data.byClass.map((c) => (
                    <option key={c.classSessionId} value={c.classSessionId}>
                      {c.className} ({c.count}명)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ResultsSummary title={`${filterLabel} 결과`} scoreTotals={scoreTotals} />

            <div className="mt-8">
              <ScoreDistributionComparison
                score10={filtered?.score10 ?? []}
                score20={filtered?.score20 ?? []}
                score30={filtered?.score30 ?? []}
                score50={filtered?.score50 ?? []}
              />
            </div>

            {data.byClass.length > 1 && (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <ClassComparisonChart
                  title="반별 평균 (총점)"
                  dataKey="mean"
                  byClass={data.byClass}
                  yLabel="평균"
                />
                <ClassComparisonChart
                  title="반별 표준편차 (총점)"
                  dataKey="standardDeviation"
                  byClass={data.byClass}
                  yLabel="표준편차"
                />
              </div>
            )}

            {data.classSessions.length > 0 && (
              <div className="mt-8 space-y-2">
                <h3 className="text-lg font-semibold">반별 상세</h3>
                {data.classSessions.map((cs) => (
                  <Link
                    key={cs.id}
                    href={`/admin/tests/${testId}/results/${cs.id}`}
                    className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
                  >
                    {cs.class_name} — 학생별 결과 / CSV →
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </AdminPasswordGate>
    </main>
  );
}
