import { Demo } from "../models/demo.model.js";
import { Account } from "../models/account.model.js";

/**
 * PRE-DEMO
 * Create Account (CUSTOMER) + Demo
 */
export const createDemo = async (req, res) => {
  const {
    studentName,
    parentName,
    parentEmail,
    timezone,
    scheduledStart,
    scheduledEnd,
    country,
    studentAge,
  } = req.body;

  // find or create account
  let account = await Account.findOne({ email: parentEmail });
  if (!account) {
    account = await Account.create({
      email: parentEmail,
      role: "CUSTOMER",
    });
  }

  const demo = await Demo.create({
    studentName,
    parentName,
    parentEmail,
    accountId: account._id,
    timezone,
    scheduledStart,
    scheduledEnd,
    country,
    studentAge,
    status: "BOOKED",
    meetingLink: null, // explicitly empty
  });

  res.status(201).json(demo);
};

/**
 * Get all demos (ADMIN only)
 */
export const getAllDemos = async (req, res) => {
  try {
    const demos = await Demo.find()
      .populate({
        path: "coachId",
        select: "email",
        strictPopulate: false,
      })
      .populate({
        path: "adminId",
        select: "email",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    res.status(200).json(demos);
  } catch (error) {
    console.error("Get all demos error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to fetch demos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify demo by email (for demo login)
 */
export const verifyDemoByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find demo by parent email
    const demo = await Demo.findOne({
      parentEmail: email.toLowerCase(),
    }).sort({ createdAt: -1 }); // Get the most recent demo

    if (!demo) {
      return res.status(404).json({
        message:
          "No demo booking found for this email. Please book a demo first.",
      });
    }

    res.status(200).json(demo);
  } catch (error) {
    console.error("Verify demo error:", error);
    res.status(500).json({
      message: "Failed to verify demo",
    });
  }
};

export const scheduleDemo = async (req, res) => {
  try {
    const { id } = req.params;
    const { coachId, meetingLink } = req.body;

    // 1️⃣ Validate input
    if (!coachId || !meetingLink) {
      return res.status(400).json({
        message: "coachId and meetingLink are required",
      });
    }

    // 2️⃣ Fetch demo
    const demo = await Demo.findById(id);

    if (!demo) {
      return res.status(404).json({
        message: "Demo not found",
      });
    }

    // 3️⃣ Ensure demo is in BOOKED state
    if (demo.status !== "BOOKED") {
      return res.status(400).json({
        message: "Only BOOKED demos can be scheduled",
      });
    }

    // 4️⃣ Assign admin, coach, meeting link
    demo.coachId = coachId;
    demo.adminId = req.user._id; // logged-in admin
    demo.meetingLink = meetingLink;

    await demo.save();

    // 5️⃣ Return updated demo
    res.json({
      message: "Demo scheduled successfully",
      demo,
    });
  } catch (error) {
    console.error("Schedule demo error:", error);
    res.status(500).json({
      message: "Failed to schedule demo",
    });
  }
};

export const markDemoAttendance = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["ATTENDED", "NO_SHOW", "RESCHEDULED", "CANCELLED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  const demo = await Demo.findById(id);
  if (!demo || demo.status !== "BOOKED") {
    return res.status(400).json({ message: "Invalid demo state" });
  }

  demo.status = status;
  await demo.save();

  res.json(demo);
};

export const submitDemoOutcome = async (req, res) => {
  const { id } = req.params;
  const { status, recommendedStudentType, recommendedLevel, adminNotes } =
    req.body;

  if (!["INTERESTED", "NOT_INTERESTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid outcome" });
  }

  const demo = await Demo.findById(id);
  if (!demo || demo.status !== "ATTENDED") {
    return res.status(400).json({
      message: "Outcome allowed only after attendance",
    });
  }

  demo.status = status;
  demo.recommendedStudentType = recommendedStudentType;
  demo.recommendedLevel = recommendedLevel;
  demo.adminNotes = adminNotes;

  // If NOT interested → dropped immediately
  if (status === "NOT_INTERESTED") {
    demo.status = "DROPPED";
  }

  await demo.save();
  res.json(demo);
};


/**
 * COACH
 * Get all demos assigned to logged-in coach
 */
export const getCoachDemos = async (req, res) => {
  try {
    const coachId = req.user._id;

     const demos = await Demo.find({
       coachId,
       status: "BOOKED", // ✅ only booked demos
     }).sort({ scheduledStart: 1 });

    res.json(demos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coach demos" });
  }
};

/**
 * COACH
 * Mark demo attendance (coach only)
 * NOTE: Does NOT change demo.status
 */
export const coachMarkAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;

    if (!["ATTENDED", "ABSENT"].includes(attendance)) {
      return res.status(400).json({
        message: "Attendance must be ATTENDED or ABSENT",
      });
    }

    // 1️⃣ Fetch demo FIRST
    const demo = await Demo.findOne({
      _id: id,
      coachId: req.user._id,
    });

    if (!demo) {
      return res.status(404).json({
        message: "Demo not found or not assigned to this coach",
      });
    }

    // 2️⃣ Prevent re-marking attendance
    if (demo.coachAttendance !== "NOT_MARKED") {
      return res.status(400).json({
        message: "Attendance already marked",
      });
    }

    // 3️⃣ Update attendance (no status sync)
    demo.coachAttendance = attendance;

    await demo.save();

    res.status(200).json({
      message: "Attendance marked successfully",
      demo,
    });
  } catch (error) {
    console.error("Coach attendance error:", error);
    res.status(500).json({
      message: "Failed to mark attendance",
    });
  }
};



/**
 * CUSTOMER (Demo user)
 * Mark demo interest without login
 */
export const markStudentInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { interest } = req.body;

    if (!["INTERESTED", "NOT_INTERESTED"].includes(interest)) {
      return res.status(400).json({
        message: "Invalid interest value",
      });
    }

    const demo = await Demo.findById(id);

    if (!demo) {
      return res.status(404).json({
        message: "Demo not found",
      });
    }

    demo.studentInterest = interest;
    await demo.save();

    res.status(200).json({
      message: "Interest updated successfully",
      demo,
    });
  } catch (error) {
    console.error("Mark interest error:", error);
    res.status(500).json({
      message: "Failed to update interest",
    });
  }
};

