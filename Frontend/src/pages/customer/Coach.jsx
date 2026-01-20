import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import studentService from "../../services/studentService";

const CustomerCoach = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoach = async () => {
      try {
        const myStudent = await studentService.getMyStudent();
        setStudent(myStudent);
      } catch (error) {
        console.error("Error loading coach info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoach();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!student?.assignedCoachId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            My Coach
          </h1>
          <p className="text-gray-600">View your coach information</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              Coach Not Assigned
            </h3>
            <p className="text-gray-600">
              A coach will be assigned to you shortly.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const coach = student.assignedCoachId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Coach
        </h1>
        <p className="text-gray-600">
          Information about your personal chess coach
        </p>
      </div>

      {/* Coach Profile */}
      <Card>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">
              {coach.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-secondary font-bold text-navy mb-1">
              {coach.email}
            </h2>
            <p className="text-gray-600">Your Chess Coach</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active Coach
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Your Learning Journey */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Your Learning Journey
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Your Level</p>
            <p className="font-semibold text-navy text-lg">{student.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Learning Type</p>
            <p className="font-semibold text-navy">
              {student.studentType === "1-1"
                ? "1-on-1 Coaching"
                : "Group Coaching"}
            </p>
          </div>
          {student.assignedBatchId && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Batch</p>
              <p className="font-semibold text-navy">
                {student.assignedBatchId.name}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                student.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>
      </Card>

      {/* What Your Coach Provides */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          What Your Coach Provides
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="text-3xl">📚</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">
                Personalized Lessons
              </h3>
              <p className="text-sm text-gray-600">
                Tailored chess lessons designed specifically for your skill
                level and learning pace
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">
                Strategy Development
              </h3>
              <p className="text-sm text-gray-600">
                Learn opening theory, middle game tactics, and endgame
                techniques
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">
                Performance Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Detailed analysis of your games and continuous progress tracking
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">Direct Support</h3>
              <p className="text-sm text-gray-600">
                Ask questions and get feedback through direct chat communication
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="font-semibold text-navy mb-1">
                Tournament Preparation
              </h3>
              <p className="text-sm text-gray-600">
                Get ready for competitions with focused training and mental
                preparation
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Coach */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Get in Touch
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700 mb-3">
            Have questions or need help? You can reach out to your coach
            through:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span className="text-gray-700">
                <span className="font-medium">Chat:</span> Use the Batch Chat or
                direct messaging
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📧</span>
              <span className="text-gray-700">
                <span className="font-medium">Email:</span> {coach.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-gray-700">
                <span className="font-medium">Schedule:</span> Check your
                calendar for class times
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerCoach;
