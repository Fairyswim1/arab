"use client";

import { useState } from "react";
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
import { mean, standardDeviation } from "@/lib/statistics";

interface ScoreDistributionComparisonProps {
  score10: number[];
  score20: number[];
  score30: number[];
  score50: number[];
}

type ViewMode = "sum" | "ratio";

const DATASET_META = [
  { label: "10문제", n: 10, color: "#3b82f6" },
  { label: "20문제", n: 20, color: "#8b5cf6" },
  { label: "30문제", n: 30, color: "#f59e0b" },
  { label: "50문제", n: 50, color: "#ef4444" },
] as const;

// 합 보기: 점수 2점 단위 구간, 비율 보기: 10% 단위 구간
const SUM_BIN = 2;
const RATIO_BIN = 0.1;

function binLabelSum(start: number) {
  return `${start}–${start + SUM_BIN - 1}`;
}

function binLabelRatio(start: number) {
  const a = Math.round(start * 100);
  const b = Math.round((start + RATIO_BIN) * 100);
  return `${a}–${b}%`;
}

export default function ScoreDistributionComparison({
  score10,
  score20,
  score30,
  score50,
}: ScoreDistributionComparisonProps) {
  const [mode, setMode] = useState<ViewMode>("sum");

  const datasets = DATASET_META.map((meta, i) => {
    const raw = [score10, score20, score30, score50][i];
    const values = mode === "sum" ? raw : raw.map((v) => v / meta.n);
    return { ...meta, values };
  });

  const total = score50.length;

  const chartData: Record<string, string | number>[] = [];

  if (total > 0) {
    if (mode === "sum") {
      // 0~50점을 2점 단위로 고정 (문제 수에 따라 x축 범위가 달라지는 걸 피하기 위해)
      for (let start = 0; start <= 50; start += SUM_BIN) {
        const row: Record<string, string | number> = { name: binLabelSum(start) };
        for (const ds of datasets) {
          row[ds.label] = ds.values.filter(
            (v) => v >= start && v < start + SUM_BIN
          ).length;
        }
        chartData.push(row);
      }
    } else {
      for (let k = 0; k < 10; k++) {
        const start = k * RATIO_BIN;
        const end = k === 9 ? 1.0000001 : start + RATIO_BIN; // 100%는 마지막 구간에 포함
        const row: Record<string, string | number> = { name: binLabelRatio(start) };
        for (const ds of datasets) {
          row[ds.label] = ds.values.filter((v) => v >= start && v < end).length;
        }
        chartData.push(row);
      }
    }
  }

  const fmt = (v: number) => (mode === "sum" ? v.toFixed(2) : (v * 100).toFixed(1) + "%");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          문제 수별 점수 분포 비교 (중심극한정리)
        </h3>
        <div className="inline-flex rounded-lg border border-gray-300 text-sm">
          <button
            type="button"
            onClick={() => setMode("sum")}
            className={`px-3 py-1.5 rounded-l-lg ${
              mode === "sum" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            맞힌 개수(합)
          </button>
          <button
            type="button"
            onClick={() => setMode("ratio")}
            className={`px-3 py-1.5 rounded-r-lg ${
              mode === "ratio" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            맞힌 비율(평균)
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        각 문항은 맞으면 1, 틀리면 0인 확률변수입니다. 모르는 단어를 찍는다면 각 문항은
        성공확률 1/2인 독립 시행이므로, 앞 n문항의 맞힌 개수는 B(n, 1/2)를 따릅니다.{" "}
        {mode === "sum" ? (
          <>
            <b>합</b>으로 보면 평균 n/2, 표준편차 √n/2 — 문제 수가 늘수록 분포가 오른쪽으로
            이동하며 더 넓어지지만 모양은 점점 종 모양에 가까워집니다.
          </>
        ) : (
          <>
            <b>비율(표본평균)</b>로 보면 평균은 0.5로 고정되고 표준편차는 1/(2√n) — 문제 수가
            늘수록 0.5 근처로 모이면서 종 모양이 됩니다. 중심극한정리의 모습입니다.
          </>
        )}
      </p>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="px-3 py-2 text-left">문제 수</th>
              <th className="px-3 py-2 text-right">실제 평균</th>
              <th className="px-3 py-2 text-right">이론 평균</th>
              <th className="px-3 py-2 text-right">실제 표준편차</th>
              <th className="px-3 py-2 text-right">이론 표준편차</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((ds) => {
              const theoMean = mode === "sum" ? ds.n / 2 : 0.5;
              const theoSd =
                mode === "sum" ? Math.sqrt(ds.n) / 2 : 1 / (2 * Math.sqrt(ds.n));
              return (
                <tr key={ds.label} className="border-b border-gray-100">
                  <td className="px-3 py-1.5 font-semibold" style={{ color: ds.color }}>
                    {ds.label}
                  </td>
                  <td className="px-3 py-1.5 text-right">{fmt(mean(ds.values))}</td>
                  <td className="px-3 py-1.5 text-right text-gray-500">{fmt(theoMean)}</td>
                  <td className="px-3 py-1.5 text-right">
                    {fmt(standardDeviation(ds.values))}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-500">{fmt(theoSd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-gray-500">
          이론값은 모든 문항을 확률 1/2로 찍는다고 가정한 B(n, 1/2) 기준. 표준편차는 모표준편차(n으로
          나눔). 응시자 {total}명.
        </p>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-gray-500">데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}명`]} />
            <Legend />
            {DATASET_META.map((meta) => (
              <Bar key={meta.label} dataKey={meta.label} fill={meta.color} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
