import anthropic
import json
from app.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """Ты — эксперт по профориентации для школьников и студентов в России.
Анализируй ответы на анкету и возвращай ТОЛЬКО валидный JSON без markdown-блоков.
Используй реальные данные о профессиях, вузах и зарплатах в России."""

ANALYZE_PROMPT = """На основе ответов на анкету создай профессиональный профиль.

Ответы анкеты:
{answers}

Верни JSON в формате:
{{
  "strengths": ["сила1", "сила2", "сила3"],
  "tendencies": ["склонность1", "склонность2"],
  "personality_type": "краткое описание типа личности",
  "careers": [
    {{
      "title": "Название профессии",
      "description": "Краткое описание чем занимается",
      "salary_min": 80000,
      "salary_max": 250000,
      "match_percent": 95,
      "universities": ["Название вуза 1", "Название вуза 2"],
      "skills_needed": ["навык1", "навык2", "навык3"],
      "growth_path": "Стажёр → Специалист → Старший специалист → Руководитель"
    }}
  ],
  "roadmap": {{
    "now": ["Действие 1", "Действие 2"],
    "in_3_months": ["Действие 1", "Действие 2"],
    "in_1_year": ["Действие 1", "Действие 2"]
  }}
}}

Верни ровно 5 профессий, отсортированных по match_percent убыванию."""


async def analyze_quiz(answers: dict) -> dict:
    formatted_answers = "\n".join(
        f"Вопрос {q_id}: {answer}" for q_id, answer in answers.items()
    )
    prompt = ANALYZE_PROMPT.format(answers=formatted_answers)

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    content = message.content[0].text
    return json.loads(content)


async def chat_with_ai(session_id: str, profile: dict, message: str, history: list) -> str:
    profile_context = f"""
Профиль пользователя:
- Сильные стороны: {', '.join(profile.get('strengths', []))}
- Склонности: {', '.join(profile.get('tendencies', []))}
- Тип личности: {profile.get('personality_type', '')}
- Топ-профессия: {profile['careers'][0]['title'] if profile.get('careers') else 'не определена'}
"""

    messages = []
    for h in history[-10:]:  # last 10 messages for context
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT + "\n\n" + profile_context,
        messages=messages,
    )

    return response.content[0].text
