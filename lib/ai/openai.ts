export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function getOpenAiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return key;
}

function getModel(preferred?: string): string {
  return preferred || process.env.OPENAI_MODEL || "gpt-4o";
}

export async function createChatCompletion(options: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = getOpenAiKey();
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(options.model),
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }
  return text;
}
