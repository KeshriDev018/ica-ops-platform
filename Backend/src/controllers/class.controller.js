import { Student } from "../models/student.model.js";
import { ClassSession } from "../models/class.model.js";
import { Batch } from "../models/batch.model.js";
import { isValidTimezone } from "../utils/constants.js";

/**
 * ================================
 * COACH: CREATE CLASS
 * Batch OR One-to-One
 * ================================
 */
export const createClass = async (req, res) => {
  try {
    const coachId = req.user._id;

    const {
      title,
      batchId,
      studentId,
      weekdays,
      startTime,
      durationMinutes,
      coachTimezone,
      meetLink,
    } = req.body;

    console.log("Create class request:", {
      title,
      batchId,
      studentId,
      weekdays,
      startTime,
      durationMinutes,
      coachTimezone,
      meetLink,
    });

    // Basic validation
    if (
      !title ||
      !weekdays ||
      !startTime ||
      !durationMinutes ||
      !coachTimezone ||
      !meetLink
    ) {
      return res.status(400).json({
        message:
          "Missing required fields (title, weekdays, startTime, durationMinutes, coachTimezone, meetLink)",
      });
    }

    // Validate timezone
    if (!isValidTimezone(coachTimezone)) {
      return res.status(400).json({
        message:
          "Invalid timezone. Please select a valid timezone from the list.",
      });
    }

    // Validate weekdays is an array
    if (!Array.isArray(weekdays) || weekdays.length === 0) {
      return res.status(400).json({
        message: "Weekdays must be a non-empty array",
      });
    }

    // Must assign to batch OR student
    if (!batchId && !studentId) {
      return res.status(400).json({
        message: "Provide either batchId or studentId",
      });
    }

    if (batchId && studentId) {
      return res.status(400).json({
        message: "Cannot assign both batch and student",
      });
    }

    const session = await ClassSession.create({
      title,
      coach: coachId,
      batch: batchId || null,
      student: studentId || null,
      weekdays,
      startTime,
      durationMinutes,
      coachTimezone,
      meetLink,
    });

    res.status(201).json({
      message: "Class scheduled successfully",
      classId: session._id,
    });
  } catch (error) {
    console.error("Create class error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * COACH: Get all my classes
 * ================================
 */
export const getCoachClasses = async (req, res) => {
  try {
    const coachId = req.user._id;

    const classes = await ClassSession.find({
      coach: coachId,
      isActive: true,
    })
      .populate("student", "studentName")
      .populate("batch", "name level")
      .sort({ createdAt: -1 });

    // Transform to match frontend expectations
    const transformedClasses = classes.map((cls) => {
      // Calculate end time
      const [hours, minutes] = cls.startTime.split(":");
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + cls.durationMinutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

      return {
        _id: cls._id,
        title: cls.title,
        coachId: cls.coach,
        batchId: cls.batch,
        studentId: cls.student,
        weekdays: cls.weekdays,
        startTime: cls.startTime,
        endTime: endTime,
        duration: cls.durationMinutes,
        coachTimezone: cls.coachTimezone,
        meetLink: cls.meetLink,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
      };
    });

    res.json(transformedClasses);
  } catch (error) {
    console.error("Get coach classes error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * STUDENT: Get my classes
 * ================================
 */
export const getStudentClasses = async (req, res) => {
  try {
    const accountId = req.user._id;

    console.log("=== GET STUDENT CLASSES ===");
    console.log("1. AccountId from token:", accountId);

    // Find student - remove status check to be more flexible
    const student = await Student.findOne({
      accountId,
    });

    console.log(
      "2. Found student:",
      student ? `Yes (ID: ${student._id})` : "No",
    );

    if (!student) {
      console.log("ERROR: No student found for accountId:", accountId);
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    console.log("3. Student details:");
    console.log("   - Student _id:", student._id);
    console.log("   - Student name:", student.studentName);
    console.log("   - Assigned batch:", student.assignedBatchId);

    // Build query
    const orConditions = [{ student: student._id }];

    if (student.assignedBatchId) {
      orConditions.push({ batch: student.assignedBatchId });
    }

    const query = {
      isActive: true,
      $or: orConditions,
    };

    console.log("4. Query being executed:");
    console.log(JSON.stringify(query, null, 2));

    const classes = await ClassSession.find(query)
      .populate("coach", "email")
      .populate("batch", "name level")
      .populate("student", "studentName");

    console.log("5. Classes found:", classes.length);

    if (classes.length > 0) {
      console.log("6. Class details:");
      classes.forEach((cls, idx) => {
        console.log(`   Class ${idx + 1}:`, {
          _id: cls._id,
          title: cls.title,
          studentId: cls.student?._id,
          batchId: cls.batch?._id,
        });
      });
    }

    // Transform to match frontend expectations
    const transformedClasses = classes.map((cls) => {
      // Calculate end time
      const [hours, minutes] = cls.startTime.split(":");
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + cls.durationMinutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

      return {
        _id: cls._id,
        title: cls.title,
        coachId: cls.coach,
        batchId: cls.batch,
        studentId: cls.student,
        weekdays: cls.weekdays,
        startTime: cls.startTime,
        endTime: endTime,
        duration: cls.durationMinutes,
        coachTimezone: cls.coachTimezone,
        meetLink: cls.meetLink,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
      };
    });

    console.log(
      "7. Returning",
      transformedClasses.length,
      "transformed classes",
    );
    console.log("=== END GET STUDENT CLASSES ===\n");

    res.json(transformedClasses);
  } catch (error) {
    console.error("Get student classes error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ================================
 * COACH: Deactivate class
 * ================================
 */
export const deactivateClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const session = await ClassSession.findById(classId);

    if (!session) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (session.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: "Class deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * COACH: Upload class material
 */
export const uploadClassMaterial = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, fileType, linkUrl } = req.body;

    const allowedTypes = ["PDF", "IMAGE", "VIDEO", "DOC", "LINK"];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        message: "Invalid fileType",
      });
    }

    // For LINK type, linkUrl is required; for others, file is required
    if (fileType === "LINK") {
      if (!linkUrl) {
        return res.status(400).json({
          message: "Link URL is required for LINK type",
        });
      }
    } else {
      if (!req.file) {
        return res.status(400).json({
          message: "File is required",
        });
      }
    }

    const classSession = await ClassSession.findById(classId);

    if (!classSession) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ensure coach owns the class
    if (classSession.coach.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const materialData = {
      title,
      description,
      fileType,
      uploadedBy: req.user._id,
    };

    // For LINK type, use the provided URL; for file uploads, use Cloudinary data
    if (fileType === "LINK") {
      materialData.fileUrl = linkUrl;
      materialData.filePublicId = `link-${Date.now()}`; // dummy ID for links
    } else {
      // Cloudinary returns secure_url and public_id (not path/filename)
      materialData.fileUrl = req.file.secure_url || req.file.path;
      materialData.filePublicId = req.file.public_id || req.file.filename;
    }

    classSession.materials.push(materialData);

    await classSession.save();

    res.status(201).json({
      message: "Material uploaded successfully",
    });
  } catch (error) {
    console.error("Upload class material error:", error);
    console.error("Error stack:", error.stack);
    console.error("Request file:", req.file);
    console.error("Request body:", req.body);

    // Return specific error messages
    let errorMessage = "Failed to upload material";
    let statusCode = 500;

    if (error.message?.includes("Invalid file type")) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes("File too large")) {
      errorMessage = "File size exceeds 50MB limit";
      statusCode = 400;
    } else if (error.name === "ValidationError") {
      errorMessage = "Validation error: " + error.message;
      statusCode = 400;
    } else if (!req.file && req.body.fileType !== "LINK") {
      errorMessage =
        "File upload failed. Please try again or check file format.";
      statusCode = 400;
    }

    res.status(statusCode).json({
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * COACH: Get all class materials for their classes
 */
export const getCoachClassMaterials = async (req, res) => {
  try {
    const coachId = req.user._id;

    const classes = await ClassSession.find({ coach: coachId, isActive: true })
      .populate("batch", "name level")
      .populate("student", "studentName parentName")
      .select("title materials batch student weekdays startTime")
      .sort({ createdAt: -1 });

    // Flatten materials with class context
    const materialsWithContext = [];
    classes.forEach((classSession) => {
      classSession.materials.forEach((material) => {
        if (material.isVisible) {
          materialsWithContext.push({
            _id: material._id,
            classId: classSession._id,
            className: classSession.title,
            classType: classSession.batch ? "Batch" : "1-on-1",
            batchName: classSession.batch?.name || null,
            studentName: classSession.student?.studentName || null,
            title: material.title,
            description: material.description,
            fileUrl: material.fileUrl,
            fileType: material.fileType,
            uploadedAt: material.uploadedAt,
          });
        }
      });
    });

    res.json(materialsWithContext);
  } catch (error) {
    console.error("Get coach class materials error:", error);
    res.status(500).json({
      message: "Failed to fetch class materials",
    });
  }
};

/**
 * CUSTOMER: Get all class materials for their enrolled classes
 */
export const getStudentClassMaterials = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("=== GET STUDENT MATERIALS ===");
    console.log("1. User ID:", userId);

    // Find student record for this customer account
    const student = await Student.findOne({ accountId: userId });

    if (!student) {
      console.log("ERROR: Student profile not found for accountId:", userId);
      return res.status(404).json({ message: "Student profile not found" });
    }

    console.log("2. Student found:", {
      _id: student._id,
      name: student.studentName,
      assignedBatchId: student.assignedBatchId,
    });

    // Build query conditions - include both 1-on-1 classes and batch classes
    const queryConditions = [
      { student: student._id }, // 1-on-1 classes
    ];

    // Add batch classes if student is in a batch
    if (student.assignedBatchId) {
      queryConditions.push({ batch: student.assignedBatchId });
    }

    console.log(
      "3. Query conditions:",
      JSON.stringify(queryConditions, null, 2),
    );

    // Find all classes where this student is enrolled (either via batch or direct)
    const classes = await ClassSession.find({
      $or: queryConditions,
      isActive: true,
    })
      .populate("coach", "email")
      .populate("batch", "name level")
      .select("title materials coach batch weekdays startTime meetLink")
      .sort({ createdAt: -1 });

    console.log("4. Classes found:", classes.length);

    // Flatten materials with class context
    const materialsWithContext = [];
    classes.forEach((classSession) => {
      console.log(`5. Processing class: ${classSession.title}`, {
        classId: classSession._id,
        materialsCount: classSession.materials?.length || 0,
        hasBatch: !!classSession.batch,
        hasStudent: !!classSession.student,
      });

      classSession.materials.forEach((material) => {
        if (material.isVisible) {
          materialsWithContext.push({
            _id: material._id,
            classId: classSession._id,
            className: classSession.title,
            classType: classSession.batch ? "Batch" : "1-on-1",
            batchName: classSession.batch?.name || null,
            coachEmail: classSession.coach?.email || "Unknown",
            title: material.title,
            description: material.description,
            fileUrl: material.fileUrl,
            fileType: material.fileType,
            uploadedAt: material.uploadedAt,
            meetLink: classSession.meetLink,
            schedule: `${classSession.weekdays.join(", ")} at ${classSession.startTime}`,
          });
        }
      });
    });

    console.log("6. Total materials found:", materialsWithContext.length);
    console.log("=== END GET STUDENT MATERIALS ===\n");

    res.json(materialsWithContext);
  } catch (error) {
    console.error("Get student class materials error:", error);
    res.status(500).json({
      message: "Failed to fetch class materials",
    });
  }
};
