import Link from "next/link";
import AdminPasswordGate from "@/components/AdminPasswordGate";

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <AdminPasswordGate>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">관리자 페이지</h1>
          <p className="mb-6 text-gray-600">시험 생성, 반별 링크 관리, 결과 통계를 확인할 수 있습니다.</p>
          <Link
            href="/admin/tests"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
          >
            시험 관리로 이동
          </Link>
        </div>
      </AdminPasswordGate>
    </main>
  );
}
