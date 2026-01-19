import fetch from "node-fetch";

export async function geminiGenerate({ systemPrompt, userPrompt }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // ✅ USE MODEL THAT EXISTS (from your /v1/models output)
  const endpoint =
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\nUser question:\n${userPrompt}`,
          },
        ],
      },
    ],
  };

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data, null, 2));
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}
