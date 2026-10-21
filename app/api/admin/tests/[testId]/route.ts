import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { normalizeQuestionsList } from "@/lib/normalizeQuestions";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { QuestionInput } from "@/types";

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

  const { data: questions, error: questionsError } = await getSupabaseAdmin()
    .from("questions")
    .select("question_number, arabic_word, choice_a, choice_b, answer")
    .eq("test_id", testId)
    .order("question_number", { ascending: true });

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  const { count: submissionCount } = await getSupabaseAdmin()
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("test_id", testId);

  return NextResponse.json({
    test,
    questions: questions ?? [],
    submissionCount: submissionCount ?? 0,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const { testId } = await params;

  try {
    const body = await request.json();
    const title = body.title as string;
    const description = (body.description as string) || null;
    let questions: QuestionInput[];

    try {
      questions = normalizeQuestionsList(body.questions);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "문제 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: "시험 제목을 입력해주세요." }, { status: 400 });
    }

    const { data: existingTest } = await getSupabaseAdmin()
      .from("tests")
      .select("id")
      .eq("id", testId)
      .single();

    if (!existingTest) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
    }

    const { error: testError } = await getSupabaseAdmin()
      .from("tests")
      .update({
        title: title.trim(),
        description: description?.trim() || null,
      })
      .eq("id", testId);

    if (testError) {
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    const { error: deleteError } = await getSupabaseAdmin()
      .from("questions")
      .delete()
      .eq("test_id", testId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const questionRows = questions.map((q) => ({
      test_id: testId,
      question_number: q.question_number,
      arabic_word: q.arabic_word.trim(),
      choice_a: q.choice_a.trim(),
      choice_b: q.choice_b.trim(),
      answer: q.answer,
    }));

    const { error: insertError } = await getSupabaseAdmin()
      .from("questions")
      .insert(questionRows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "요청 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const { testId } = await params;

  const { data: test, error: findError } = await getSupabaseAdmin()
    .from("tests")
    .select("id, title")
    .eq("id", testId)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!test) {
    return NextResponse.json({ error: "시험을 찾을 수 없습니다." }, { status: 404 });
  }

  // questions, class_sessions, submissions는 ON DELETE CASCADE로 함께 삭제된다.
  const { error: deleteError } = await getSupabaseAdmin()
    .from("tests")
    .delete()
    .eq("id", testId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deletedTitle: test.title });
}
