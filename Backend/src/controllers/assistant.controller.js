import { geminiGenerate } from "../services/Gemini.service.js";
import {
  getDemoConversionPredictionService,
  getEarlyDropOffRisksService,
  getAdminFollowUpSLAService,
  getCoachEffectivenessService,
  simulateFunnelService,
  getExplainableAnalyticsService,
} from "../services/intelligence.service.js";
import { CoachProfile } from "../models/coach.model.js";
import { Student } from "../models/student.model.js";
import { Demo } from "../models/demo.model.js";
import { Batch } from "../models/batch.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Payment } from "../models/payment.model.js";
import { CoachPayout } from "../models/coachPayout.model.js";


const getDateRange = (timeRange) => {
  const now = new Date();

  if (timeRange === "this_month") {
    return { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  }

  if (timeRange === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { $gte: start, $lt: end };
  }

  if (timeRange === "this_week") {
    const start = new Date();
    start.setDate(now.getDate() - 7);
    return { $gte: start };
  }

  return null;
};



export const adminAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    /* ---------- 0. GUARD: EMPTY MESSAGE ---------- */
    if (!message || message.trim().length === 0) {
      return res.json({
        answer: "Please ask a valid operational question.",
      });
    }

    /* ---------- SIMPLE STATS FAST PATH ---------- */
    const isSimpleStatsQuestion = /how many|count|total|number of/i.test(
      message,
    );

    /* ---------- FILTERED STATS ---------- */
    const isFilteredStats =
      /(paid|pending|failed|completed|this month|last month|this week)/i.test(
        message,
      );

    if (isFilteredStats) {
      let count = 0;
      let answer = "No matching records found.";

      // paid coaches this month
      if (/coach/i.test(message) && /paid/i.test(message)) {
       let timeRange = "this_month";

       if (/last month/i.test(message)) timeRange = "last_month";
       else if (/this week/i.test(message)) timeRange = "this_week";

       const dateRange = getDateRange(timeRange);


        const paidCoachIds = await CoachPayout.distinct("coachId", {
          status: "PAID",
          ...(dateRange && { paidAt: dateRange }),
        });

        count = paidCoachIds.length;


        answer = `${count} coaches have been paid this month.`;
      }

      // payment pending demos
      else if (/demo/i.test(message) && /pending/i.test(message)) {
        count = await Demo.countDocuments({
          status: "PAYMENT_PENDING",
        });

        answer = `${count} demos are currently payment pending.`;
      }

      return res.json({
        intent: "FILTERED_STATS",
        answer,
      });
    }

    if (isSimpleStatsQuestion) {
      let answer = "I couldn't determine the requested count.";

      if (/coach/i.test(message)) {
        const count = await CoachProfile.countDocuments();
        answer = `There are currently ${count} coaches in the system.`;
      } else if (/student/i.test(message)) {
        const count = await Student.countDocuments();
        answer = `There are currently ${count} students in the system.`;
      } else if (/demo/i.test(message)) {
        const count = await Demo.countDocuments();
        answer = `There are currently ${count} demos recorded.`;
      }

      return res.json({
        intent: "SIMPLE_STATS",
        answer,
      });
    }

    /* ---------- LIST QUERY ---------- */
    const isListQuery = /(list|show|which|give me)/i.test(message);

    if (isListQuery) {
      let items = [];

      // demos needing follow-up
      if (/demo/i.test(message) && /follow/i.test(message)) {
        items = await Demo.find({
          status: { $in: ["ATTENDED", "INTERESTED", "PAYMENT_PENDING"] },
        })
          .select("_id status scheduledEnd")
          .limit(5)
          .lean();
      }

      if (items.length === 0) {
        return res.json({
          intent: "LIST_QUERY",
          answer: "No matching records found.",
        });
      }

      // Let Gemini summarize the list
      const summary = await geminiGenerate({
        systemPrompt: `
Summarize the following list for an admin.
Do not invent data.
Keep it short.
`,
        userPrompt: JSON.stringify(items),
      });

      return res.json({
        intent: "LIST_QUERY",
        answer: summary,
        data: items,
      });
    }

    /* ---------- AGGREGATE STATS ---------- */
    const isAggregateStats =
      /(revenue|amount|total paid|total revenue|payout)/i.test(message);

    if (isAggregateStats) {
      const dateRange = getDateRange("this_month");

      const result = await Payment.aggregate([
        {
          $match: {
            status: "SUCCESS",
            ...(dateRange && { createdAt: dateRange }),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const total = result[0]?.total || 0;

      return res.json({
        intent: "AGGREGATE_STATS",
        answer: `Total revenue this month is ₹${total}.`,
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
