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
import { histogramBins } from "@/lib/statistics";

interface ScoreHistogramProps {
  title: string;
  values: number[];
  binSize?: number;
  color?: string;
  mean?: number;
  standardDeviation?: number;
}

export default function ScoreHistogram({
  title,
  values,
  binSize = 2,
  color = "#2563eb",
  mean,
  standardDeviation,
}: ScoreHistogramProps) {
  const bins = histogramBins(values, binSize).map((b) => ({
    name: b.label,
    count: b.count,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
      {(mean !== undefined || standardDeviation !== undefined) && (
        <p className="mb-4 text-sm text-gray-600">
          {mean !== undefined && <>평균: {mean.toFixed(2)}</>}
          {mean !== undefined && standardDeviation !== undefined && " · "}
          {standardDeviation !== undefined && <>표준편차: {standardDeviation.toFixed(2)}</>}
        </p>
      )}
      {values.length === 0 ? (
        <p className="py-8 text-center text-gray-500">데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bins} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
