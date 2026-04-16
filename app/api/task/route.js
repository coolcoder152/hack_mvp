import OpenAI from "openai";

export async function POST(req) {
  try {
    const { task } = await req.json();

    if (!task) {
      return Response.json(
        { error: "Task is required" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Break this goal into a structured, step-by-step plan.

Rules:
- Use clear headings (Month 1, Month 2...)
- Use bullet points
- Keep steps concise and actionable
- Avoid unnecessary explanation

Goal:
${task}
          `,
        },
      ],
    });

    return Response.json({
      result: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return Response.json(
      {
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}