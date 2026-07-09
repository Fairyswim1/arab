import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildClassStats } from "@/lib/statistics";
import type { Submission } from "@/types";

function mapSubmissions(submissions: Submission[]) {
  return {
    scoreTotals: submissions.map((s) => s.score_total),
    score10: submissions.map((s) => s.score_10),
    score20: submissions.map((s) => s.score_20),
    score30: submissions.map((s) => s.score_30),
    score50: submissions.map((s) => s.score_50),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string; classSessionId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const { testId, classSessionId } = await params;

  const { data: test, error: testError } = await getSupabaseAdmin()
    .from("tests")
    .select("*")
    .eq("id", testId)
    .single();

  if (testError || !test) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: classSession, error: classError } = await getSupabaseAdmin()
    .from("class_sessions")
    .select("*")
    .eq("id", classSessionId)
    .eq("test_id", testId)
    .single();

  if (classError || !classSession) {
    return NextResponse.json({ error: "반 세션을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: submissions, error: subError } = await getSupabaseAdmin()
    .from("submissions")
    .select("*")
    .eq("test_id", testId)
    .eq("class_session_id", classSessionId)
    .order("student_number", { ascending: true });

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  const allSubs = (submissions ?? []) as Submission[];
  const mapped = mapSubmissions(allSubs);

  return NextResponse.json({
    test,
    classSession,
    submissions: allSubs,
    stats: buildClassStats(
      classSessionId,
      classSession.class_name,
      mapped.scoreTotals,
      mapped.score10,
      mapped.score20,
      mapped.score30,
      mapped.score50
    ),
  });
}
