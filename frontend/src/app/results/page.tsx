"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getResult, sendChat } from "@/lib/api";
import Link from "next/link";
import { Suspense } from "react";

type Career = {
  title: string;
  description: string;
  salary_min: number;
  salary_max: number;
  match_percent: number;
  universities: string[];
  skills_needed: string[];
  growth_path: string;
};

type Profile = {
  strengths: string[];
  tendencies: string[];
  personality_type: string;
  careers: Career[];
  roadmap: {
    now: string[];
    in_3_months: string[];
    in_1_year: string[];
  };
};

type ChatMessage = { role: "user" | "assistant"; content: string };

function formatSalary(n: number) {
  return (n / 1000).toFixed(0) + "к ₽";
}

function ResultsContent() {
  const params = useSearchParams();
  const sessionId = params.get("session");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    getResult(sessionId)
      .then((data) => setProfile(data.result))
      .catch(() => setError("Результат не найден. Попробуй пройти анкету заново."));
  }, [sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory((h) => [...h, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const data = await sendChat(sessionId, msg, chatHistory);
      setChatHistory((h) => [...h, { role: "assistant", content: data.reply }]);
    } catch {
      setChatHistory((h) => [...h, { role: "assistant", content: "Ошибка. Попробуй ещё раз." }]);
    }
    setChatLoading(false);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/quiz" className="text-black underline">Пройти анкету</Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">← PathAI</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Твой профиль</h1>
          <p className="text-gray-500">{profile.personality_type}</p>
        </div>

        {/* Strengths & Tendencies */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Сильные стороны</p>
            <ul className="space-y-1">
              {profile.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-700">— {s}</li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Склонности</p>
            <ul className="space-y-1">
              {profile.tendencies.map((t, i) => (
                <li key={i} className="text-sm text-gray-700">— {t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career map */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">Карта профессий</h2>
        <div className="space-y-4 mb-10">
          {profile.careers.map((career, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-gray-900">{career.title}</span>
                  {i === 0 && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-0.5 rounded-full">Лучшее совпадение</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700">{career.match_percent}%</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{career.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {formatSalary(career.salary_min)} — {formatSalary(career.salary_max)}/мес
                </span>
                {career.skills_needed.map((sk, j) => (
                  <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{sk}</span>
                ))}
              </div>
              {career.universities.length > 0 && (
                <p className="text-xs text-gray-400">Вузы: {career.universities.join(", ")}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{career.growth_path}</p>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <h2 className="text-xl font-bold text-gray-900 mb-5">Дорожная карта</h2>
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Сейчас", items: profile.roadmap.now },
            { label: "Через 3 месяца", items: profile.roadmap.in_3_months },
            { label: "Через год", items: profile.roadmap.in_1_year },
          ].map((col) => (
            <div key={col.label} className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{col.label}</p>
              <ul className="space-y-2">
                {col.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <p className="font-semibold text-sm text-gray-800">Чат с AI по карьере</p>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <p className="text-sm text-gray-400 text-center mt-8">
                Задай любой вопрос о своей карьере, вузах или навыках
              </p>
            )}
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs text-sm px-4 py-2 rounded-xl ${
                    m.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 text-sm px-4 py-2 rounded-xl">...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChat} className="flex border-t border-gray-200">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Напиши вопрос..."
              className="flex-1 px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 text-sm font-medium text-white bg-black disabled:opacity-30 hover:bg-gray-800 transition-colors"
            >
              →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
