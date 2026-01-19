import { useEffect, useState } from "react";
import { Trash2, Users, Clock, User } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import batchService from "../../services/batchService";
import coachService from "../../services/coachService";
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
            <Card key={batch._id} hover>
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
                  onClick={() => handleDeleteClick(batch)}
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