/**
 * CUSTOMER (Demo user)
 * Update student preferences (class type & level)
 */
export const updateDemoPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredClassType, studentLevel } = req.body;

    // Validate inputs
    if (preferredClassType && !["1-1", "GROUP"].includes(preferredClassType)) {
      return res.status(400).json({
        message: "Invalid preferred class type. Must be '1-1' or 'GROUP'",
      });
    }

    if (studentLevel && !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(studentLevel)) {
      return res.status(400).json({
        message: "Invalid student level. Must be 'BEGINNER', 'INTERMEDIATE', or 'ADVANCED'",
      });
    }

    const demo = await Demo.findById(id);

    if (!demo) {
      return res.status(404).json({
        message: "Demo not found",
      });
    }

    // Update fields if provided
    if (preferredClassType) {
      demo.preferredClassType = preferredClassType;
    }
    if (studentLevel) {
      demo.studentLevel = studentLevel;
    }

    await demo.save();

    res.status(200).json({
      message: "Preferences updated successfully",
      demo,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      message: "Failed to update preferences",
    });
  }
};

/**
 * PUBLIC
 * Get demo by parent email (for demo access page)
 */
export const getDemoByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const demo = await Demo.findOne({ 
      parentEmail: email.toLowerCase() 
    })
    .populate({
      path: "coachId",
      select: "email",
      strictPopulate: false,
    })
    .sort({ createdAt: -1 }); // Get most recent demo

    if (!demo) {
      return res.status(404).json({
        message: "Demo not found for this email",
      });
    }

    res.status(200).json(demo);
  } catch (error) {
    console.error("Get demo by email error:", error);
    res.status(500).json({
      message: "Failed to fetch demo",
    });
  }
};

