import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildClassStats, mean, median, min, max, standardDeviation } from "@/lib/statistics";
import type { ClassStats, Submission, TestResultsSummary } from "@/types";

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
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const { testId } = await params;

  const { data: test, error: testError } = await getSupabaseAdmin()
    .from("tests")
    .select("*")
    .eq("id", testId)
    .single();

  if (testError || !test) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: classSessions, error: classError } = await getSupabaseAdmin()
    .from("class_sessions")
    .select("*")
    .eq("test_id", testId)
    .order("created_at", { ascending: true });

  if (classError) {
    return NextResponse.json({ error: classError.message }, { status: 500 });
  }

  const { data: submissions, error: subError } = await getSupabaseAdmin()
    .from("submissions")
    .select("*")
    .eq("test_id", testId)
    .order("submitted_at", { ascending: false });

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  const allSubs = (submissions ?? []) as Submission[];
  const mapped = mapSubmissions(allSubs);

  const byClass: ClassStats[] = (classSessions ?? []).map((cs) => {
    const classSubs = allSubs.filter((s) => s.class_session_id === cs.id);
    const cm = mapSubmissions(classSubs);
    return buildClassStats(
      cs.id,
      cs.class_name,
      cm.scoreTotals,
      cm.score10,
      cm.score20,
      cm.score30,
      cm.score50
    );
  });

  const summary: TestResultsSummary = {
    testId: test.id,
    testTitle: test.title,
    totalCount: allSubs.length,
    overall: {
      mean: mean(mapped.scoreTotals),
      standardDeviation: standardDeviation(mapped.scoreTotals),
      median: median(mapped.scoreTotals),
      min: min(mapped.scoreTotals),
      max: max(mapped.scoreTotals),
      scoreTotals: mapped.scoreTotals,
      score10: mapped.score10,
      score20: mapped.score20,
      score30: mapped.score30,
      score50: mapped.score50,
    },
    byClass,
    classSessions: classSessions ?? [],
  };

  return NextResponse.json(summary);
}
