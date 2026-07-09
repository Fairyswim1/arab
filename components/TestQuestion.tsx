"use client";

import type { AnswerChoice } from "@/types";

interface TestQuestionProps {
  questionNumber: number;
  arabicWord: string;
  choiceA: string;
  choiceB: string;
  selected?: AnswerChoice;
  onSelect: (choice: AnswerChoice) => void;
}

export default function TestQuestion({
  questionNumber,
  arabicWord,
  choiceA,
  choiceB,
  selected,
  onSelect,
}: TestQuestionProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">문제 {questionNumber}</span>
        {selected && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            선택됨
          </span>
        )}
      </div>
      <p
        className="mb-4 text-center text-3xl font-bold text-gray-900 sm:text-4xl"
        dir="rtl"
        lang="ar"
      >
        {arabicWord}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("A")}
          className={`rounded-xl border-2 px-4 py-4 text-left text-lg font-medium transition-colors ${
            selected === "A"
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-gray-200 bg-gray-50 text-gray-800 hover:border-blue-300"
          }`}
        >
          <span className="mr-2 font-bold">A.</span>
          {choiceA}
        </button>
        <button
          type="button"
          onClick={() => onSelect("B")}
          className={`rounded-xl border-2 px-4 py-4 text-left text-lg font-medium transition-colors ${
            selected === "B"
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-gray-200 bg-gray-50 text-gray-800 hover:border-blue-300"
          }`}
        >
          <span className="mr-2 font-bold">B.</span>
          {choiceB}
        </button>
      </div>
    </div>
  );
}
