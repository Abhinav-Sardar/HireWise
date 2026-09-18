import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { resumeText, jobRole, expectedSalary } = await req.json();

    const analysisCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an elite,  honest technical recruiter for HireWise. 
          Analyze the provided resume data against the target job role and expected salary.
          Do NOT sugarcoat. If the salary expectation is too high for their skills, call them out.
          Provide a JSON response with exactly this structure:
          {
            "score": <number 1-100>,
            "realityCheck": "<brutally honest 2-sentence summary>",
            "missingSkills": ["skill1", "skill2", "skill3"],
            "resumeFixes": ["fix1", "fix2"]
          }`,
        },
        {
          role: "user",
          content: `Target Role: ${jobRole}\nExpected Salary: ${expectedSalary}\nResume Content: ${resumeText}`,
        },
      ],
      model: "openai/gpt-oss-20b",

      temperature: 0.2, // Low temp for analytical consistency
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(
      analysisCompletion.choices[0]?.message?.content || "{}",
    );
    return Response.json(result);
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return Response.json(
      { error: "Failed to analyze resume." },
      { status: 500 },
    );
  }
}
