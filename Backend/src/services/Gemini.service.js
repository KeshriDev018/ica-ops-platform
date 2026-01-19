import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function geminiGenerate({ systemPrompt, userPrompt }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // ✅ ONLY model supported reliably on v1beta
  const model = genAI.getGenerativeModel({
    model: "models/text-bison-001",
  });

  const prompt = `
${systemPrompt}

User question:
${userPrompt}
`;

  const result = await model.generateContent(prompt);

  const text = result?.response?.text();

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}
