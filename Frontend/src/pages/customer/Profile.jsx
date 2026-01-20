import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import studentService from "../../services/studentService";

const CustomerProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const myStudent = await studentService.getMyStudent();
        console.log("📋 Student profile loaded:", myStudent);
        setStudent(myStudent);
      } catch (error) {
        console.error("Error loading profile:", error);
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

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Profile
          </h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No student profile found.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Profile
        </h1>
        <p className="text-gray-600">
          View and manage your student profile information
        </p>
      </div>

      {/* Student Information */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Student Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Student Name
            </label>
            <p className="text-lg font-semibold text-navy">
              {student.studentName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Age
            </label>
            <p className="text-lg font-semibold text-navy">
              {student.studentAge} years
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Level
            </label>
            <p className="text-lg font-semibold text-navy">{student.level}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Program Type
            </label>
            <p className="text-lg font-semibold text-navy capitalize">
              {student.studentType === "1-1"
                ? "1-on-1 Coaching"
                : "Group Coaching"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Current Rating
            </label>
            <p className="text-lg font-semibold text-navy">
              {student.rating || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Status
            </label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                student.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : student.status === "PAUSED"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Parent Information */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Parent Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Parent Name
            </label>
            <p className="text-lg font-semibold text-navy">
              {student.parentName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Parent Email
            </label>
            <p className="text-lg text-navy">{student.parentEmail}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Timezone
            </label>
            <p className="text-lg text-navy">{student.timezone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Country
            </label>
            <p className="text-lg text-navy">{student.country}</p>
          </div>
        </div>
      </Card>

      {/* Chess Accounts */}
      {student.chessUsernames && student.chessUsernames.length > 0 && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Chess Accounts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {student.chessUsernames.map((username, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Chess Username
                </label>
                <p className="text-lg font-semibold text-navy">{username}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coach Assignment */}
      {student.assignedCoachId && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Assigned Coach
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">
                {student.assignedCoachId.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-navy">
                {student.assignedCoachId.email}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {student.assignedCoachId.role}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Batch Assignment */}
      {student.assignedBatchId && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Assigned Batch
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Batch Name
              </label>
              <p className="text-lg font-semibold text-navy">
                {student.assignedBatchId.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Level
              </label>
              <p className="text-lg font-semibold text-navy">
                {student.assignedBatchId.level}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  student.assignedBatchId.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : student.assignedBatchId.status === "FULL"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {student.assignedBatchId.status}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerProfile;
