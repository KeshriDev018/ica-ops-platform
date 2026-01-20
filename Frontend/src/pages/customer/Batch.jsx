import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import studentService from "../../services/studentService";

const CustomerBatch = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBatch = async () => {
      try {
        const myStudent = await studentService.getMyStudent();
        console.log("📦 Full Student Data:", myStudent);
        console.log(
          "🎯 Batch Data (assignedBatchId):",
          myStudent?.assignedBatchId,
        );
        console.log(
          "📋 Available batch keys:",
          myStudent?.assignedBatchId
            ? Object.keys(myStudent.assignedBatchId)
            : "No batch",
        );
        setStudent(myStudent);
      } catch (error) {
        console.error("Error loading batch info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBatch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!student?.assignedBatchId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            My Batch
          </h1>
          <p className="text-gray-600">View your batch information</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              Not in a Batch
            </h3>
            <p className="text-gray-600">
              {student?.studentType === "1-1"
                ? "You're enrolled in 1-on-1 coaching."
                : "You haven't been assigned to a batch yet."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const batch = student.assignedBatchId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Batch
        </h1>
        <p className="text-gray-600">
          Information about your group and classmates
        </p>
      </div>

      {/* Batch Info */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Batch Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Batch Name</p>
            <p className="font-semibold text-navy text-lg">{batch.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Level</p>
            <p className="font-semibold text-navy">{batch.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                batch.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {batch.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Created</p>
            <p className="font-semibold text-navy">
              {new Date(batch.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Coach Info */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Your Coach
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">
              {student.assignedCoachId?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-navy text-lg">
              {student.assignedCoachId?.email || "Not assigned"}
            </p>
            <p className="text-sm text-gray-600">Chess Coach</p>
          </div>
        </div>
      </Card>

      {/* Batch Features */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          What's Included
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Group Classes</h3>
              <p className="text-sm text-gray-600">
                Learn together with your batch mates
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">💬</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Batch Chat</h3>
              <p className="text-sm text-gray-600">
                Communicate with peers and coach
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Group Practice</h3>
              <p className="text-sm text-gray-600">
                Practice games and tournaments
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Level Progress</h3>
              <p className="text-sm text-gray-600">
                Track your improvement together
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerBatch;
