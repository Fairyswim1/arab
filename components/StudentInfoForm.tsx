"use client";

interface StudentInfoFormProps {
  studentId: string;
  studentName: string;
  onStudentIdChange: (value: string) => void;
  onNameChange: (value: string) => void;
  disabled?: boolean;
}

export default function StudentInfoForm({
  studentId,
  studentName,
  onStudentIdChange,
  onNameChange,
  disabled,
}: StudentInfoFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">학번</label>
        <input
          type="text"
          inputMode="numeric"
          value={studentId}
          onChange={(e) => onStudentIdChange(e.target.value.trim())}
          disabled={disabled}
          placeholder="예: 10105"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          placeholder="이름을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
          required
        />
      </div>
    </div>
  );
}
