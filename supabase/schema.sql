-- 아랍어 단어시험 웹앱 Supabase 스키마

-- 1. 시험
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. 문제 (정답은 서버에서만 사용)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 50),
  arabic_word TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('A', 'B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (test_id, question_number)
);

CREATE INDEX idx_questions_test_id ON questions (test_id);

-- 3. 반별 세션 (학생 링크용)
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  session_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_class_sessions_test_id ON class_sessions (test_id);
CREATE INDEX idx_class_sessions_session_code ON class_sessions (session_code);

-- 4. 제출 기록
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  class_session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_class TEXT NOT NULL,
  student_number INTEGER NOT NULL CHECK (student_number > 0),
  student_name TEXT NOT NULL,
  answers_json JSONB NOT NULL,
  score_total INTEGER NOT NULL CHECK (score_total BETWEEN 0 AND 50),
  score_10 INTEGER NOT NULL CHECK (score_10 BETWEEN 0 AND 10),
  score_20 INTEGER NOT NULL CHECK (score_20 BETWEEN 0 AND 20),
  score_30 INTEGER NOT NULL CHECK (score_30 BETWEEN 0 AND 30),
  score_50 INTEGER NOT NULL CHECK (score_50 BETWEEN 0 AND 50),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_session_id, student_number, student_name)
);

CREATE INDEX idx_submissions_test_id ON submissions (test_id);
CREATE INDEX idx_submissions_class_session_id ON submissions (class_session_id);
