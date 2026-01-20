import { useEffect, useState } from "react";
import { Trash2, Users, Clock, User, Plus, X } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import batchService from "../../services/batchService";
import coachService from "../../services/coachService";
import studentService from "../../services/studentService";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    coachId: "",
    level: "",
    timezone: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Attempting to load batches...");
      const [allBatches, allCoaches] = await Promise.all([
        batchService.getAll(),
        coachService.getAll(),
      ]);
      console.log("Batches loaded:", allBatches);
      console.log("Batches count:", allBatches?.length);
      console.log("Coaches loaded:", allCoaches);
      setBatches(allBatches || []);
      setCoaches(allCoaches || []);
    } catch (error) {
      console.error("Error loading data:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      alert(
        "Failed to load batches: " +
          (error.response?.data?.message || error.message),
      );
      setBatches([]);
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = "Batch name is required";
    if (!formData.coachId) errors.coachId = "Coach is required";
    if (!formData.level.trim()) errors.level = "Level is required";
    if (!formData.timezone.trim()) errors.timezone = "Timezone is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreating(true);
    try {
      await batchService.create(formData);
      loadData();
      setIsCreateModalOpen(false);
      setFormData({ name: "", coachId: "", level: "", timezone: "" });
    } catch (error) {
      console.error("Error creating batch:", error);
      setFormErrors({ submit: error.response?.data?.message || error.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (batch) => {
    setDeleteConfirm(batch);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await batchService.delete(deleteConfirm._id);
      loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert(
        "Failed to delete batch: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setLoadingStudents(true);
    try {
      // Get all students and filter for unassigned group students
      const allStudents = await studentService.getAll();
      console.log("All students:", allStudents);
      console.log("Sample student:", allStudents[0]);

      const unassigned = allStudents.filter((s) => {
        console.log(
          `Student ${s.studentName}: type=${s.studentType}, batchId=${s.assignedBatchId}`,
        );
        return (
          s.studentType === "group" &&
          (!s.assignedBatchId || s.assignedBatchId === null)
        );
      });
      console.log("Unassigned group students:", unassigned);
      setUnassignedStudents(unassigned);
    } catch (error) {
      console.error("Error loading students:", error);
      alert("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    if (!selectedBatch) return;

    try {
      const result = await batchService.addStudent(
        selectedBatch._id,
        studentId,
      );
      console.log("Add student result:", result);

      // Reload all data first
      await loadData();

      // Get the updated batch from backend
      const updatedBatch = await batchService.getById(selectedBatch._id);
      setSelectedBatch(updatedBatch);

      // Reload unassigned students list
      const allStudents = await studentService.getAll();
      const unassigned = allStudents.filter(
        (s) =>
          s.studentType === "group" &&
          (!s.assignedBatchId || s.assignedBatchId === null),
      );
      setUnassignedStudents(unassigned);

      alert("Student added to batch successfully");
    } catch (error) {
      console.error("Error adding student:", error);
      console.error("Error details:", error.response?.data);
      alert(error.response?.data?.message || "Failed to add student to batch");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedBatch) return;

    if (
      !confirm("Are you sure you want to remove this student from the batch?")
    ) {
      return;
    }

    try {
      const result = await batchService.removeStudent(
        selectedBatch._id,
        studentId,
      );
      console.log("Remove student result:", result);

      // Reload all data first
      await loadData();

      // Get the updated batch from backend
      const updatedBatch = await batchService.getById(selectedBatch._id);
      setSelectedBatch(updatedBatch);

      // Reload unassigned students list
      const allStudents = await studentService.getAll();
      const unassigned = allStudents.filter(
        (s) =>
          s.studentType === "group" &&
          (!s.assignedBatchId || s.assignedBatchId === null),
      );
      setUnassignedStudents(unassigned);

      alert("Student removed from batch successfully");
    } catch (error) {
      console.error("Error removing student:", error);
      console.error("Error details:", error.response?.data);
      alert(
        error.response?.data?.message || "Failed to remove student from batch",
      );
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      FULL: "bg-yellow-100 text-yellow-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Create New Batch
            </h2>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formErrors.submit}
                </div>
              )}

              <FormInput
                label="Batch Name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Beginner Batch 1"
                error={formErrors.name}
                required
              />

              <FormSelect
                label="Assign Coach"
                name="coachId"
                value={formData.coachId}
                onChange={(e) =>
                  setFormData({ ...formData, coachId: e.target.value })
                }
                options={coaches.map((coach) => ({
                  value: coach._id,
                  label: coach.name || coach.email,
                }))}
                placeholder="Select a coach"
                error={formErrors.coachId}
                required
              />

              <FormInput
                label="Level"
                name="level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                placeholder="e.g., Beginner, Intermediate, Advanced"
                error={formErrors.level}
                required
              />

              <FormInput
                label="Timezone"
                name="timezone"
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                placeholder="e.g., America/New_York, Asia/Kolkata"
                error={formErrors.timezone}
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormData({
                      name: "",
                      coachId: "",
                      level: "",
                      timezone: "",
                    });
                    setFormErrors({});
                  }}
                  disabled={creating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? "Creating..." : "Create Batch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-navy text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedBatch.name}</h2>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Batch Info */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Coach</p>
                  <p className="font-semibold text-navy">
                    {selectedBatch.coachId?.name || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Level</p>
                  <p className="font-semibold text-navy">
                    {selectedBatch.level}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Timezone</p>
                  <p className="font-semibold text-navy">
                    {selectedBatch.timezone}
                  </p>
                </div>
              </div>

              {/* Current Students */}
              <div>
                <h3 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
                  <Users size={20} />
                  Current Students ({selectedBatch.studentIds?.length || 0}/
                  {selectedBatch.maxStudents || 5})
                </h3>

                {selectedBatch.studentIds &&
                selectedBatch.studentIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBatch.studentIds.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-semibold">
                            {student.studentName?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-navy">
                              {student.studentName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.studentAge} years • {student.level}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from batch"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      No students in this batch yet
                    </p>
                  </div>
                )}
              </div>

              {/* Unassigned Students */}
              <div>
                <h3 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
                  <Plus size={20} />
                  Add Students to Batch
                </h3>

                {loadingStudents ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Loading available students...
                    </p>
                  </div>
                ) : unassignedStudents.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {student.studentName?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-navy">
                              {student.studentName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.studentAge} years • {student.level} •
                              Unassigned
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student._id)}
                          disabled={
                            selectedBatch.studentIds?.length >=
                            selectedBatch.maxStudents
                          }
                          className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                          title={
                            selectedBatch.studentIds?.length >=
                            selectedBatch.maxStudents
                              ? "Batch is full"
                              : "Add to batch"
                          }
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No unassigned group students available
                    </p>
                  </div>
                )}
              </div>

              {selectedBatch.studentIds?.length >=
                selectedBatch.maxStudents && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ This batch is full. Remove a student before adding new
                    ones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-navy text-center mb-2">
                Delete Batch?
              </h2>
              <p className="text-gray-600 text-center">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name}</strong>? All students in this
                batch will be unassigned. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Batches
          </h1>
          <p className="text-gray-600">
            Manage academy batches and student groups ({batches?.length || 0}{" "}
            total)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Batch
        </Button>
      </div>

      {batches && batches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              No Batches Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first batch to organize students
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First Batch
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card
              key={batch._id}
              hover
              className="cursor-pointer"
              onClick={() => handleBatchClick(batch)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    {batch.name}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(batch.status)}`}
                  >
                    {batch.status}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(batch);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete batch"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={16} />
                  <span>Coach: {batch.coachId?.email || "Not assigned"}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span>
                    Students: {batch.studentIds?.length || 0} /{" "}
                    {batch.maxStudents || 5}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>Timezone: {batch.timezone}</span>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-700 font-medium">
                    Level: {batch.level}
                  </p>
                </div>
              </div>

              {batch.studentIds && batch.studentIds.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">
                    Students in batch:
                  </p>
                  <div className="space-y-1">
                    {batch.studentIds.slice(0, 3).map((student) => (
                      <p key={student._id} className="text-xs text-gray-700">
                        • {student.studentName} ({student.studentAge}y)
                      </p>
                    ))}
                    {batch.studentIds.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{batch.studentIds.length - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBatches;
