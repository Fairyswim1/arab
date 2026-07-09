import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  const { sessionCode } = await params;

  const { data: session, error: sessionError } = await getSupabaseAdmin()
    .from("class_sessions")
    .select("*, tests(title, description)")
    .eq("session_code", sessionCode)
    .eq("is_active", true)
    .maybeSingle();

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ error: "유효하지 않은 시험 링크입니다." }, { status: 404 });
  }

  const { data: questions, error: questionsError } = await getSupabaseAdmin()
    .from("questions")
    .select("question_number, arabic_word, choice_a, choice_b")
    .eq("test_id", session.test_id)
    .order("question_number", { ascending: true });

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  const testData = session.tests as { title: string; description: string | null };

  return NextResponse.json({
    testTitle: testData.title,
    testDescription: testData.description,
    className: session.class_name,
    sessionCode: session.session_code,
    questions,
  });
}
