import { Student } from "../models/student.model.js";

/**
 * CUSTOMER: View own student profile
 */
export const getMyStudent = async (req, res) => {
  const accountId = req.user._id;

  const student = await Student.findOne({ accountId })
    .populate("assignedCoachId", "role")
    .populate("assignedBatchId");

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

  const students = await Student.find({ assignedCoachId: coachId }).select(
    "-parentEmail"
  );

  res.json(students);
};

/**
 * ADMIN: View all students
 */
export const getAllStudents = async (req, res) => {
  const students = await Student.find()
    .populate("assignedCoachId", "role")
    .populate("assignedBatchId");

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
    { new: true }
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
};

/**
 * ADMIN: Reassign coach or batch
 */
export const reassignStudent = async (req, res) => {
  const { studentId } = req.params;
  const { assignedCoachId, assignedBatchId } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (assignedCoachId) student.assignedCoachId = assignedCoachId;
  if (assignedBatchId !== undefined)
    student.assignedBatchId = assignedBatchId;

  await student.save();
  res.json(student);
};
