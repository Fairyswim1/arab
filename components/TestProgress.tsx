"use client";

interface TestProgressProps {
  answeredCount: number;
  totalCount: number;
}

export default function TestProgress({ answeredCount, totalCount }: TestProgressProps) {
  const percent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="sticky top-0 z-10 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
        <span>응답 진행률</span>
        <span>
          {answeredCount} / {totalCount} ({percent}%)
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
