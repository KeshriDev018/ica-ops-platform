import { Batch } from "../models/batch.model.js";
import { Student } from "../models/student.model.js";
/**
 * ADMIN: Create a new batch
 */
export const createBatch = async (req, res) => {
  const { name, coachId, level, timezone } = req.body;

  if (!name || !coachId || !level || !timezone) {
    return res.status(400).json({
      message: "name, coachId, level and timezone are required",
    });
  }

  const batch = await Batch.create({
    name,
    coachId,
    level,
    timezone,
  });

  res.status(201).json(batch);
};

/**
 * ADMIN: Get all batches
 */
export const getAllBatches = async (req, res) => {
  const batches = await Batch.find()
    .populate("coachId", "email")
    .populate("studentIds", "studentName studentAge status");

  res.json(batches);
};

/**
 * ADMIN: Get batch details
 */
export const getBatchById = async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findById(batchId)
    .populate("coachId", "email")
    .populate("studentIds", "studentName studentAge status");

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  res.json(batch);
};

/**
 * ADMIN: Add student to batch
 */
export const addStudentToBatch = async (req, res) => {
  const { batchId, studentId } = req.params;

  const batch = await Batch.findById(batchId);
  const student = await Student.findById(studentId);

  if (!batch || !student) {
    return res.status(404).json({
      message: "Batch or Student not found",
    });
  }

  // Only group students allowed
  if (student.studentType !== "group") {
    return res.status(400).json({
      message: "Only group students can be added to a batch",
    });
  }

  // Batch capacity check
  if (batch.studentIds.length >= batch.maxStudents) {
    return res.status(400).json({
      message: "Batch is already full",
    });
  }

  // Prevent duplicate add (ObjectId-safe)
  const alreadyExists = batch.studentIds.some(
    (id) => id.toString() === student._id.toString(),
  );

  if (alreadyExists) {
    return res.status(400).json({
      message: "Student already in this batch",
    });
  }

  // Add student to batch
  batch.studentIds.push(student._id);

  if (batch.studentIds.length >= batch.maxStudents) {
    batch.status = "FULL";
  }

  // Sync student with batch + coach
  student.assignedBatchId = batch._id;

  if (batch.coachId) {
    student.assignedCoachId = batch.coachId;
  }

  await Promise.all([batch.save(), student.save()]);

  const populatedBatch = await Batch.findById(batch._id)
    .populate("coachId", "name")
    .populate("studentIds", "studentName studentAge level");

  res.json({
    message: "Student added to batch successfully",
    batch: populatedBatch,
  });
};

/**
 * ADMIN: Remove student from batch
 */
export const removeStudentFromBatch = async (req, res) => {
  const { batchId, studentId } = req.params;

  const batch = await Batch.findById(batchId);
  const student = await Student.findById(studentId);

  if (!batch || !student) {
    return res.status(404).json({
      message: "Batch or Student not found",
    });
  }

  // Ensure student is actually part of this batch
  const isInBatch = batch.studentIds.some(
    (id) => id.toString() === student._id.toString(),
  );

  if (!isInBatch) {
    return res.status(400).json({
      message: "Student is not part of this batch",
    });
  }

  // Remove student from batch
  batch.studentIds.pull(student._id);

  // Update batch status only if it was FULL
  if (batch.status === "FULL") {
    batch.status = "ACTIVE";
  }

  // Clear student batch + coach mapping
  student.assignedBatchId = null;
  student.assignedCoachId = null;

  await Promise.all([batch.save(), student.save()]);

  const populatedBatch = await Batch.findById(batch._id)
    .populate("coachId", "name")
    .populate("studentIds", "studentName studentAge level");

  res.json({
    message: "Student removed from batch successfully",
    batch: populatedBatch,
  });
};

/**
 * ADMIN: Delete batch
 */
export const deleteBatch = async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findById(batchId);
  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  // Unassign students
  await Student.updateMany(
    { assignedBatchId: batch._id },
    { $set: { assignedBatchId: null } },
  );

  await batch.deleteOne();

  res.json({ message: "Batch deleted successfully" });
};

/**
 * COACH: Get batches assigned to logged-in coach
 */
export const getMyBatches = async (req, res) => {
  const coachId = req.user._id;

  const batches = await Batch.find({ coachId })
    .populate({
      path: "studentIds",
      select: "studentName studentAge level studentType status",
    })
    .select(
      "name level timezone status studentIds maxStudents createdAt updatedAt",
    );

  res.json(batches);
};
