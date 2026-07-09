import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateSessionCode } from "@/lib/sessionCode";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const testId = request.nextUrl.searchParams.get("testId");

  if (!testId) {
    return NextResponse.json({ error: "testId가 필요합니다." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("class_sessions")
    .select("*")
    .eq("test_id", testId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ classSessions: data });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const testId = body.testId as string;
    const className = body.className as string;

    if (!testId || !className?.trim()) {
      return NextResponse.json(
        { error: "시험 ID와 반 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const { data: test } = await getSupabaseAdmin()
      .from("tests")
      .select("id")
      .eq("id", testId)
      .single();

    if (!test) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
    }

    let sessionCode = generateSessionCode();
    let attempts = 0;

    while (attempts < 10) {
      const { data: existing } = await getSupabaseAdmin()
        .from("class_sessions")
        .select("id")
        .eq("session_code", sessionCode)
        .maybeSingle();

      if (!existing) break;
      sessionCode = generateSessionCode();
      attempts++;
    }

    const { data, error } = await getSupabaseAdmin()
      .from("class_sessions")
      .insert({
        test_id: testId,
        class_name: className.trim(),
        session_code: sessionCode,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ classSession: data });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
