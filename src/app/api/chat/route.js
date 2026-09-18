import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { history, userMessage, mode, metrics } = await req.json();

    const validHistory = history
      .filter((msg, index) => !(index === 0 && msg.sender === "Mia"))
      .map((msg) => ({
        role: msg.sender === "Mia" ? "assistant" : "user",
        content: msg.text,
      }));

    // Mode 1: Brutal Analytical Grading
    if (mode === "summarize") {
      const summaryCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are Mia, a Senior SWE Interviewer grading a candidate. 
              Do NOT sugarcoat. Call out every mistake, hesitation, and gap in their technical knowledge. 
              Evaluate their answers for technical correctness.
              You are provided with their behavioral telemetry: ${JSON.stringify(metrics)}. Use this data to criticize their communication and body language.
              
              Return a JSON object strictly matching this format:
              {
                "overallScore": <number 0-100>,
                "technicalFeedback": "<brutally honest feedback on whether their answers were actually correct>",
                "behavioralFeedback": "<critique their filler words, speech delay, eye contact, and posture>",
                "realityCheck": "<A 2-sentence hardcore summary calling out their biggest flaws>",
                "strongTopics": ["topic1"],
                "weakTopics": ["topic1"]
              }`,
          },
          ...validHistory,
          {
            role: "user",
            content:
              "The interview is over. Generate my final score and analytical JSON summary.",
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const gradingData = JSON.parse(
        summaryCompletion.choices[0]?.message?.content || "{}",
      );
      return Response.json(gradingData);
    }

    // Mode 2: Active SWE Interview
    validHistory.push({ role: "user", content: userMessage });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Mia, a senior Software Engineering technical interviewer. 
          Your style is brutally honest, highly critical, and direct. Absolutely no sugarcoating.
          1. Directly call out any mistakes. Give a hardcore reality check if the answer is weak.
          2. Provide the foolproof, correct explanation covering all grounds briefly.
          3. Ask the next SWE technical question.
          Keep responses under 4 sentences.`,
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
    console.error("Groq Error:", error);
    return Response.json(
      { error: error.message || "Fatal error communicating with Groq." },
      { status: 500 },
    );
  }
}
