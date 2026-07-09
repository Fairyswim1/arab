import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { QuestionInput } from "@/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const { data, error } = await getSupabaseAdmin()
    .from("tests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tests: data });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const title = body.title as string;
    const description = (body.description as string) || null;
    const questions = body.questions as QuestionInput[];

    if (!title?.trim()) {
      return NextResponse.json({ error: "시험 제목을 입력해주세요." }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length !== 50) {
      return NextResponse.json(
        { error: "정확히 50문제를 입력해야 합니다." },
        { status: 400 }
      );
    }

    const numbers = new Set<number>();
    for (const q of questions) {
      if (
        !q.question_number ||
        q.question_number < 1 ||
        q.question_number > 50 ||
        !q.arabic_word?.trim() ||
        !q.choice_a?.trim() ||
        !q.choice_b?.trim() ||
        (q.answer !== "A" && q.answer !== "B")
      ) {
        return NextResponse.json(
          { error: `문제 ${q.question_number}번 입력이 올바르지 않습니다.` },
          { status: 400 }
        );
      }
      numbers.add(q.question_number);
    }

    if (numbers.size !== 50) {
      return NextResponse.json(
        { error: "1번부터 50번까지 모든 문제 번호가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: test, error: testError } = await getSupabaseAdmin()
      .from("tests")
      .insert({ title: title.trim(), description: description?.trim() || null })
      .select()
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: testError?.message ?? "시험 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const questionRows = questions.map((q) => ({
      test_id: test.id,
      question_number: q.question_number,
      arabic_word: q.arabic_word.trim(),
      choice_a: q.choice_a.trim(),
      choice_b: q.choice_b.trim(),
      answer: q.answer,
    }));

    const { error: questionsError } = await getSupabaseAdmin()
      .from("questions")
      .insert(questionRows);

    if (questionsError) {
      await getSupabaseAdmin().from("tests").delete().eq("id", test.id);
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    return NextResponse.json({ test });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
