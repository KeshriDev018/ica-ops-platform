import { Demo } from "../models/demo.model.js";
import { Student } from "../models/student.model.js";

/**
 * ADMIN: Conversion prediction for demos
 */
export const getDemoConversionPrediction = async (req, res) => {
  try {
    const demos = await Demo.find({
      status: { $in: ["ATTENDED", "INTERESTED", "PAYMENT_PENDING"] },
    });

    // Get coach historical conversion data
    const coachStats = await Demo.aggregate([
      {
        $group: {
          _id: "$coachId",
          total: { $sum: 1 },
          converted: {
            $sum: {
              $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
            },
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

      // Attendance
      if (demo.status !== "BOOKED") {
        score += 30;
        reasons.push("Demo attended");
      }

      // Interest
      if (demo.status === "INTERESTED" || demo.status === "PAYMENT_PENDING") {
        score += 40;
        reasons.push("Parent interested");
      }

      // Student type
      if (demo.recommendedStudentType === "group") {
        score += 10;
        reasons.push("Group class preference");
      } else if (demo.recommendedStudentType === "1-1") {
        score += 5;
        reasons.push("1-1 class preference");
      }

      // Coach performance
      const coachRate = coachConversionMap[demo.coachId?.toString()] || 0;
      if (coachRate > 0.6) {
        score += 10;
        reasons.push("Coach has high conversion history");
      }

      // Follow-up speed
      const followUpMinutes =
        (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);
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

    // Sort by priority
    results.sort((a, b) => b.conversionScore - a.conversionScore);

    res.json(results);
  } catch (error) {
    console.error("Error in getDemoConversionPrediction:", error);
    res
      .status(500)
      .json({
        message: "Failed to get conversion prediction",
        error: error.message,
      });
  }
};

/**
 * ADMIN: Follow-up SLA tracking
 */
export const getAdminFollowUpSLA = async (req, res) => {
  try {
    const demos = await Demo.find({
      status: {
        $in: ["INTERESTED", "NOT_INTERESTED", "CONVERTED", "DROPPED"],
      },
    });

    const results = demos
      // ✅ ensure demo actually ended
      .filter(
        (demo) =>
          demo.scheduledEnd &&
          demo.updatedAt &&
          demo.updatedAt >= demo.scheduledEnd,
      )
      .map((demo) => {
        const followUpMinutes =
          (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);

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

    // Sort worst SLA first
    results.sort((a, b) => b.followUpMinutes - a.followUpMinutes);

    res.json(results);
  } catch (error) {
    console.error("Error in getAdminFollowUpSLA:", error);
    res
      .status(500)
      .json({ message: "Failed to get admin SLA data", error: error.message });
  }
};

/**
 * ADMIN: Coach effectiveness index (final-stage based)
 */
export const getCoachEffectiveness = async (req, res) => {
  try {
    const pipeline = [
      // Only demos that reached judgement stages
      {
        $match: {
          coachId: { $ne: null },
          status: {
            $in: [
              "INTERESTED",
              "NOT_INTERESTED",
              "PAYMENT_PENDING",
              "CONVERTED",
              "DROPPED",
            ],
          },
        },
      },

      // Aggregate outcomes per coach
      {
        $group: {
          _id: "$coachId",
          totalJudgedDemos: { $sum: 1 },

          interested: {
            $sum: { $cond: [{ $eq: ["$status", "INTERESTED"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] },
          },
          dropped: {
            $sum: { $cond: [{ $eq: ["$status", "DROPPED"] }, 1, 0] },
          },
        },
      },

      // Compute meaningful rates
      {
        $project: {
          coachId: "$_id",
          totalJudgedDemos: 1,

          interestRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$interested", "$totalJudgedDemos"] },
            ],
          },

          // ✅ FIXED: conversion over total judged
          conversionRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$converted", "$totalJudgedDemos"] },
            ],
          },

          dropRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$dropped", "$totalJudgedDemos"] },
            ],
          },
        },
      },

      // Final coach score
      {
        $addFields: {
          coachScore: {
            $multiply: [
              {
                $add: [
                  { $multiply: ["$conversionRate", 0.6] }, // strongest signal
                  { $multiply: ["$interestRate", 0.3] }, // demo quality
                  { $multiply: ["$dropRate", -0.4] }, // penalty
                ],
              },
              100,
            ],
          },
        },
      },

      { $sort: { coachScore: -1 } },
    ];

    const data = await Demo.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error("Error in getCoachEffectiveness:", error);
    res
      .status(500)
      .json({
        message: "Failed to get coach effectiveness data",
        error: error.message,
      });
  }
};

/**
 * ADMIN: Early drop-off detector
 */
export const getEarlyDropOffRisks = async (req, res) => {
  try {
    const demos = await Demo.find({
      status: { $in: ["ATTENDED", "INTERESTED", "PAYMENT_PENDING"] },
    });

    const results = demos
      // ✅ ensure demo actually ended
      .filter(
        (demo) =>
          demo.scheduledEnd &&
          demo.updatedAt &&
          demo.updatedAt >= demo.scheduledEnd,
      )
      .map((demo) => {
        const risks = [];

        // Delayed follow-up
        const followUpMinutes =
          (demo.updatedAt - demo.scheduledEnd) / (1000 * 60);

        if (followUpMinutes > 120) {
          risks.push("Delayed admin follow-up");
        }

        // Outcome missing after attendance
        if (demo.status === "ATTENDED") {
          risks.push("Outcome not submitted yet");
        }

        // Payment stuck
        if (demo.status === "PAYMENT_PENDING" && followUpMinutes > 1440) {
          risks.push("Payment pending for too long");
        }

        // Odd demo timing
        const hour = new Date(demo.scheduledStart).getHours();
        if (hour < 6 || hour > 22) {
          risks.push("Odd demo timing");
        }

        let riskLevel = "LOW";
        if (risks.length >= 2) riskLevel = "HIGH";
        else if (risks.length === 1) riskLevel = "MEDIUM";

        return {
          demoId: demo._id,
          status: demo.status,
          riskLevel,
          riskReasons: risks,
        };
      });

    res.json(results);
  } catch (error) {
    console.error("Error in getEarlyDropOffRisks:", error);
    res
      .status(500)
      .json({ message: "Failed to get drop-off risks", error: error.message });
  }
};

/**
 * ADMIN: Demo audit timeline
 */
export const getDemoAuditTimeline = async (req, res) => {
  try {
    const { demoId } = req.params;

    const demo = await Demo.findById(demoId);
    if (!demo) {
      return res.status(404).json({ message: "Demo not found" });
    }

    const timeline = [];

    timeline.push({
      event: "Demo Booked",
      time: demo.createdAt,
    });

    if (demo.status !== "BOOKED") {
      timeline.push({
        event: "Demo Executed",
        time: demo.scheduledEnd,
      });
    }

    if (
      ["INTERESTED", "NOT_INTERESTED", "CONVERTED", "DROPPED"].includes(
        demo.status,
      )
    ) {
      timeline.push({
        event: "Outcome Submitted",
        time: demo.updatedAt,
      });
    }

    if (demo.status === "PAYMENT_PENDING") {
      timeline.push({
        event: "Payment Initiated",
        time: demo.updatedAt,
      });
    }

    if (demo.status === "CONVERTED") {
      timeline.push({
        event: "Converted to Student",
        time: demo.updatedAt,
      });
    }

    if (demo.status === "DROPPED") {
      timeline.push({
        event: "Demo Dropped",
        time: demo.updatedAt,
      });
    }

    res.json({
      demoId: demo._id,
      timeline,
    });
  } catch (error) {
    console.error("Error in getDemoAuditTimeline:", error);
    res
      .status(500)
      .json({ message: "Failed to get demo timeline", error: error.message });
  }
};

/**
 * ADMIN: Recommend best coach for a student
 * Uses the SAME judgement logic as getCoachEffectiveness
 */
export const recommendCoach = async (req, res) => {
  try {
    const { studentType, timezone } = req.query;

    /**
     * 1️⃣ Coach effectiveness (same logic as analytics)
     */
    const coachStats = await Demo.aggregate([
      {
        $match: {
          coachId: { $ne: null },
          status: {
            $in: [
              "INTERESTED",
              "NOT_INTERESTED",
              "PAYMENT_PENDING",
              "CONVERTED",
              "DROPPED",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$coachId",
          totalJudgedDemos: { $sum: 1 },
          interested: {
            $sum: { $cond: [{ $eq: ["$status", "INTERESTED"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] },
          },
          dropped: {
            $sum: { $cond: [{ $eq: ["$status", "DROPPED"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          coachId: "$_id",
          totalJudgedDemos: 1,
          interestRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$interested", "$totalJudgedDemos"] },
            ],
          },
          conversionRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$converted", "$totalJudgedDemos"] },
            ],
          },
          dropRate: {
            $cond: [
              { $eq: ["$totalJudgedDemos", 0] },
              0,
              { $divide: ["$dropped", "$totalJudgedDemos"] },
            ],
          },
        },
      },
      {
        $addFields: {
          effectivenessScore: {
            $multiply: [
              {
                $add: [
                  { $multiply: ["$conversionRate", 0.6] },
                  { $multiply: ["$interestRate", 0.3] },
                  { $multiply: ["$dropRate", -0.4] },
                ],
              },
              100,
            ],
          },
        },
      },
    ]);

    /**
     * 2️⃣ Coach workload
     */
    const coachLoad = await Student.aggregate([
      { $match: { assignedCoachId: { $ne: null } } },
      {
        $group: {
          _id: "$assignedCoachId",
          activeStudents: { $sum: 1 },
        },
      },
    ]);

    const loadMap = {};
    coachLoad.forEach((c) => {
      loadMap[c._id.toString()] = c.activeStudents;
    });

    /**
     * 3️⃣ Final recommendation scoring
     */
    const recommendations = coachStats.map((coach) => {
      let score = 0;
      const reasons = [];

      // Effectiveness (dominant signal)
      if (coach.effectivenessScore > 0) {
        score += coach.effectivenessScore * 0.7;
        reasons.push("Strong coach effectiveness");
      }

      // Student type fit (soft signal)
      if (studentType) {
        score += 10;
        reasons.push(`Experience with ${studentType} students`);
      }

      // Timezone compatibility (soft signal)
      if (timezone) {
        score += 10;
        reasons.push("Timezone compatible");
      }

      // Load penalty
      const load = loadMap[coach.coachId.toString()] || 0;
      if (load > 0) {
        score -= load * 2;
        reasons.push("Balanced workload");
      }

      return {
        coachId: coach.coachId,
        matchScore: Math.max(0, Math.round(score)),
        reasons,
      };
    });

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      studentType,
      timezone,
      recommendations: recommendations.slice(0, 3),
    });
  } catch (error) {
    console.error("Error in recommendCoach:", error);
    res
      .status(500)
      .json({ message: "Failed to recommend coach", error: error.message });
  }
};

/**
 * ADMIN: What-if funnel simulator
 */
export const simulateFunnel = async (req, res) => {
  try {
    const {
      improveFollowUp = false,
      followUpBoost = 0,
      coachEffectivenessBoost = 0,
    } = req.query;

    // 1. Get current funnel stats
    const stats = await Demo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [{ $eq: ["$status", "ATTENDED"] }, 1, 0],
            },
          },
          converted: {
            $sum: {
              $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const base = stats[0] || { total: 0, attended: 0, converted: 0 };

    const attendanceRate = base.total === 0 ? 0 : base.attended / base.total;

    const conversionRate =
      base.attended === 0 ? 0 : base.converted / base.attended;

    // 2. Simulate improvements
    let simulatedAttendance = attendanceRate;
    let simulatedConversion = conversionRate;
    const assumptions = [];

    if (improveFollowUp) {
      simulatedAttendance += followUpBoost;
      assumptions.push(`Admin follow-up improved by ${followUpBoost * 100}%`);
    }

    if (coachEffectivenessBoost > 0) {
      simulatedConversion += coachEffectivenessBoost;
      assumptions.push(
        `Coach effectiveness improved by ${coachEffectivenessBoost * 100}%`,
      );
    }

    // Cap values at 100%
    simulatedAttendance = Math.min(simulatedAttendance, 1);
    simulatedConversion = Math.min(simulatedConversion, 1);

    res.json({
      current: {
        attendanceRate: Number(attendanceRate.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
      },
      simulated: {
        attendanceRate: Number(simulatedAttendance.toFixed(2)),
        conversionRate: Number(simulatedConversion.toFixed(2)),
      },
      assumptions,
    });
  } catch (error) {
    console.error("Error in simulateFunnel:", error);
    res
      .status(500)
      .json({ message: "Failed to simulate funnel", error: error.message });
  }
};

/**
 * ADMIN: Intelligence capabilities overview
 * Explains all decision-support features in the system
 */
export const getIntelligenceOverview = async (req, res) => {
  try {
    res.json({
      description:
        "Operational Intelligence Layer built on top of ICA core workflow",
      features: [
        {
          id: 1,
          name: "Conversion Prediction Score",
          problemSolved: "Admins don’t know which demos to prioritize",
          whatItDoes:
            "Scores demos based on attendance, interest, coach history, student type, and follow-up speed",
          output: "Priority score (0–100) with risk level and reasons",
        },
        {
          id: 2,
          name: "Admin Follow-up SLA Tracker",
          problemSolved: "Delayed follow-ups reduce conversion",
          whatItDoes: "Measures time taken by admin to submit demo outcome",
          output:
            "Follow-up time with SLA status (Excellent / Warning / Breached)",
        },
        {
          id: 3,
          name: "Coach Effectiveness Index",
          problemSolved:
            "Raw conversion numbers don’t reflect true coaching performance",
          whatItDoes:
            "Calculates a balanced score using conversion, attendance, and no-shows",
          output: "Coach effectiveness score (0–100)",
        },
        {
          id: 4,
          name: "Early Drop-off Risk Detector",
          problemSolved: "Demos fail silently before payment",
          whatItDoes:
            "Flags demos likely to drop based on delayed follow-up, timing, and status",
          output: "Risk level with clear reasons",
        },
        {
          id: 5,
          name: "Demo Audit Timeline",
          problemSolved: "Admins can’t trace what happened in a demo",
          whatItDoes: "Builds a step-by-step timeline of demo lifecycle events",
          output: "Ordered audit trail with timestamps",
        },
        {
          id: 6,
          name: "Auto Coach Recommendation Engine",
          problemSolved: "Manual coach assignment is error-prone",
          whatItDoes:
            "Recommends best-fit coaches using effectiveness, compatibility, and workload",
          output: "Top coach recommendations with match score and reasons",
        },
        {
          id: 7,
          name: "What-if Funnel Simulator & Explainable Analytics",
          problemSolved: "Admins can’t predict impact of operational changes",
          whatItDoes:
            "Simulates funnel improvements and explains all analytics formulas",
          output: "Current vs simulated funnel metrics with assumptions",
        },
      ],
    });
  } catch (error) {
    console.error("Error in getIntelligenceOverview:", error);
    res
      .status(500)
      .json({
        message: "Failed to get intelligence overview",
        error: error.message,
      });
  }
};
