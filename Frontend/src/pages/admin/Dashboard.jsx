import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
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
import analyticsService from "../../services/analyticsService";
import studentService from "../../services/studentService";
import demoService from "../../services/demoService";
import coachService from "../../services/coachService";
import batchService from "../../services/batchService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCoaches: 0,
    totalBatches: 0,
    totalDemos: 0,
    activeStudents: 0,
    activeCoaches: 0,
    activeBatches: 0,
    activeDemos: 0,
  });
  const [recentDemos, setRecentDemos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy chart data
  const revenueData = [
    { day: "Mon", revenue: 25000 },
    { day: "Tue", revenue: 32000 },
    { day: "Wed", revenue: 28000 },
    { day: "Thu", revenue: 38000 },
    { day: "Fri", revenue: 42000 },
    { day: "Sat", revenue: 48000 },
    { day: "Sun", revenue: 35000 },
  ];

  const conversionData = [
    { month: "Aug", booked: 12, converted: 5 },
    { month: "Sep", booked: 15, converted: 8 },
    { month: "Oct", booked: 18, converted: 10 },
    { month: "Nov", booked: 14, converted: 9 },
    { month: "Dec", booked: 20, converted: 12 },
    { month: "Jan", booked: 16, converted: 11 },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [students, demos, coaches, batches] = await Promise.all([
          studentService.getAll(),
          demoService.getAll(),
          coachService.getAll(),
          batchService.getAll(),
        ]);

        const activeStudents = students.filter(
          (s) => s.status === "ACTIVE",
        ).length;
        const activeCoaches = coaches.filter(
          (c) => c.status === "ACTIVE",
        ).length;
        const activeBatches = batches.filter(
          (b) => b.status === "ACTIVE",
        ).length;
        const activeDemos = demos.filter(
          (d) =>
            d.status === "BOOKED" ||
            d.status === "ATTENDED" ||
            d.status === "PAYMENT_PENDING",
        ).length;

        setStats({
          totalStudents: students.length,
          totalCoaches: coaches.length,
          totalBatches: batches.length,
          totalDemos: demos.length,
          activeStudents,
          activeCoaches,
          activeBatches,
          activeDemos,
        });

        setRecentDemos(demos.slice(0, 5));
      } catch (error) {
        console.error("Error loading admin dashboard:", error);
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

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of academy operations and metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📊</span>
            <div className="text-sm font-medium text-gray-600">
              Total Students
            </div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {stats.totalStudents}
          </div>
          <div className="text-sm text-gray-600">
            {stats.activeStudents} active
          </div>
        </Card>

        <Card className="bg-white border-2 border-orange transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👨‍🏫</span>
            <div className="text-sm font-medium text-gray-600">
              Total Coaches
            </div>
          </div>
          <div className="text-4xl font-bold text-orange mb-2">
            {stats.totalCoaches}
          </div>
          <div className="text-sm text-gray-600">
            {stats.activeCoaches} active
          </div>
        </Card>

        <Card className="bg-white border-2 border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📚</span>
            <div className="text-sm font-medium text-gray-600">
              Total Batches
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-500 mb-2">
            {stats.totalBatches}
          </div>
          <div className="text-sm text-gray-600">
            {stats.activeBatches} active
          </div>
        </Card>

        <Card className="bg-white border-2 border-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <div className="text-sm font-medium text-gray-600">Total Demos</div>
          </div>
          <div className="text-4xl font-bold text-green-500 mb-2">
            {stats.totalDemos}
          </div>
          <div className="text-sm text-gray-600">
            {stats.activeDemos} active
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Weekly Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FC8A24"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Demo Conversion Trends
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booked" fill="#003366" name="Booked" />
              <Bar dataKey="converted" fill="#10B981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Demos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">
            Recent Demos
          </h2>
          <Link to="/admin/demos">
            <button className="text-sm text-orange hover:underline">
              View All
            </button>
          </Link>
        </div>
        {recentDemos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Parent
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDemos.map((demo) => (
                  <tr
                    key={demo._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {demo.studentName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {demo.parentName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(demo.scheduledStart).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          demo.status === "BOOKED"
                            ? "bg-blue-100 text-blue-800"
                            : demo.status === "ATTENDED"
                              ? "bg-green-100 text-green-800"
                              : demo.status === "PAYMENT_PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {demo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/demos`}
                        className="text-sm text-orange hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No demos found.</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/admin/students">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-navy mb-2">Students</h3>
              <p className="text-sm text-gray-600">Manage students</p>
            </Card>
          </Link>
          <Link to="/admin/demos">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">Demos</h3>
              <p className="text-sm text-gray-600">Manage demos</p>
            </Card>
          </Link>
          <Link to="/admin/coaches">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-navy mb-2">Coaches</h3>
              <p className="text-sm text-gray-600">Manage coaches</p>
            </Card>
          </Link>
          <Link to="/admin/analytics">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-semibold text-navy mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
