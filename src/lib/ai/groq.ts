// Server-only Groq client (OpenAI-compatible) — only imported by the API route.
// The key is read from the env and never logged or returned to the client.
// Uses structured outputs (json_schema, strict).
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function hasGroqKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export class GroqError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface Msg {
  role: "system" | "user";
  content: string;
}

/** Call Groq chat completions with a strict JSON schema; returns parsed JSON. */
export async function groqJson(messages: Msg[], jsonSchema: unknown): Promise<unknown> {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  if (!key) throw new GroqError(0, "no key");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 4096,
      messages,
      response_format: { type: "json_schema", json_schema: jsonSchema },
    }),
  });

  if (!res.ok) {
    // Do not include the body verbatim in client-facing errors.
    throw new GroqError(res.status, `groq ${res.status}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new GroqError(502, "empty completion");
  try {
    return JSON.parse(content);
  } catch {
    throw new GroqError(502, "non-json completion");
  }
}
