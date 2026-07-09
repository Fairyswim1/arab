import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateScores } from "@/lib/scoring";
import type { AnswerChoice } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionCode = body.sessionCode as string;
    const studentNumber = Number(body.studentNumber);
    const studentName = (body.studentName as string)?.trim();
    const answers = body.answers as Record<string, string>;
    const durationSeconds = Number(body.durationSeconds);

    if (!sessionCode || !studentName || !studentNumber || studentNumber <= 0) {
      return NextResponse.json(
        { error: "학생 정보와 답안을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (!answers || Object.keys(answers).length !== 50) {
      return NextResponse.json(
        { error: "모든 문항(50문제)에 답해야 제출할 수 있습니다." },
        { status: 400 }
      );
    }

    for (let n = 1; n <= 50; n++) {
      const choice = answers[String(n)];
      if (choice !== "A" && choice !== "B") {
        return NextResponse.json(
          { error: `${n}번 문항의 답이 올바르지 않습니다.` },
          { status: 400 }
        );
      }
    }

    const { data: session, error: sessionError } = await getSupabaseAdmin()
      .from("class_sessions")
      .select("*")
      .eq("session_code", sessionCode)
      .eq("is_active", true)
      .maybeSingle();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: "유효하지 않은 시험 링크입니다." }, { status: 404 });
    }

    const { data: existing } = await getSupabaseAdmin()
      .from("submissions")
      .select("id")
      .eq("class_session_id", session.id)
      .eq("student_number", studentNumber)
      .eq("student_name", studentName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "이미 제출한 기록이 있습니다." },
        { status: 409 }
      );
    }

    const { data: questions, error: questionsError } = await getSupabaseAdmin()
      .from("questions")
      .select("question_number, answer")
      .eq("test_id", session.test_id)
      .order("question_number", { ascending: true });

    if (questionsError || !questions || questions.length !== 50) {
      return NextResponse.json({ error: "문제 정보를 불러올 수 없습니다." }, { status: 500 });
    }

    const correctAnswers = new Map<number, AnswerChoice>();
    for (const q of questions) {
      correctAnswers.set(q.question_number, q.answer as AnswerChoice);
    }

    const scores = calculateScores(answers, correctAnswers);

    const { error: insertError } = await getSupabaseAdmin().from("submissions").insert({
      test_id: session.test_id,
      class_session_id: session.id,
      student_class: session.class_name,
      student_number: studentNumber,
      student_name: studentName,
      answers_json: answers,
      score_total: scores.score_total,
      score_10: scores.score_10,
      score_20: scores.score_20,
      score_30: scores.score_30,
      score_50: scores.score_50,
      duration_seconds: Math.max(0, durationSeconds || 0),
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "이미 제출한 기록이 있습니다." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "제출 완료" });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
