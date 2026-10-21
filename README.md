# 아랍어 단어시험 웹앱

중심극한정리(CLT) 수업용 아랍어 단어시험 실험 플랫폼입니다.  
교사가 시험을 생성하고 반별 링크를 배포하면, 학생들이 모바일에서도 편하게 응시할 수 있습니다.  
제출된 결과는 Supabase에 저장되며, 10/20/30/50문제 점수 분포를 비교하여 중심극한정리를 시각적으로 확인할 수 있습니다.

## 주요 기능

- **교사**: 시험 생성·**문제 수정**, JSON 일괄 입력, 반별 세션/링크 생성, 결과 통계 및 CSV 다운로드
- **학생**: 반별 링크로 접속 → **학번**/이름 입력 → 50문항 응시 → 서버 채점 후 제출
- **통계**: 평균·분산·표준편차(모분산 기준), 0~50점 빈도표, 10/20/30/50문항 분포 비교(합·비율), 이론값 B(n, 1/2) 대조, 반별 비교

## 기술 스택

- Next.js (App Router) + TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- Recharts
- Vercel 배포

## Supabase 테이블 생성 SQL

Supabase Dashboard → SQL Editor에서 아래 SQL을 실행하세요.  
(프로젝트의 `supabase/schema.sql` 파일과 동일합니다.)

```sql
-- 1. 시험
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. 문제
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

-- 3. 반별 세션
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
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  answers_json JSONB NOT NULL,
  score_total INTEGER NOT NULL CHECK (score_total BETWEEN 0 AND 50),
  score_10 INTEGER NOT NULL CHECK (score_10 BETWEEN 0 AND 10),
  score_20 INTEGER NOT NULL CHECK (score_20 BETWEEN 0 AND 20),
  score_30 INTEGER NOT NULL CHECK (score_30 BETWEEN 0 AND 30),
  score_50 INTEGER NOT NULL CHECK (score_50 BETWEEN 0 AND 50),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_session_id, student_id, student_name)
);

CREATE INDEX idx_submissions_test_id ON submissions (test_id);
CREATE INDEX idx_submissions_class_session_id ON submissions (class_session_id);
```

기존 DB에 `student_number` 컬럼이 있다면 `supabase/migration_student_id.sql`을 SQL Editor에서 실행하세요.

## 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_admin_password
```

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** service role key (클라이언트 노출 금지) |
| `ADMIN_PASSWORD` | 교사용 관리자 페이지 비밀번호 |

> **보안**: `SUPABASE_SERVICE_ROLE_KEY`와 문제 정답(`answer`)은 서버 API에서만 사용됩니다. 학생 화면에는 정답이 전달되지 않습니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local 값을 실제 Supabase/비밀번호로 수정

npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## Vercel 배포

1. GitHub 저장소에 코드 push
2. [Vercel](https://vercel.com)에서 New Project → 저장소 import
3. Environment Variables에 위 4개 변수 등록
4. Deploy

배포 후 `https://your-domain.vercel.app` 형태의 URL이 생성됩니다.

## 교사 사용 방법

### 1. 시험 생성

1. `/admin` 접속 → 관리자 비밀번호 입력
2. **시험 관리** → **새 시험 만들기**
3. 제목, 설명, 50문항 입력 (또는 JSON 붙여넣기, 또는 **샘플 50문항 불러오기** 버튼으로 `data/sample-questions.json` 적용)
4. **시험 생성** 클릭

JSON 입력 예시:

```json
[
  {
    "question_number": 1,
    "arabic_word": "أم",
    "choice_a": "아버지",
    "choice_b": "어머니",
    "answer": "B"
  }
]
```

### 2. 시험 수정

1. 시험 목록에서 **문제 수정** 클릭
2. 제목, 설명, 50문항 수정 후 **수정 저장**

> 이미 응시한 학생이 있으면, 문제 수정 후에도 기존 점수는 자동 재계산되지 않습니다.

### 3. 반별 링크 생성

1. 시험 목록에서 **반별 세션** 클릭
2. 반 이름 입력 (예: `3학년 1반`) → **반 세션 생성**
3. 생성된 학생용 링크 복사 → 학생에게 공유

학생 링크 형식: `https://사이트주소/test/{session_code}`

### 4. 결과 확인

1. 시험 목록에서 **결과 보기** 클릭
2. 전체/반별 필터, 0~50점 빈도표·막대그래프, 이론값 B(50, 1/2) 비교
3. **문제 수별 분포 비교(CLT)**: 10/20/30/50문항의 맞힌 개수(합) 또는 맞힌 비율(평균) 분포를 겹쳐 보고 이론 평균·표준편차와 대조
4. 반이 둘 이상이면 반별 평균·표준편차 비교 그래프
5. 반별 상세 페이지에서 학생별 표 및 **CSV 다운로드**

## 학생 사용 방법

1. 선생님이 공유한 링크로 접속
2. 학번, 이름 입력
3. 50문항 모두 선택 후 **답안 제출**
4. **제출 완료** 화면 확인 (점수는 표시되지 않음)

> 같은 반·같은 학번·같은 이름으로 중복 제출할 수 없습니다.

## 라우팅 구조

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/admin` | 관리자 로그인 |
| `/admin/tests` | 시험 목록 |
| `/admin/tests/new` | 시험 생성 |
| `/admin/tests/[testId]/edit` | 시험 문제 수정 |
| `/admin/tests/[testId]/classes` | 반별 세션 |
| `/admin/tests/[testId]/results/[classSessionId]` | 반별 상세 |
| `/test/[sessionCode]` | 학생 시험 |

## API

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/admin/login` | 관리자 로그인 |
| GET | `/api/admin/verify` | 관리자 인증 확인 |
| GET/POST | `/api/admin/tests` | 시험 목록/생성 |
| GET/POST | `/api/admin/classes` | 반 세션 목록/생성 |
| GET | `/api/test/[sessionCode]` | 학생용 시험 (정답 제외) |
| POST | `/api/submit` | 답안 제출 및 서버 채점 |
| GET | `/api/admin/results/[testId]` | 시험 전체 통계 |
| GET | `/api/admin/results/[testId]/[classSessionId]` | 반별 통계 |

## 라이선스

교육용 프로젝트
