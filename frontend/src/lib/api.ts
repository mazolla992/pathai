const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function submitQuiz(answers: Record<string, string>, sessionId?: string) {
  const res = await fetch(`${API_URL}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to submit quiz");
  return res.json();
}

export async function getResult(sessionId: string) {
  const res = await fetch(`${API_URL}/api/quiz/result/${sessionId}`);
  if (!res.ok) throw new Error("Result not found");
  return res.json();
}

export async function sendChat(sessionId: string, message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API_URL}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, history }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
