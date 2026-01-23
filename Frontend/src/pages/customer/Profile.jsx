import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import studentService from "../../services/studentService";
import { TIMEZONE_OPTIONS } from "../../utils/timezoneConstants";

const CustomerProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [showTimezoneConfirm, setShowTimezoneConfirm] = useState(false);
  const [savingTimezone, setSavingTimezone] = useState(false);

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

  const handleEditTimezone = () => {
    setSelectedTimezone(student.timezone);
    setIsEditingTimezone(true);
  };

  const handleCancelTimezone = () => {
    setIsEditingTimezone(false);
    setSelectedTimezone("");
  };

  const handleTimezoneChange = (e) => {
    setSelectedTimezone(e.target.value);
  };

  const handleSaveTimezone = () => {
    if (selectedTimezone !== student.timezone) {
      setShowTimezoneConfirm(true);
    } else {
      setIsEditingTimezone(false);
    }
  };

  const confirmTimezoneChange = async () => {
    try {
      setSavingTimezone(true);
      await studentService.updateMyTimezone(selectedTimezone);
      setStudent({ ...student, timezone: selectedTimezone });
      setShowTimezoneConfirm(false);
      setIsEditingTimezone(false);
      alert("Timezone updated successfully! Your class schedule times will now display in your new timezone.");
    } catch (error) {
      console.error("Error updating timezone:", error);
      alert(error.response?.data?.message || "Failed to update timezone");
    } finally {
      setSavingTimezone(false);
    }
  };

  const cancelTimezoneChange = () => {
    setShowTimezoneConfirm(false);
  };

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
            {isEditingTimezone ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedTimezone}
                  onChange={handleTimezoneChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSaveTimezone}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancelTimezone}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-lg text-navy font-semibold">{student.timezone}</p>
                <Button
                  onClick={handleEditTimezone}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark font-medium shadow-sm"
                >
                  ✏️ Edit Timezone
                </Button>
              </div>
            )}
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

      {/* Timezone Change Confirmation Modal */}
      {showTimezoneConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-secondary font-bold text-navy mb-4">
              Confirm Timezone Change
            </h3>
            <p className="text-gray-600 mb-4">
              Changing your timezone will affect how class times are displayed
              in your schedule and calendar. Your coach's classes will remain at
              the same time, but they will be shown in your new timezone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Current:</strong> {student.timezone}
                <br />
                <strong>New:</strong> {selectedTimezone}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={cancelTimezoneChange}
                disabled={savingTimezone}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmTimezoneChange}
                disabled={savingTimezone}
                className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark disabled:opacity-50"
              >
                {savingTimezone ? "Saving..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
