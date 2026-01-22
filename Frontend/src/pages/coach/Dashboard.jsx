import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAuthStore from "../../store/authStore";
import batchService from "../../services/batchService";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import { format, isToday, isFuture, parse } from "date-fns";
import { getTimezoneAbbreviation } from "../../utils/timezoneConstants";

const CoachDashboard = () => {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeBatches: 0,
    groupBatches: 0,
    oneOnOneBatches: 0,
    classesToday: 0,
    nextClassTime: null,
  });
  const [chartData, setChartData] = useState({
    studentProgress: [],
    weeklySchedule: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get coach's batches, students, and classes from backend
        const [coachBatches, coachStudents, coachClasses] = await Promise.all([
          batchService.getMyBatches(),
          studentService.getCoachStudents(),
          classService.getMyClasses(),
        ]);

        setBatches(coachBatches);
        setStudents(coachStudents);

        // Calculate total students - count all students assigned to this coach
        const totalStudents = coachStudents.length;

        // Filter today's classes
        const todayClasses = coachClasses.filter((classItem) => {
          // Convert backend weekday strings to day numbers
          const dayMap = {
            SUN: 0,
            MON: 1,
            TUE: 2,
            WED: 3,
            THU: 4,
            FRI: 5,
            SAT: 6,
          };

          const today = new Date();
          const todayDayNumber = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

          // Check if any of the class weekdays match today
          return classItem.weekdays.some(
            (day) => dayMap[day] === todayDayNumber,
          );
        });

        setTodayClasses(todayClasses);

        // Calculate metrics
        const activeBatches = coachBatches.filter((b) => b.status === "ACTIVE");

        // Find next class time
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const upcomingTodayClasses = todayClasses
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

        const nextClass = upcomingTodayClasses[0];
        const nextClassTime = nextClass ? nextClass.startTime : null;
        const nextClassTimezone = nextClass ? getTimezoneAbbreviation(nextClass.coachTimezone) : null;

        setMetrics({
          totalStudents,
          activeBatches: activeBatches.length,
          groupBatches: activeBatches.length, // All batches are group batches
          oneOnOneBatches: coachClasses.filter((c) => c.student).length, // Classes with individual students
          classesToday: todayClasses.length,
          nextClassTime,
          nextClassTimezone,
        });

        // Dummy chart data
        const studentProgress = [
          { name: "Student 1", rating: 1200, sessions: 15 },
          { name: "Student 2", rating: 1100, sessions: 12 },
          { name: "Student 3", rating: 1050, sessions: 18 },
          { name: "Student 4", rating: 950, sessions: 10 },
          { name: "Student 5", rating: 900, sessions: 14 },
        ];

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklySchedule = days.map((day) => ({
          day,
          scheduled: Math.floor(Math.random() * 4) + 2,
          completed: Math.floor(Math.random() * 3) + 1,
        }));

        setChartData({
          studentProgress,
          weeklySchedule,
        });
      } catch (error) {
        console.error("Error loading coach dashboard:", error);
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
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Coach Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's your coaching overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👥</span>
            <div className="text-sm font-medium text-gray-600">
              Total Students
            </div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.totalStudents}
          </div>
          <div className="text-sm text-gray-600">Across batches</div>
        </Card>

        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📚</span>
            <div className="text-sm font-medium text-gray-600">
              Active Batches
            </div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.activeBatches}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.groupBatches} group, {metrics.oneOnOneBatches} 1-on-1
          </div>
        </Card>

        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📅</span>
            <div className="text-sm font-medium text-gray-600">
              Classes Today
            </div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.classesToday}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.nextClassTime
              ? `Next at ${metrics.nextClassTime}${metrics.nextClassTimezone ? ` ${metrics.nextClassTimezone}` : ""}`
              : "No upcoming classes"}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Student Progress
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.studentProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="rating"
                fill="#FC8A24"
                name="Rating"
              />
              <Bar
                yAxisId="right"
                dataKey="sessions"
                fill="#003366"
                name="Sessions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Weekly Schedule Utilization
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.weeklySchedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="scheduled"
                stroke="#003366"
                strokeWidth={2}
                name="Scheduled"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#6B8E23"
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">
            Today's Classes
          </h2>
          <Link to="/coach/calendar">
            <button className="text-sm text-orange hover:underline">
              View Calendar
            </button>
          </Link>
        </div>
        {todayClasses.length > 0 ? (
          <div className="space-y-3">
            {todayClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-navy mb-1">
                    {classItem.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {classItem.startTime} ({classItem.durationMinutes} min)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {classItem.batch
                      ? `Batch: ${classItem.batch.name}`
                      : `1-on-1 with ${classItem.student?.studentName || "Student"}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      classItem.student
                        ? "bg-orange/20 text-orange"
                        : "bg-olive/20 text-olive"
                    }`}
                  >
                    {classItem.student ? "1-on-1" : "Group"}
                  </span>
                  {classItem.meetLink && (
                    <a
                      href={classItem.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No classes scheduled for today.
          </p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/coach/batches">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-navy mb-2">Manage Batches</h3>
              <p className="text-sm text-gray-600">
                View and manage your batches
              </p>
            </Card>
          </Link>
          <Link to="/coach/students">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-navy mb-2">View Students</h3>
              <p className="text-sm text-gray-600">
                See all your assigned students
              </p>
            </Card>
          </Link>
          <Link to="/coach/calendar">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">Calendar</h3>
              <p className="text-sm text-gray-600">View your full schedule</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CoachDashboard;
