import { geminiGenerate } from "../services/Gemini.service.js";
import {
  getDemoConversionPredictionService,
  getEarlyDropOffRisksService,
  getAdminFollowUpSLAService,
  getCoachEffectivenessService,
  simulateFunnelService,
  getExplainableAnalyticsService,
} from "../services/intelligence.service.js";

export const adminAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    /* ---------- 0. GUARD: EMPTY MESSAGE ---------- */
    if (!message || message.trim().length === 0) {
      return res.json({
        answer: "Please ask a valid operational question.",
      });
    }

    /* ---------- 1. INTENT DETECTION (SAFE) ---------- */
    let intentRaw = '{"intent":"UNKNOWN"}';

    try {
      intentRaw = await geminiGenerate({
        systemPrompt: `
You are an intent classifier for an admin operations assistant.
Return ONLY valid JSON.

Map vague or general business questions to the closest intent.

Intent meanings:
- CONVERSION_PRIORITY: demo performance, conversion likelihood, which demos to focus on
- HIGH_RISK_DEMOS: risky demos, drop-offs, demos needing attention
- ADMIN_SLA: admin follow-up speed, SLA, delays
- COACH_EFFECTIVENESS: coach performance, coach quality, teaching effectiveness
- FUNNEL_SIMULATION: what-if analysis, impact of improvements
- EXPLAIN_METRIC: explain metrics, definitions, how system works
- UNKNOWN: only if no reasonable mapping exists

Format:
{ "intent": "<INTENT>" }

`,
        userPrompt: message,
      });
    } catch (err) {
      console.error("Gemini Intent Error:", err);
    }

    // 🔒 Sanitize Gemini output (removes ```json fences)
    const cleanedIntent = intentRaw.replace(/```json|```/g, "").trim();

    let intent = "UNKNOWN";
    try {
      intent = JSON.parse(cleanedIntent).intent || "UNKNOWN";
    } catch {
      intent = "UNKNOWN";
    }

    /* ---------- 2. FETCH REAL SYSTEM DATA ---------- */
    let systemData = null;

    switch (intent) {
      case "CONVERSION_PRIORITY":
        systemData = await getDemoConversionPredictionService();
        break;

      case "HIGH_RISK_DEMOS":
        systemData = await getEarlyDropOffRisksService();
        break;

      case "ADMIN_SLA":
        systemData = await getAdminFollowUpSLAService();
        break;

      case "COACH_EFFECTIVENESS":
        systemData = await getCoachEffectivenessService();
        break;

      case "FUNNEL_SIMULATION":
        systemData = await simulateFunnelService({
          improveFollowUp: false,
          followUpBoost: 0,
          coachEffectivenessBoost: 0,
        });
        break;

      case "EXPLAIN_METRIC":
        systemData = await getExplainableAnalyticsService();
        break;

      default:
        // Smart default: treat vague questions as demo performance
        intent = "CONVERSION_PRIORITY";
        systemData = await getDemoConversionPredictionService();
        break;
    }

    /* ---------- 2.5 EMPTY DATA GUARD ---------- */
    if (Array.isArray(systemData) && systemData.length === 0) {
      return res.json({
        intent,
        answer:
          "No recent attended or interested demos were found to prioritize. Once demos are attended or marked as interested, conversion prioritization will be available.",
      });
    }

    /* ---------- 3. PROFESSIONAL EXPLANATION (SAFE) ---------- */
    let finalAnswer =
      "Unable to generate insights at the moment. Please try again later.";

    try {
      finalAnswer = await geminiGenerate({
        systemPrompt: `
You are an Admin Operations Assistant.
Rules:
- Explain only using provided system data
- Do NOT invent numbers or facts
- Be concise, professional, and operational
- Suggest focus areas, not direct actions
- If data is insufficient, say "Insufficient data to conclude."
- Respond in under 120 words.
`,
        userPrompt: `
Admin question: "${message}"

System data:
${JSON.stringify(systemData, null, 2)}
`,
      });
    } catch (err) {
      console.error("Gemini Explanation Error FULL:", err?.message || err);
      return res.status(500).json({
        error: "Gemini explanation failed",
        details: err?.message || err,
      });
    }

    /* ---------- 4. FINAL RESPONSE ---------- */
    return res.json({
      intent,
      answer: finalAnswer,
    });
  } catch (error) {
    console.error("Admin Assistant Fatal Error:", error);
    return res.status(500).json({
      answer: "Unable to process the request at the moment.",
    });
  }
};
