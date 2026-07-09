-- 기존 DB를 student_number -> student_id(학번)로 변경할 때 실행
-- 이미 student_id 컬럼이 있으면 실행하지 마세요.

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_student_number_check;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_class_session_id_student_number_student_name_key;

ALTER TABLE submissions RENAME COLUMN student_number TO student_id;

ALTER TABLE submissions ALTER COLUMN student_id TYPE TEXT USING student_id::TEXT;

ALTER TABLE submissions ADD CONSTRAINT submissions_class_session_id_student_id_student_name_key
  UNIQUE (class_session_id, student_id, student_name);
