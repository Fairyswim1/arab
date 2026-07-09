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
import type { ClassStats } from "@/types";

interface ClassComparisonChartProps {
  title: string;
  dataKey: "mean" | "standardDeviation";
  byClass: ClassStats[];
  yLabel: string;
}

export default function ClassComparisonChart({
  title,
  dataKey,
  byClass,
  yLabel,
}: ClassComparisonChartProps) {
  const chartData = byClass.map((c) => ({
    name: c.className,
    value: Number(c[dataKey].toFixed(2)),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-gray-500">데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name={yLabel} fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
