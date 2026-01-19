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
     status: "BOOKED",
     meetingLink: null, // explicitly empty
   });

   res.status(201).json(demo);
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
