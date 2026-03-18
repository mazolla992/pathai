import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded-full mb-6">
          AI · Freemium · B2C + B2B
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          PathAI
        </h1>
        <p className="text-xl text-gray-600 mb-4">AI-навигатор по профессиям</p>
        <p className="text-gray-500 mb-10 max-w-xl mx-auto">
          За 10 минут анализирует интересы и навыки, строит персональную карту
          профессий — какие вузы рассмотреть и какие навыки качать прямо сейчас.
        </p>
        <Link
          href="/quiz"
          className="inline-block bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Начать анкету →
        </Link>
        <p className="text-gray-400 text-sm mt-4">15 вопросов · 5 минут · бесплатно</p>
      </div>

      {/* Steps */}
      <div className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10 text-center">
            Пользовательский путь
          </p>
          <div className="grid grid-cols-5 gap-4 text-center">
            {[
              { n: "01", title: "Анкета интересов", sub: "15 вопросов, 5 мин" },
              { n: "02", title: "AI строит профиль", sub: "сильные стороны + склонности" },
              { n: "03", title: "Карта профессий", sub: "топ-5 подходящих с зарплатами" },
              { n: "04", title: "Дорожная карта", sub: "что учить, куда поступать" },
              { n: "05", title: "Чат с AI", sub: "задать вопрос по карьере" },
            ].map((s) => (
              <div key={s.n} className="border border-gray-200 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-2">{s.n}</div>
                <div className="font-semibold text-sm text-gray-800 mb-1">{s.title}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
