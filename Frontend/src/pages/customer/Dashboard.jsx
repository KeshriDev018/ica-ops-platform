import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAuthStore from "../../store/authStore";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import { format } from "date-fns";

const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const [student, setStudent] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [metrics, setMetrics] = useState({
    level: "",
    studentType: "",
    status: "",
    coachName: "",
    batchName: "",
    nextClassDate: null,
    nextClassTime: null,
    totalClasses: 0,
  });
  const [chartData, setChartData] = useState({
    ratingProgression: [
      { month: "Aug", rating: 980 },
      { month: "Sep", rating: 1020 },
      { month: "Oct", rating: 1050 },
      { month: "Nov", rating: 1100 },
      { month: "Dec", rating: 1150 },
      { month: "Jan", rating: 1200 },
    ],
    monthlyClasses: [
      { month: "Aug", attended: 6, scheduled: 8 },
      { month: "Sep", attended: 7, scheduled: 8 },
      { month: "Oct", attended: 8, scheduled: 8 },
      { month: "Nov", attended: 7, scheduled: 8 },
      { month: "Dec", attended: 8, scheduled: 9 },
      { month: "Jan", attended: 6, scheduled: 8 },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get student profile
        const myStudent = await studentService.getMyStudent();
        setStudent(myStudent);

        // Get student's classes
        const myClasses = await classService.getMyStudentClasses();

        // Find next class
        const now = new Date();
        const dayMap = {
          SUN: 0,
          MON: 1,
          TUE: 2,
          WED: 3,
          THU: 4,
          FRI: 5,
          SAT: 6,
        };

        const todayDayNumber = now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Filter today's classes
        const todayClasses = myClasses.filter((classItem) =>
          classItem.weekdays.some((day) => dayMap[day] === todayDayNumber),
        );

        // Find upcoming class today
        const upcomingToday = todayClasses
          .filter((classItem) => {
            const [hours, minutes] = classItem.startTime.split(":");
            const classMinutes = parseInt(hours) * 60 + parseInt(minutes);
            return classMinutes > currentMinutes;
          })
          .sort((a, b) => {
            const [aHours, aMinutes] = a.startTime.split(":");
            const [bHours, bMinutes] = b.startTime.split(":");
            const aTime = parseInt(aHours) * 60 + parseInt(aMinutes);
            const bTime = parseInt(bHours) * 60 + parseInt(bMinutes);
            return aTime - bTime;
          });

        const nextClass = upcomingToday[0];

        setMetrics({
          level: myStudent.level || "Beginner",
          studentType: myStudent.studentType === "1-1" ? "1-on-1" : "Group",
          status: myStudent.status || "ACTIVE",
          coachName: myStudent.assignedCoachId?.email || "Not assigned",
          batchName: myStudent.assignedBatchId?.name || "Not assigned",
          nextClassDate: nextClass ? "Today" : "No classes today",
          nextClassTime: nextClass?.startTime || null,
          totalClasses: myClasses.length,
        });

        // Set first 5 upcoming classes
        setUpcomingClasses(myClasses.slice(0, 5));
      } catch (error) {
        console.error("Error loading student dashboard:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your chess journey.
          </p>
        </div>
      </div>

      {/* Demo Account Welcome Banner */}
      {user?.demo_info && user?.linked_from_demo && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🎉</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-secondary font-bold text-blue-900 mb-2">
                Welcome to Your Full Account!
              </h3>
              <div className="space-y-2 text-blue-800">
                <p className="font-medium">
                  Your demo account has been successfully upgraded. Here's your
                  information:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student Name:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.student_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent Name:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.parent_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.parent_email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Language:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.preferred_language}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demo Scheduled:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.scheduled_start
                        ? format(
                            new Date(user.demo_info.scheduled_start),
                            "MMMM d, yyyy • h:mm a",
                          )
                        : "Pending"}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-3">
                  Your coach will be assigned shortly. Start exploring your
                  dashboard and learning materials!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⭐</span>
            <div className="text-sm font-medium text-gray-600">Level</div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.level}
          </div>
          <div className="text-sm text-gray-600">Current chess level</div>
        </Card>

        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👥</span>
            <div className="text-sm font-medium text-gray-600">Type</div>
          </div>
          <div className="text-3xl font-bold text-navy mb-2">
            {metrics.studentType}
          </div>
          <div className="text-sm text-gray-600">Learning mode</div>
        </Card>

        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📚</span>
            <div className="text-sm font-medium text-gray-600">
              Total Classes
            </div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.totalClasses}
          </div>
          <div className="text-sm text-gray-600">Scheduled sessions</div>
        </Card>

        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📅</span>
            <div className="text-sm font-medium text-gray-600">Next Class</div>
          </div>
          <div className="text-3xl font-bold text-navy mb-2">
            {metrics.nextClassDate}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.nextClassTime || "Not scheduled"}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Rating Progression
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.ratingProgression}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#FC8A24"
                strokeWidth={2}
                name="Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Monthly Class Attendance
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.monthlyClasses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scheduled" fill="#003366" name="Scheduled" />
              <Bar dataKey="attended" fill="#6B8E23" name="Attended" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Student Info */}
      {student && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Student Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="font-semibold text-navy">{student.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="font-semibold text-navy">
                {student.studentAge} years
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Level</p>
              <p className="font-semibold text-navy">{student.level}</p>
            </div>
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
            <div>
              <p className="text-sm text-gray-600 mb-1">Coach</p>
              <p className="font-semibold text-navy">{metrics.coachName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Batch</p>
              <p className="font-semibold text-navy">{metrics.batchName}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Classes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">
            My Classes
          </h2>
          <Link to="/customer/classes">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {upcomingClasses.length > 0 ? (
          <div className="space-y-3">
            {upcomingClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-navy mb-1">
                    {classItem.batchId
                      ? classItem.batchId.name
                      : "1-on-1 Class"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {classItem.weekdays.join(", ")} • {classItem.startTime} -{" "}
                    {classItem.endTime}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coach: {classItem.coachId?.email || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No classes scheduled.
          </p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/customer/schedule">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">View Schedule</h3>
              <p className="text-sm text-gray-600">
                Check your upcoming classes
              </p>
            </Card>
          </Link>
          <Link to="/customer/batch-chat">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-navy mb-2">Batch Chat</h3>
              <p className="text-sm text-gray-600">
                Chat with your coach and batch
              </p>
            </Card>
          </Link>
          <Link to="/customer/payments">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-navy mb-2">Payments</h3>
              <p className="text-sm text-gray-600">
                View subscription and payments
              </p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
