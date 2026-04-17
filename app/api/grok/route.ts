import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript, options } = await req.json();

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: null, response: null });
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `
You are a mystical oracle guiding a meme quiz.

Your tasks:
1. Match the user's spoken answer to one of the given options.
2. Generate a short mystical response.

Rules:
- Response must be 1 short sentence (max 12 words)
- Tone: mystical, dramatic, ancient
- Do NOT explain reasoning

Return ONLY valid JSON:
{
  "answer": "exact option from list",
  "response": "mystical sentence"
}
`,
          },
          {
            role: "user",
            content: JSON.stringify({
              transcript,
              options,
            }),
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ answer: null, response: null });
    }

    const data = await res.json();

    let parsed;

    try {
      const content = data.choices?.[0]?.message?.content;
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ answer: null, response: null });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ answer: null, response: null });
  }
}
