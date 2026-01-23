import { useState, useEffect } from "react";
import { broadcastService } from "../../services/broadcastService";
import { useChatContext } from "../../contexts/ChatContext";

export default function Broadcast() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const { socket } = useChatContext();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "ALL",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await broadcastService.getAllBroadcasts();
      setBroadcasts(response.broadcasts || []);
    } catch (error) {
      console.error("Failed to load broadcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length > 2500) {
      newErrors.content = "Content must be less than 500 words (~2500 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (editingBroadcast) {
        await broadcastService.editBroadcast(editingBroadcast._id, {
          title: formData.title,
          content: formData.content,
        });
      } else {
        await broadcastService.createBroadcast(formData);
      }

      setShowModal(false);
      setFormData({ title: "", content: "", targetAudience: "ALL" });
      setEditingBroadcast(null);
      loadBroadcasts();
    } catch (error) {
      console.error("Failed to send broadcast:", error);
      alert(error.response?.data?.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (broadcast) => {
    const now = new Date();
    const editableUntil = new Date(broadcast.editableUntil);

    if (now > editableUntil) {
      alert("This broadcast can no longer be edited (10-minute window has passed)");
      return;
    }

    setEditingBroadcast(broadcast);
    setFormData({
      title: broadcast.title,
      content: broadcast.content,
      targetAudience: broadcast.targetAudience,
    });
    setShowModal(true);
  };

  const handleDelete = async (broadcast) => {
    const now = new Date();
    const editableUntil = new Date(broadcast.editableUntil);

    if (now > editableUntil) {
      alert("This broadcast can no longer be deleted (10-minute window has passed)");
      return;
    }

    if (!confirm("Are you sure you want to delete this broadcast?")) return;

    try {
      await broadcastService.deleteBroadcast(broadcast._id);
      loadBroadcasts();
    } catch (error) {
      console.error("Failed to delete broadcast:", error);
      alert(error.response?.data?.message || "Failed to delete broadcast");
    }
  };

  const openCreateModal = () => {
    setEditingBroadcast(null);
    setFormData({ title: "", content: "", targetAudience: "ALL" });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBroadcast(null);
    setFormData({ title: "", content: "", targetAudience: "ALL" });
    setErrors({});
  };

  const getTimeRemaining = (editableUntil) => {
    const now = new Date();
    const deadline = new Date(editableUntil);
    const diff = deadline - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const isEditable = (editableUntil) => {
    return new Date() < new Date(editableUntil);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
          <p className="text-gray-600 mt-1">
            Send announcements to all users, coaches, or students
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Broadcast
        </button>
      </div>

      {/* Broadcasts List */}
      {loading && broadcasts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading broadcasts...</p>
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No broadcasts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {broadcast.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">To:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {broadcast.targetAudience}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{new Date(broadcast.createdAt).toLocaleString()}</span>
                    {isEditable(broadcast.editableUntil) && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600 font-medium">
                          Editable for: {getTimeRemaining(broadcast.editableUntil)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isEditable(broadcast.editableUntil) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(broadcast)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(broadcast)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{broadcast.content}</p>
              <div className="mt-3 text-sm text-gray-500">
                Read by {broadcast.readBy?.length || 0} users
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingBroadcast ? "Edit Broadcast" : "New Broadcast"}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter broadcast title"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Target Audience */}
                {!editingBroadcast && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send To
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({ ...formData, targetAudience: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ALL">All Users (Coaches & Students)</option>
                      <option value="COACHES">Coaches Only</option>
                      <option value="STUDENTS">Students Only</option>
                    </select>
                  </div>
                )}

                {/* Content */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message (max 500 words)"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    {errors.content ? (
                      <p className="text-red-600">{errors.content}</p>
                    ) : (
                      <p className="text-gray-500">
                        {formData.content.length} / 2500 characters
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : editingBroadcast ? "Update" : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
