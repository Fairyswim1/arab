"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPasswordGate from "@/components/AdminPasswordGate";
import StatCard from "@/components/StatCard";
import ScoreHistogram from "@/components/ScoreHistogram";
import ClassComparisonChart from "@/components/ClassComparisonChart";
import ScoreDistributionComparison from "@/components/ScoreDistributionComparison";
import { frequencyTable, mean, standardDeviation } from "@/lib/statistics";
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
  const score10 = filtered?.score10 ?? [];
  const score20 = filtered?.score20 ?? [];
  const score30 = filtered?.score30 ?? [];
  const score50 = filtered?.score50 ?? [];

  const freq = frequencyTable(scoreTotals);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <AdminPasswordGate>
        <Link href="/admin/tests" className="text-sm text-blue-600 hover:underline">
          ← 시험 목록
        </Link>
        <h1 className="mt-2 mb-2 text-2xl font-bold text-gray-900">
          {data?.testTitle ?? "시험"} — 결과 통계
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          중심극한정리 수업에 바로 사용할 수 있는 통계 화면입니다.
        </p>

        {loading && <p className="text-gray-500">불러오는 중...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700">반 필터:</label>
              <select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="all">전체 반</option>
                {data.byClass.map((c) => (
                  <option key={c.classSessionId} value={c.classSessionId}>
                    {c.className} ({c.count}명)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard label="응시자 수" value={scoreTotals.length} />
              <StatCard label="평균" value={mean(scoreTotals).toFixed(2)} />
              <StatCard label="표준편차" value={standardDeviation(scoreTotals).toFixed(2)} />
              <StatCard
                label="중앙값"
                value={filtered ? (filterClassId === "all" ? data.overall.median : (filtered as typeof data.byClass[0]).median).toFixed(2) : "0"}
              />
              <StatCard
                label="최솟값"
                value={filtered ? (filterClassId === "all" ? data.overall.min : (filtered as typeof data.byClass[0]).min) : 0}
              />
              <StatCard
                label="최댓값"
                value={filtered ? (filterClassId === "all" ? data.overall.max : (filtered as typeof data.byClass[0]).max) : 0}
              />
            </div>

            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
              각 문항은 맞으면 1, 틀리면 0인 확률변수로 볼 수 있습니다. 여러 문항의 점수 합은
              이러한 확률변수들의 합입니다. 문제 수가 많아질수록 총점 분포가 평균 근처에 모이고
              종 모양에 가까워지는 경향을 관찰할 수 있습니다.
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <ScoreHistogram
                title="총점(50문제) 히스토그램"
                values={scoreTotals}
                mean={mean(scoreTotals)}
                standardDeviation={standardDeviation(scoreTotals)}
              />
              <ScoreHistogram
                title="10문제 점수 히스토그램"
                values={score10}
                binSize={1}
                color="#3b82f6"
                mean={mean(score10)}
                standardDeviation={standardDeviation(score10)}
              />
              <ScoreHistogram
                title="20문제 점수 히스토그램"
                values={score20}
                binSize={1}
                color="#8b5cf6"
                mean={mean(score20)}
                standardDeviation={standardDeviation(score20)}
              />
              <ScoreHistogram
                title="30문제 점수 히스토그램"
                values={score30}
                binSize={1}
                color="#f59e0b"
                mean={mean(score30)}
                standardDeviation={standardDeviation(score30)}
              />
            </div>

            <div className="mb-6">
              <ScoreDistributionComparison
                score10={score10}
                score20={score20}
                score30={score30}
                score50={score50}
              />
            </div>

            {filterClassId === "all" && data.byClass.length > 0 && (
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <ClassComparisonChart
                  title="반별 평균 비교"
                  dataKey="mean"
                  byClass={data.byClass}
                  yLabel="평균"
                />
                <ClassComparisonChart
                  title="반별 표준편차 비교"
                  dataKey="standardDeviation"
                  byClass={data.byClass}
                  yLabel="표준편차"
                />
              </div>
            )}

            {freq.length > 0 && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">점수별 빈도표</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">점수</th>
                        <th className="px-4 py-2 text-left">빈도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {freq.map((f) => (
                        <tr key={f.value} className="border-b border-gray-100">
                          <td className="px-4 py-2">{f.value}</td>
                          <td className="px-4 py-2">{f.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">반별 상세 결과</h3>
              {data.classSessions.map((cs) => (
                <Link
                  key={cs.id}
                  href={`/admin/tests/${testId}/results/${cs.id}`}
                  className="block rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
                >
                  {cs.class_name} — 상세 보기 →
                </Link>
              ))}
            </div>
          </>
        )}
      </AdminPasswordGate>
    </main>
  );
}
