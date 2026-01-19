import { Demo } from "../models/demo.model.js";
import { Student } from "../models/student.model.js";

/* =====================================================
   1️⃣ Conversion Prediction
   ===================================================== */
export const getDemoConversionPredictionService = async () => {
  const demos = await Demo.find({
    status: { $in: ["ATTENDED", "INTERESTED", "PAYMENT_PENDING"] },
  });

  const coachStats = await Demo.aggregate([
    {
      $group: {
        _id: "$coachId",
        total: { $sum: 1 },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] },
        },
      },
    },
  ]);

  const coachConversionMap = {};
  coachStats.forEach((c) => {
    coachConversionMap[c._id?.toString()] =
      c.total === 0 ? 0 : c.converted / c.total;
  });

  const results = demos.map((demo) => {
    let score = 0;
    const reasons = [];

    if (demo.status !== "BOOKED") {
      score += 30;
      reasons.push("Demo attended");
    }

    if (["INTERESTED", "PAYMENT_PENDING"].includes(demo.status)) {
      score += 40;
      reasons.push("Parent interested");
    }

    if (demo.recommendedStudentType === "group") {
      score += 10;
      reasons.push("Group class preference");
    } else if (demo.recommendedStudentType === "1-1") {
      score += 5;
      reasons.push("1-1 class preference");
    }

    const coachRate = coachConversionMap[demo.coachId?.toString()] || 0;
    if (coachRate > 0.6) {
      score += 10;
      reasons.push("Coach has high conversion history");
    }

    const followUpMinutes = (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);
    if (followUpMinutes <= 60) {
      score += 10;
      reasons.push("Fast admin follow-up");
    }

    let riskLevel = "HIGH";
    if (score >= 75) riskLevel = "LOW";
    else if (score >= 50) riskLevel = "MEDIUM";

    return {
      demoId: demo._id,
      conversionScore: score,
      riskLevel,
      reasons,
    };
  });

  results.sort((a, b) => b.conversionScore - a.conversionScore);
  return results;
};

/* =====================================================
   2️⃣ Admin Follow-up SLA
   ===================================================== */
export const getAdminFollowUpSLAService = async () => {
  const demos = await Demo.find({
    status: { $in: ["INTERESTED", "NOT_INTERESTED", "CONVERTED", "DROPPED"] },
  });

  const results = demos.map((demo) => {
    const followUpMinutes = (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);

    let slaStatus = "EXCELLENT";
    if (followUpMinutes > 120) slaStatus = "BREACHED";
    else if (followUpMinutes > 30) slaStatus = "WARNING";

    return {
      demoId: demo._id,
      adminId: demo.adminId,
      followUpMinutes: Math.round(followUpMinutes),
      slaStatus,
    };
  });

  results.sort((a, b) => b.followUpMinutes - a.followUpMinutes);
  return results;
};

/* =====================================================
   3️⃣ Coach Effectiveness
   ===================================================== */
export const getCoachEffectivenessService = async () => {
  return await Demo.aggregate([
    {
      $group: {
        _id: "$coachId",
        totalDemos: { $sum: 1 },
        attended: {
          $sum: { $cond: [{ $eq: ["$status", "ATTENDED"] }, 1, 0] },
        },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] },
        },
        noShow: {
          $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        coachId: "$_id",
        attendanceRate: {
          $cond: [
            { $eq: ["$totalDemos", 0] },
            0,
            { $divide: ["$attended", "$totalDemos"] },
          ],
        },
        conversionRate: {
          $cond: [
            { $eq: ["$attended", 0] },
            0,
            { $divide: ["$converted", "$attended"] },
          ],
        },
        noShowRate: {
          $cond: [
            { $eq: ["$totalDemos", 0] },
            0,
            { $divide: ["$noShow", "$totalDemos"] },
          ],
        },
      },
    },
    {
      $addFields: {
        coachScore: {
          $multiply: [
            {
              $add: [
                { $multiply: ["$conversionRate", 0.5] },
                { $multiply: ["$attendanceRate", 0.3] },
                { $multiply: ["$noShowRate", -0.2] },
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { coachScore: -1 } },
  ]);
};

/* =====================================================
   4️⃣ Early Drop-off Risks
   ===================================================== */
export const getEarlyDropOffRisksService = async () => {
  const demos = await Demo.find({
    status: { $in: ["ATTENDED", "INTERESTED"] },
  });

  return demos.map((demo) => {
    const risks = [];

    const followUpMinutes = (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);
    if (followUpMinutes > 120) risks.push("Delayed admin follow-up");

    if (demo.status === "ATTENDED") risks.push("Outcome not submitted yet");

    const hour = new Date(demo.scheduledStart).getHours();
    if (hour < 6 || hour > 22) risks.push("Odd demo timing");

    let riskLevel = "LOW";
    if (risks.length >= 2) riskLevel = "HIGH";
    else if (risks.length === 1) riskLevel = "MEDIUM";

    return {
      demoId: demo._id,
      riskLevel,
      riskReasons: risks,
    };
  });
};

/* =====================================================
   5️⃣ Funnel Simulator
   ===================================================== */
export const simulateFunnelService = async ({
  improveFollowUp = false,
  followUpBoost = 0,
  coachEffectivenessBoost = 0,
}) => {
  const stats = await Demo.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        attended: {
          $sum: { $cond: [{ $eq: ["$status", "ATTENDED"] }, 1, 0] },
        },
        converted: {
          $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] },
        },
      },
    },
  ]);

  const base = stats[0] || { total: 0, attended: 0, converted: 0 };

  let attendanceRate = base.total === 0 ? 0 : base.attended / base.total;
  let conversionRate = base.attended === 0 ? 0 : base.converted / base.attended;

  const assumptions = [];

  if (improveFollowUp) {
    attendanceRate += followUpBoost;
    assumptions.push(`Admin follow-up improved by ${followUpBoost * 100}%`);
  }

  if (coachEffectivenessBoost > 0) {
    conversionRate += coachEffectivenessBoost;
    assumptions.push(
      `Coach effectiveness improved by ${coachEffectivenessBoost * 100}%`
    );
  }

  return {
    current: {
      attendanceRate: Number((base.attended / base.total || 0).toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
    },
    simulated: {
      attendanceRate: Number(Math.min(attendanceRate, 1).toFixed(2)),
      conversionRate: Number(Math.min(conversionRate, 1).toFixed(2)),
    },
    assumptions,
  };
};


export const getExplainableAnalyticsService = async () => {
  return [
    {
      metric: "Conversion Prediction Score",
      meaning: "Prioritizes demos likely to convert",
    },
    {
      metric: "Drop-off Risk",
      meaning: "Identifies demos needing urgent follow-up",
    },
    {
      metric: "Admin SLA",
      meaning: "Measures follow-up responsiveness",
    },
    {
      metric: "Coach Effectiveness",
      meaning: "Evaluates coach performance across demos",
    },
    {
      metric: "Funnel Simulation",
      meaning: "Predicts conversion impact under changes",
    },
  ];
};

