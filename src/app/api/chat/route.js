import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { history, userMessage, mode } = await req.json();

    const validHistory = history
      .filter((msg, index) => !(index === 0 && msg.sender === "Mia"))
      .map((msg) => ({
        role: msg.sender === "Mia" ? "assistant" : "user",
        content: msg.text,
      }));

    // Mode 1: Final Analytical Summary
    if (mode === "summarize") {
      const summaryCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are Mia, a Senior SWE Interviewer. The interview has ended. Analyze the user's answers and generate a brutally honest performance report. Call out specific gaps in their knowledge, give a hardcore reality check, and provide a final score out of 10. Format this nicely using markdown.",
          },
          ...validHistory,
          {
            role: "user",
            content:
              "The interview is over. Generate my final score and analytical summary.",
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
      });
      return Response.json({
        response:
          summaryCompletion.choices[0]?.message?.content || "Summary failed.",
      });
    }

    // Mode 2: Active SWE Interview
    validHistory.push({ role: "user", content: userMessage });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Mia, a senior Software Engineering (SWE) technical interviewer. 
          Your style is brutally honest, highly critical, and direct. Absolutely no sugarcoating.
          When the user answers:
          1. Directly call out any mistakes or faltering. Give them a hardcore reality check if the answer is weak.
          2. Provide the foolproof, correct explanation covering all grounds briefly.
          3. Ask the next SWE technical question (System Design, Algorithms, Backend).
          Keep responses under 4 sentences to maintain rapid pacing.`,
        },
        ...validHistory,
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.6,
    });

    return Response.json({
      response: chatCompletion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    console.error("Groq SDK Error:", error);
    return Response.json(
      { error: error.message || "Fatal error communicating with Groq." },
      { status: 500 },
    );
  }
}
