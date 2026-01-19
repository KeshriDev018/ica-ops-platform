import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import studentService from "../../services/studentService";
import demoService from "../../services/demoService";
import subscriptionService from "../../services/subscriptionService";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalDemos: 0,
    conversionRate: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState({
    revenueData: [],
    studentGrowth: [],
    demoStatus: [],
    planDistribution: [],
    levelDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate dummy data immediately
    const totalStudents = 45;
    const totalDemos = 68;
    const convertedDemos = 32;
    const conversionRate = (convertedDemos / totalDemos) * 100;

    // Generate revenue data (last 6 months)
    const revenueData = [
      { month: "Aug", revenue: 125000 },
      { month: "Sep", revenue: 138000 },
      { month: "Oct", revenue: 152000 },
      { month: "Nov", revenue: 168000 },
      { month: "Dec", revenue: 185000 },
      { month: "Jan", revenue: 205000 },
    ];

    // Student growth (last 6 months)
    const studentGrowth = [
      { month: "Aug", students: 18 },
      { month: "Sep", students: 23 },
      { month: "Oct", students: 29 },
      { month: "Nov", students: 35 },
      { month: "Dec", students: 40 },
      { month: "Jan", students: 45 },
    ];

    // Demo status distribution
    const demoStatusData = [
      { name: "Booked", value: 15, color: "#3B82F6" },
      { name: "Attended", value: 22, color: "#10B981" },
      { name: "Converted", value: 18, color: "#F59E0B" },
      { name: "Cancelled", value: 8, color: "#EF4444" },
      { name: "Interested", value: 5, color: "#8B5CF6" },
    ];

    // Plan distribution
    const planDistribution = [
      { name: "1-on-1 Coaching", value: 28, color: "#FC8A24" },
      { name: "Group Coaching", value: 17, color: "#6B8E23" },
    ];

    // Level distribution
    const levelDistribution = [
      { name: "Beginner", value: 20 },
      { name: "Intermediate", value: 18 },
      { name: "Advanced", value: 7 },
    ];

    const totalRevenue = 185000;

    setAnalytics({
      totalStudents: totalStudents,
      totalDemos: totalDemos,
      conversionRate: Math.round(conversionRate),
      totalRevenue: totalRevenue,
    });

    setChartData({
      revenueData,
      studentGrowth,
      demoStatus: demoStatusData,
      planDistribution,
      levelDistribution,
    });

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const COLORS = ["#FC8A24", "#6B8E23", "#003366", "#EF4444"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Analytics
        </h1>
        <p className="text-gray-600">
          View academy performance metrics and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-navy text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">
            Total Students
          </div>
          <div className="text-4xl font-bold">{analytics.totalStudents}</div>
        </Card>
        <Card className="bg-orange text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Total Demos</div>
          <div className="text-4xl font-bold">{analytics.totalDemos}</div>
        </Card>
        <Card className="bg-olive text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">
            Conversion Rate
          </div>
          <div className="text-4xl font-bold">{analytics.conversionRate}%</div>
        </Card>
        <Card className="bg-cream border-2 border-navy">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Total Revenue
          </div>
          <div className="text-4xl font-bold text-navy">
            {formatCurrency(analytics.totalRevenue)}
          </div>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Monthly Revenue Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
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

      {/* Student Growth & Demo Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Student Growth
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#003366" name="Total Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Demo Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.demoStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.demoStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Plan Distribution & Level Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Subscription Plan Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            Student Level Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.levelDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6B8E23" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
