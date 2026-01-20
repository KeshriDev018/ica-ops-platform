import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import useAuthStore from "../../store/authStore";
import studentService from "../../services/studentService";
import batchService from "../../services/batchService";

const CoachStudents = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'individual', 'group'
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'batch'

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get students assigned to this coach
        const [coachStudents, coachBatches] = await Promise.all([
          studentService.getCoachStudents(),
          batchService.getMyBatches(),
        ]);

        console.log("Coach Students:", coachStudents); // Debug log
        setStudents(coachStudents);
        setBatches(coachBatches);
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredStudents =
    filter === "all"
      ? students
      : filter === "individual"
        ? students.filter((s) => s.studentType === "1-1")
        : students.filter((s) => s.studentType === "group");

  // Group students by batch
  const studentsByBatch = {};
  const unassignedStudents = [];

  filteredStudents.forEach((student) => {
    if (
      student.assignedBatchId &&
      typeof student.assignedBatchId === "object"
    ) {
      const batchId = student.assignedBatchId._id;
      if (!studentsByBatch[batchId]) {
        studentsByBatch[batchId] = {
          batch: student.assignedBatchId,
          students: [],
        };
      }
      studentsByBatch[batchId].students.push(student);
    } else {
      unassignedStudents.push(student);
    }
  });

  // Helper function to get batch name safely
  const getBatchName = (student) => {
    if (!student.assignedBatchId) return null;

    // If assignedBatchId is populated as an object
    if (
      typeof student.assignedBatchId === "object" &&
      student.assignedBatchId.name
    ) {
      return student.assignedBatchId.name;
    }

    // If assignedBatchId is just an ID string, find the batch from batches array
    if (typeof student.assignedBatchId === "string") {
      const batch = batches.find((b) => b._id === student.assignedBatchId);
      return batch ? batch.name : "Unknown Batch";
    }

    return "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Students
          </h1>
          <p className="text-gray-600">View all your assigned students</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("batch")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "batch"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Batch View
          </button>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilter("individual")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "individual"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            1-on-1 ({students.filter((s) => s.studentType === "1-1").length})
          </button>
          <button
            onClick={() => setFilter("group")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "group"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Group ({students.filter((s) => s.studentType === "group").length})
          </button>
        </div>
      </Card>

      {/* Students Display */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const batchName = getBatchName(student);
              return (
                <Card key={student._id} hover>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-navy">
                      {student.studentName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Age: {student.studentAge} years</p>
                    <p>Level: {student.level}</p>
                    <p className="capitalize">
                      Type: {student.studentType === "1-1" ? "1-on-1" : "Group"}
                    </p>
                    {student.studentType === "group" && batchName && (
                      <p className="text-navy font-medium">
                        Batch: {batchName}
                      </p>
                    )}
                    {student.studentType === "group" && !batchName && (
                      <p className="text-orange-600 font-medium">
                        No batch assigned
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full">
              <Card>
                <p className="text-gray-500 text-center py-8">
                  No students found.
                </p>
              </Card>
            </div>
          )}
        </div>
      ) : (
        // Batch View
        <div className="space-y-6">
          {Object.values(studentsByBatch).map(({ batch, students }) => (
            <Card key={batch._id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-navy">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {batch.level} • {students.length} students
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    batch.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : batch.status === "FULL"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {batch.status}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-navy">
                        {student.studentName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Age: {student.studentAge} years</p>
                      <p>Level: {student.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {unassignedStudents.length > 0 && (
            <Card>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-navy">
                  1-on-1 Students (No Batch)
                </h3>
                <p className="text-sm text-gray-600">
                  {unassignedStudents.length} students
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedStudents.map((student) => (
                  <div
                    key={student._id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-navy">
                        {student.studentName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Age: {student.studentAge} years</p>
                      <p>Level: {student.level}</p>
                      <p className="text-orange-600 font-medium">1-on-1</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {Object.keys(studentsByBatch).length === 0 &&
            unassignedStudents.length === 0 && (
              <Card>
                <p className="text-gray-500 text-center py-8">
                  No students found.
                </p>
              </Card>
            )}
        </div>
      )}
    </div>
  );
};

export default CoachStudents;
