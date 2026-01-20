import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useAuthStore from "../../store/authStore";
import batchService from "../../services/batchService";

const CoachBatches = () => {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coachBatches = await batchService.getMyBatches();
        setBatches(coachBatches);
      } catch (error) {
        console.error("Error loading batches:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBatch(null);
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
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Batches
        </h1>
        <p className="text-gray-600">
          Manage your assigned batches and students
        </p>
      </div>

      {/* Batches Grid */}
      {batches.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <Card
              key={batch._id}
              hover
              onClick={() => handleBatchClick(batch)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-navy">
                  {batch.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    batch.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : batch.status === "FULL"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {batch.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Level:</span> {batch.level}
                </p>
                <p>
                  <span className="font-medium">Timezone:</span>{" "}
                  {batch.timezone}
                </p>
                <p>
                  <span className="font-medium">Students:</span>{" "}
                  {batch.studentIds?.length || 0}/{batch.maxStudents || 10}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">No batches assigned.</p>
        </Card>
      )}

      {/* Batch Details Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-secondary font-bold text-navy">
                  {selectedBatch.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Batch Details</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Batch Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Batch ID</p>
                  <p className="font-medium text-navy text-sm">
                    {selectedBatch._id}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Level</p>
                  <p className="font-medium text-navy">{selectedBatch.level}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Timezone</p>
                  <p className="font-medium text-navy">
                    {selectedBatch.timezone}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedBatch.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : selectedBatch.status === "FULL"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedBatch.status}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Capacity</p>
                  <p className="font-medium text-navy">
                    {selectedBatch.studentIds?.length || 0}/
                    {selectedBatch.maxStudents || 10} students
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="font-medium text-navy">
                    {new Date(selectedBatch.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Students List */}
              <div>
                <h3 className="text-lg font-semibold text-navy mb-3">
                  Students in Batch ({selectedBatch.studentIds?.length || 0})
                </h3>
                {selectedBatch.studentIds &&
                selectedBatch.studentIds.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBatch.studentIds.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-navy">
                            {student.studentName}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>Age: {student.studentAge}</span>
                            <span>Level: {student.level}</span>
                            <span>Type: {student.studentType}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No students in this batch yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachBatches;
