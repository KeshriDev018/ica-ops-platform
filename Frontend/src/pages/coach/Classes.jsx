import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useAuthStore from "../../store/authStore";
import classService from "../../services/classService";
import batchService from "../../services/batchService";
import studentService from "../../services/studentService";
import coachService from "../../services/coachService";
import { getTimezoneAbbreviation } from "../../utils/timezoneConstants";

const CoachClasses = () => {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [coachProfile, setCoachProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    batchId: "",
    studentId: "",
    weekdays: [],
    startTime: "",
    durationMinutes: 60,
    meetLink: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coachClasses, coachBatches, coachStudents, myProfile] = await Promise.all([
        classService.getMyClasses(),
        batchService.getMyBatches(),
        studentService.getCoachStudents(),
        coachService.getMyProfile(),
      ]);
      setClasses(coachClasses);
      setBatches(coachBatches);
      setStudents(coachStudents);
      setCoachProfile(myProfile);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClass = (classItem) => {
    setSelectedClass(classItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const openCreateModal = () => {
    setFormData({
      title: "",
      batchId: "",
      studentId: "",
      weekdays: [],
      startTime: "",
      durationMinutes: 60,
      meetLink: "",
    });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      title: "",
      batchId: "",
      studentId: "",
      weekdays: [],
      startTime: "",
      durationMinutes: 60,
      meetLink: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If selecting batchId, clear studentId
    if (name === "batchId" && value) {
      setFormData((prev) => ({
        ...prev,
        batchId: value,
        studentId: "",
      }));
    }
    // If selecting studentId, clear batchId
    else if (name === "studentId" && value) {
      setFormData((prev) => ({
        ...prev,
        studentId: value,
        batchId: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleWeekdayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!coachProfile?.timezone) {
      alert("Please set your timezone in your profile before creating classes.");
      return;
    }

    if (!formData.batchId && !formData.studentId) {
      alert("Please select either a batch or a student");
      return;
    }

    if (formData.weekdays.length === 0) {
      alert("Please select at least one weekday");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        batchId: formData.batchId || undefined,
        studentId: formData.studentId || undefined,
        weekdays: formData.weekdays,
        startTime: formData.startTime,
        durationMinutes: parseInt(formData.durationMinutes),
        coachTimezone: coachProfile.timezone,
        meetLink: formData.meetLink,
      };

      console.log("Creating class with payload:", payload);

      await classService.create(payload);
      alert("Class created successfully!");
      closeCreateModal();
      loadData();
    } catch (error) {
      console.error("Error creating class:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create class");
    }
  };

  const handleDeactivate = async (classId) => {
    if (!confirm("Are you sure you want to deactivate this class?")) return;

    try {
      await classService.deactivate(classId);
      loadData();
      if (selectedClass?._id === classId) {
        closeModal();
      }
    } catch (error) {
      console.error("Error deactivating class:", error);
      alert("Failed to deactivate class");
    }
  };

  const weekdayOptions = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weekdayLabels = {
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
    SUN: "Sunday",
  };

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
            Classes
          </h1>
          <p className="text-gray-600">
            Manage your class schedules and sessions
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          Create New Class
        </Button>
      </div>

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card
              key={classItem._id}
              hover
              onClick={() => handleViewClass(classItem)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-navy">
                  {classItem.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classItem.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {classItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {classItem.batch ? "Group Batch" : "1-on-1"}
                </p>
                {classItem.batch && (
                  <p>
                    <span className="font-medium">Batch:</span>{" "}
                    {classItem.batch.name}
                  </p>
                )}
                {classItem.student && (
                  <p>
                    <span className="font-medium">Student:</span>{" "}
                    {classItem.student.studentName}
                  </p>
                )}
                <p>
                  <span className="font-medium">Time:</span>{" "}
                  {classItem.startTime} ({classItem.durationMinutes} min)
                  {classItem.coachTimezone && (
                    <span className="ml-2 text-xs font-semibold text-blue-600">
                      {getTimezoneAbbreviation(classItem.coachTimezone)}
                    </span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Days:</span>{" "}
                  {classItem.weekdays.join(", ")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg mb-4">
              No classes scheduled yet
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Create your first class to get started
            </p>
            <Button variant="primary" onClick={openCreateModal}>
              Create New Class
            </Button>
          </div>
        </Card>
      )}

      {/* Class Details Modal */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-secondary font-bold text-navy">
                  {selectedClass.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Class Details</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Class ID</p>
                  <p className="font-medium text-navy text-sm break-all">
                    {selectedClass._id}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedClass.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedClass.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-medium text-navy">
                    {selectedClass.batch ? "Group Batch" : "1-on-1 Session"}
                  </p>
                </div>
                {selectedClass.batch && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Batch</p>
                    <p className="font-medium text-navy">
                      {selectedClass.batch.name} ({selectedClass.batch.level})
                    </p>
                  </div>
                )}
                {selectedClass.student && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Student</p>
                    <p className="font-medium text-navy">
                      {selectedClass.student.studentName}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Start Time</p>
                  <p className="font-medium text-navy">
                    {selectedClass.startTime}
                    {selectedClass.coachTimezone && (
                      <span className="ml-2 text-sm text-blue-600 font-semibold">
                        {getTimezoneAbbreviation(selectedClass.coachTimezone)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-navy">
                    {selectedClass.durationMinutes} minutes
                  </p>
                </div>
              </div>

              {selectedClass.coachTimezone && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Timezone:</span> {selectedClass.coachTimezone}
                    <span className="ml-2 text-xs text-blue-600">({getTimezoneAbbreviation(selectedClass.coachTimezone)})</span>
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Students will see this class time converted to their local timezone.
                  </p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Weekdays</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.weekdays.map((day) => (
                    <span
                      key={day}
                      className="px-3 py-1 bg-navy text-white rounded-full text-sm"
                    >
                      {weekdayLabels[day]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Meeting Link</p>
                <a
                  href={selectedClass.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {selectedClass.meetLink}
                </a>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-between">
              <Button
                variant="danger"
                onClick={() => handleDeactivate(selectedClass._id)}
                disabled={!selectedClass.isActive}
              >
                Deactivate Class
              </Button>
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-secondary font-bold text-navy">
                  Create New Class
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule a new class session
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="e.g., Advanced Tactics"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  📚 Class Type Selection
                </p>
                <p className="text-sm text-blue-700">
                  Choose either a <strong>batch</strong> for group classes or a{" "}
                  <strong>student</strong> for 1-on-1 sessions (not both)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch (for Group Classes)
                  </label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    disabled={!!formData.studentId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select a batch --</option>
                    {Array.isArray(batches) &&
                      batches
                        .filter((batch) => batch.status === "ACTIVE")
                        .map((batch) => (
                          <option key={batch._id} value={batch._id}>
                            {batch.name} • {batch.level} • {batch.timezone}
                          </option>
                        ))}
                  </select>
                  {Array.isArray(batches) &&
                    batches.filter((b) => b.status === "ACTIVE").length ===
                      0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        No active batches available
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student (for 1-on-1 Sessions)
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    disabled={!!formData.batchId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select a student --</option>
                    {Array.isArray(students) &&
                      students
                        .filter(
                          (student) =>
                            student.status === "ACTIVE" &&
                            student.studentType === "1-1",
                        )
                        .map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.studentName} • {student.studentAge}y •{" "}
                            {student.level}
                          </option>
                        ))}
                  </select>
                  {Array.isArray(students) &&
                    students.filter(
                      (s) => s.status === "ACTIVE" && s.studentType === "1-1",
                    ).length === 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        No active 1-on-1 students available
                      </p>
                    )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📍 Classes will be created in your timezone:{" "}
                  <strong>{coachProfile?.timezone || "Not set"}</strong>
                  <br />
                  <span className="text-xs">
                    To change your timezone, update it in your profile settings.
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekdays *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {weekdayOptions.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWeekdayToggle(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.weekdays.includes(day)
                          ? "bg-navy text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    required
                    min="15"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meetLink"
                  value={formData.meetLink}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeCreateModal}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Class
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachClasses;
