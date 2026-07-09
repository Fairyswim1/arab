import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">
          아랍어 단어시험
        </h1>
        <p className="mb-2 text-center text-gray-600">
          중심극한정리 실험용 웹 시험 플랫폼
        </p>
        <p className="mb-8 text-center text-sm text-gray-500">
          학생은 선생님이 공유한 시험 링크로 접속하여 응시합니다.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">학생 안내</p>
            <p className="mt-1">
              담당 선생님이 보내준 시험 링크(예: /test/abc123)로 접속하세요.
            </p>
          </div>

          <Link
            href="/admin"
            className="block w-full rounded-xl bg-blue-600 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-blue-700"
          >
            교사용 관리자 페이지
          </Link>
        </div>
      </div>
    </main>
  );
}
