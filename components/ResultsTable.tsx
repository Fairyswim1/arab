"use client";

import type { Submission } from "@/types";

interface ResultsTableProps {
  submissions: Submission[];
}

export default function ResultsTable({ submissions }: ResultsTableProps) {
  if (submissions.length === 0) {
    return <p className="py-8 text-center text-gray-500">제출 기록이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">학번</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">이름</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">맞은 개수</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">풀이시간</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">제출시각</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{s.student_id}</td>
              <td className="px-4 py-3 font-medium">{s.student_name}</td>
              <td className="px-4 py-3 font-semibold">{s.score_total}</td>
              <td className="px-4 py-3">{s.duration_seconds}초</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(s.submitted_at).toLocaleString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
