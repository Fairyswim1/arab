"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { histogramBins, mean, standardDeviation } from "@/lib/statistics";

interface ScoreDistributionComparisonProps {
  score10: number[];
  score20: number[];
  score30: number[];
  score50: number[];
}

const COLORS = {
  "10문제": "#3b82f6",
  "20문제": "#8b5cf6",
  "30문제": "#f59e0b",
  "50문제": "#ef4444",
};

export default function ScoreDistributionComparison({
  score10,
  score20,
  score30,
  score50,
}: ScoreDistributionComparisonProps) {
  const datasets = [
    { label: "10문제", values: score10 },
    { label: "20문제", values: score20 },
    { label: "30문제", values: score30 },
    { label: "50문제", values: score50 },
  ];

  const allValues = [...score10, ...score20, ...score30, ...score50];
  const bins = histogramBins(allValues, 2);

  const chartData = bins.map((bin) => {
    const row: Record<string, string | number> = { name: bin.label };
    for (const ds of datasets) {
      row[ds.label] = ds.values.filter(
        (v) => v >= bin.binStart && v < bin.binEnd
      ).length;
    }
    return row;
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        문제 수별 점수 분포 비교 (중심극한정리)
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        각 문항은 맞으면 1, 틀리면 0인 확률변수로 볼 수 있습니다. 여러 문항의 점수 합은
        이러한 확률변수들의 합입니다. 문제 수가 많아질수록 총점 분포가 평균 근처에 모이고
        종 모양에 가까워지는 경향을 관찰할 수 있습니다.
      </p>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {datasets.map((ds) => (
          <div key={ds.label} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className="font-semibold" style={{ color: COLORS[ds.label as keyof typeof COLORS] }}>
              {ds.label}
            </span>
            <span className="text-gray-600">
              {" "}
              — 평균 {mean(ds.values).toFixed(2)}, 표준편차{" "}
              {standardDeviation(ds.values).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      {allValues.length === 0 ? (
        <p className="py-8 text-center text-gray-500">데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {Object.entries(COLORS).map(([key, color]) => (
              <Bar key={key} dataKey={key} fill={color} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
