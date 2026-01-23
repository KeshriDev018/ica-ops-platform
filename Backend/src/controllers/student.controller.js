import { Student } from "../models/student.model.js";
import { isValidTimezone } from "../utils/constants.js";

/**
 * CUSTOMER: View own student profile
 */
export const getMyStudent = async (req, res) => {
  const accountId = req.user._id;

  const student = await Student.findOne({ accountId })
    .populate("assignedCoachId", "email role")
    .populate(
      "assignedBatchId",
      "name level timezone status maxStudents createdAt studentIds",
    )
    .populate("accountId", "email role");

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
};

/**
 * COACH: View assigned students only
 */
export const getCoachStudents = async (req, res) => {
  const coachId = req.user._id;

  const students = await Student.find({ assignedCoachId: coachId })
    .populate("assignedCoachId", "email role")
    .populate("assignedBatchId", "name level timezone status maxStudents")
    .populate("accountId", "email role")
    .select("-parentEmail");

  res.json(students);
};

/**
 * ADMIN: View all students
 */
export const getAllStudents = async (req, res) => {
  const students = await Student.find()
    .populate("assignedCoachId", "email role")
    .populate("assignedBatchId", "name level timezone status maxStudents")
    .populate("accountId", "email role");

  res.json(students);
};

/**
 * ADMIN: Pause / Cancel student
 */
export const updateStudentStatus = async (req, res) => {
  const { studentId } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "PAUSED", "CANCELLED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const student = await Student.findByIdAndUpdate(
    studentId,
    { status },
    { new: true },
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
};

/**
 * ADMIN: Reassign coach or batch
 */ export const reassignStudent = async (req, res) => {
  const { studentId } = req.params;
  const { assignedCoachId, assignedBatchId } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Coach reassignment
  if (assignedCoachId) {
    student.assignedCoachId = assignedCoachId;
  }

  // Batch reassignment
  if (assignedBatchId !== undefined) {
    if (student.studentType !== "group") {
      return res.status(400).json({
        message: "Only group students can be assigned to a batch",
      });
    }

    const batch = await Batch.findById(assignedBatchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Coach must match
    if (student.assignedCoachId.toString() !== batch.coachId.toString()) {
      return res.status(400).json({
        message: "Batch coach does not match student's coach",
      });
    }

    // Capacity check
    if (batch.studentIds.length >= batch.maxStudents) {
      return res.status(400).json({
        message: "Batch is already full",
      });
    }

    // Remove from old batch (if any)
    if (student.assignedBatchId) {
      await Batch.updateOne(
        { _id: student.assignedBatchId },
        { $pull: { studentIds: student._id } },
      );
    }

    // Add to new batch
    batch.studentIds.push(student._id);

    if (batch.studentIds.length >= batch.maxStudents) {
      batch.status = "FULL";
    }

    await batch.save();

    student.assignedBatchId = batch._id;
  }

  await student.save();

  res.json(student);
};

/**
 * CUSTOMER: Update own timezone
 */
export const updateMyTimezone = async (req, res) => {
  try {
    const accountId = req.user._id;
    const { timezone } = req.body;
    
    // Validation
    if (!timezone) {
      return res.status(400).json({ message: "Timezone is required" });
    }
    
    if (!isValidTimezone(timezone)) {
      return res.status(400).json({ 
        message: "Invalid timezone. Please select a valid timezone from the list." 
      });
    }
    
    // Update student timezone
    const student = await Student.findOneAndUpdate(
      { accountId },
      { timezone },
      { new: true }
    )
      .populate("assignedCoachId", "email role")
      .populate("assignedBatchId", "name level timezone status maxStudents")
      .populate("accountId", "email role");
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json({
      message: "Timezone updated successfully. Class times will now be displayed in your new timezone.",
      student
    });
  } catch (error) {
    console.error("Update student timezone error:", error);
    res.status(500).json({ message: error.message });
  }
};
