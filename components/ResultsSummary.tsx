"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  mean,
  scoreFrequencyDistribution,
  standardDeviation,
  variance,
} from "@/lib/statistics";

interface ResultsSummaryProps {
  title: string;
  scoreTotals: number[];
}

export default function ResultsSummary({ title, scoreTotals }: ResultsSummaryProps) {
  const avg = mean(scoreTotals);
  const varValue = variance(scoreTotals);
  const std = standardDeviation(scoreTotals);
  const distribution = scoreFrequencyDistribution(scoreTotals, 50);

  const tableRows = Array.from({ length: 50 }, (_, i) => {
    const score = i + 1;
    const row = distribution.find((d) => d.score === score);
    return {
      score,
      count: row?.count ?? 0,
      probability: row?.probability ?? 0,
    };
  });

  const chartData = distribution.map((row) => ({
    name: String(row.score),
    count: row.count,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-center text-xl font-bold text-gray-900">&lt;{title}&gt;</h2>

      <div className="mb-8 overflow-x-auto">
        <table className="mx-auto min-w-[280px] border-collapse text-sm">
          <tbody>
            <tr className="border border-gray-300">
              <td className="border border-gray-300 bg-gray-50 px-6 py-2 font-medium">평균</td>
              <td className="border border-gray-300 px-6 py-2 text-right">{avg.toFixed(4)}</td>
            </tr>
            <tr className="border border-gray-300">
              <td className="border border-gray-300 bg-gray-50 px-6 py-2 font-medium">분산</td>
              <td className="border border-gray-300 px-6 py-2 text-right">{varValue.toFixed(4)}</td>
            </tr>
            <tr className="border border-gray-300">
              <td className="border border-gray-300 bg-gray-50 px-6 py-2 font-medium">표준편차</td>
              <td className="border border-gray-300 px-6 py-2 text-right">{std.toFixed(5)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {scoreTotals.length === 0 ? (
        <p className="py-12 text-center text-gray-500">아직 제출된 결과가 없습니다.</p>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">빈도표</h3>
            <div className="max-h-[520px] overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-300">
                    <th className="px-3 py-2 text-left font-semibold">맞은 개수</th>
                    <th className="px-3 py-2 text-right font-semibold">인원</th>
                    <th className="px-3 py-2 text-right font-semibold">확률</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr key={row.score} className="border-b border-gray-100">
                      <td className="px-3 py-1.5">{row.score}</td>
                      <td className="px-3 py-1.5 text-right">{row.count}</td>
                      <td className="px-3 py-1.5 text-right">{row.probability.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">응시자 {scoreTotals.length}명</p>
          </div>

          <div className="min-w-0">
            <h3 className="mb-3 text-center text-sm font-semibold text-gray-700">인원</h3>
            <ResponsiveContainer width="100%" height={520}>
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 24, left: 8, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  label={{
                    value: "맞은 개수",
                    position: "insideBottom",
                    offset: -36,
                    style: { fontSize: 13, fontWeight: 600, fill: "#374151" },
                  }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
                <Tooltip
                  labelFormatter={(label) => `맞은 개수: ${label}`}
                  formatter={(value) => [`${value}명`, "인원"]}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
