"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/questions";
import { submitQuiz } from "@/lib/api";

export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const question = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  function handleSelect(value: string) {
    setSelected(value);
  }

  async function handleNext() {
    if (!selected) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      // Submit
      setLoading(true);
      try {
        const data = await submitQuiz(newAnswers);
        router.push(`/results?session=${data.session_id}`);
      } catch {
        alert("Ошибка при отправке анкеты. Проверьте что бэкенд запущен.");
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-gray-600 text-lg">AI анализирует твои ответы...</p>
        <p className="text-gray-400 text-sm mt-2">Обычно занимает 10–20 секунд</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Counter */}
          <p className="text-sm text-gray-400 mb-6 text-center">
            Вопрос {current + 1} из {QUESTIONS.length}
          </p>

          {/* Question */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center leading-snug">
            {question.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  selected === opt.value
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="mt-8 w-full bg-black text-white py-4 rounded-xl font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {current < QUESTIONS.length - 1 ? "Следующий вопрос →" : "Получить результат →"}
          </button>

          {/* Back */}
          {current > 0 && (
            <button
              onClick={() => { setCurrent(current - 1); setSelected(answers[QUESTIONS[current - 1].id] || null); }}
              className="mt-3 w-full text-gray-400 text-sm py-2 hover:text-gray-600"
            >
              ← Назад
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
