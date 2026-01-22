import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import coachService from "../../services/coachService";
import AddCoachModal from "../../components/admin/AddCoachModal";

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const allCoaches = await coachService.getAll();
      setCoaches(allCoaches);
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const handleCoachAdded = () => {
    loadCoaches();
  };

  const handleDeleteClick = (coach) => {
    setDeleteConfirm(coach);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await coachService.delete(deleteConfirm._id);
      loadCoaches();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting coach:", error);
      alert(
        "Failed to delete coach: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
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
      {/* Add Coach Modal */}
      <AddCoachModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCoachAdded}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-navy text-center mb-2">
                Delete Coach?
              </h2>
              <p className="text-gray-600 text-center">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name || deleteConfirm.email}</strong>?
                This action cannot be undone.
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
            Coaches
          </h1>
          <p className="text-gray-600">Manage academy coaches</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          Add Coach
        </Button>
      </div>

      {coaches.length === 0 && !loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              No Coaches Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first coach to get started
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add First Coach
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <Card key={coach._id} hover>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(coach.fullName || coach.email)?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-navy">
                    {coach.fullName || coach.name || "Unnamed Coach"}
                  </h3>
                  <p className="text-sm text-gray-600">{coach.email}</p>
                </div>
                <button
                  onClick={() => handleDeleteClick(coach)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete coach"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Coach Details */}
              <div className="space-y-2 text-sm border-t pt-3">
                {coach.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{coach.country}</span>
                  </div>
                )}
                {coach.timezone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium">{coach.timezone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${coach.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {coach.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${coach.payoutVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {coach.payoutVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                {coach.payoutMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{coach.payoutMethod}</span>
                  </div>
                )}
                {(coach.payoutPerClass > 0 || coach.payoutPerBatch > 0) && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">Rates:</div>
                    {coach.payoutPerClass > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Per Class:</span>
                        <span className="font-medium">
                          ₹{coach.payoutPerClass}
                        </span>
                      </div>
                    )}
                    {coach.payoutPerBatch > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Per Batch:</span>
                        <span className="font-medium">
                          ₹{coach.payoutPerBatch}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoaches;
