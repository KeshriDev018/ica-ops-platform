import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import api from "../../lib/api";

const Demos = () => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/demos/coach/my-demos");
      setDemos(res.data);
    } catch (err) {
      setError("Failed to fetch demos");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (demoId, attendance) => {
    setAttendanceLoading((prev) => ({ ...prev, [demoId]: true }));
    try {
      await api.patch(`/demos/${demoId}/coach-attendance`, { attendance });
      fetchDemos();
    } catch (err) {
      alert("Failed to mark attendance");
    } finally {
      setAttendanceLoading((prev) => ({ ...prev, [demoId]: false }));
    }
  };

  if (loading) return <div>Loading demos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Scheduled Demos</h2>
      {demos.length === 0 ? (
        <div>No demos scheduled.</div>
      ) : (
        <div className="grid gap-4">
          {demos.map((demo) => (
            <Card
              key={demo._id}
              className="p-4 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold text-lg">{demo.studentName}</div>
                <div className="text-sm text-gray-600">{demo.parentEmail}</div>
                <div className="text-sm">
                  Date: {new Date(demo.scheduledStart).toLocaleString()}
                </div>
                <div className="text-sm">
                  Meeting Link:{" "}
                  {demo.meetingLink ? (
                    <a
                      href={demo.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Join
                    </a>
                  ) : (
                    "Not set"
                  )}
                </div>
                <div className="text-sm">
                  Attendance: {demo.coachAttendance || "NOT_MARKED"}
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    attendanceLoading[demo._id] ||
                    demo.coachAttendance !== "NOT_MARKED"
                  }
                  onClick={() => markAttendance(demo._id, "ATTENDED")}
                >
                  Mark Attended
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    attendanceLoading[demo._id] ||
                    demo.coachAttendance !== "NOT_MARKED"
                  }
                  onClick={() => markAttendance(demo._id, "ABSENT")}
                >
                  Mark Absent
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Demos;
