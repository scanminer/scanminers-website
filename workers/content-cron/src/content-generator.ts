// workers/content-cron/src/content-generator.ts

import type { Env } from './index';

// The v1.1 "Research Analyst" prompt
const getPerplexityPrompt = (topic: string) => `
You are a meticulous research analyst specializing in remote sensing and mineral exploration. Your task is to create a comprehensive "Research Brief" on the topic: "${topic}"

Follow this chain-of-thought process step-by-step:
1. Break down the topic: Define key terms and their importance.
2. Identify key challenges: Research pain points in traditional methods.
3. Explore applications: Gather data on how the technology is applied.
4. Collect evidence: Find at least 3 case studies, peer-reviewed studies, or industry reports (prioritize post-2022).
5. Address limitations and synergies: Discuss drawbacks and integrations with other tech (e.g., AI/ML).
6. Quantify value: Pull metrics like success rates or cost reductions.
7. Ensure neutrality: Present a balanced view.

Output Structure (use markdown for clarity):
- **Executive Summary:** 200-300 word overview.
- **Key Data Points:** Bullet list of facts, each with citable sources.
- **Recent Findings & Case Studies:** Summaries of 3-5 studies/projects.
- **Challenges & Future Trends:** Bullet list of limitations and emerging solutions.
- **Full Citations:** Numbered list in APA format with URLs.

Rules:
- Every claim MUST have a verifiable URL citation.
- Prioritize sources published after January 1, 2022.
- Do not invent or hallucinate.
`;

export async function generateContent(env: Env, topic: string): Promise<string> {
  const prompt = getPerplexityPrompt(topic);
  const model = env.PERPLEXITY_MODEL || 'llama-3.1-sonar-large-128k-online';

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${env.PERPLEXITY_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Be precise and factual.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message.content ?? '';
}
