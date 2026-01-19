import { Demo } from "../models/demo.model.js";

/**
 * ADMIN: Funnel analytics
 */
export const getFunnelMetrics = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  const data = await Demo.aggregate(pipeline);

  res.json(data);
};


/**
 * ADMIN: Coach performance
 */
export const getCoachMetrics = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$coachId",

        // total demos assigned to coach
        demosAssigned: { $sum: 1 },

        // 🧩 Operational outcomes
        noShow: {
          $sum: {
            $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0],
          },
        },

        cancelled: {
          $sum: {
            $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0],
          },
        },

        rescheduled: {
          $sum: {
            $cond: [{ $eq: ["$status", "RESCHEDULED"] }, 1, 0],
          },
        },

        notInterested: {
          $sum: {
            $cond: [{ $eq: ["$status", "NOT_INTERESTED"] }, 1, 0],
          },
        },

        // 💰 Business outcomes
        paymentPending: {
          $sum: {
            $cond: [{ $eq: ["$status", "PAYMENT_PENDING"] }, 1, 0],
          },
        },

        converted: {
          $sum: {
            $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
          },
        },

        dropped: {
          $sum: {
            $cond: [{ $eq: ["$status", "DROPPED"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        coachId: "$_id",
        demosAssigned: 1,

        // operational
        noShow: 1,
        cancelled: 1,
        rescheduled: 1,
        notInterested: 1,

        // business
        paymentPending: 1,
        converted: 1,
        dropped: 1,

        // conversion based on total demos
        conversionRate: {
          $cond: [
            { $eq: ["$demosAssigned", 0] },
            0,
            { $divide: ["$converted", "$demosAssigned"] },
          ],
        },
      },
    },
  ];

  const data = await Demo.aggregate(pipeline);
  res.json(data);
};





/**
 * ADMIN: Admin efficiency metrics
 */
export const getAdminMetrics = async (req, res) => {
  const pipeline = [
    {
      $match: {
        status: {
          $in: ["INTERESTED", "NOT_INTERESTED", "CONVERTED", "DROPPED"],
        },
      },
    },
    {
      $project: {
        adminId: 1,
        followUpTime: {
          $divide: [
            {
              $max: [{ $subtract: ["$updatedAt", "$scheduledEnd"] }, 0],
            },
            60000, // milliseconds → minutes
          ],
        },
        isConverted: {
          $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0],
        },
        isDropped: {
          $cond: [{ $eq: ["$status", "DROPPED"] }, 1, 0],
        },
      },
    },
    {
      $group: {
        _id: "$adminId",
        demosHandled: { $sum: 1 },
        avgFollowUpTimeMinutes: { $avg: "$followUpTime" },
        conversionRate: { $avg: "$isConverted" },
        dropOffRate: { $avg: "$isDropped" },
      },
    },
  ];

  const data = await Demo.aggregate(pipeline);
  res.json(data);
};


/**
 * ADMIN: Funnel split by student type
 */
export const getFunnelByStudentType = async (req, res) => {
  const pipeline = [
    {
      $match: {
        recommendedStudentType: { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          studentType: "$recommendedStudentType",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ];

  const data = await Demo.aggregate(pipeline);
  res.json(data);
};
