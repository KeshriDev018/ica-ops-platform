import { useState, useEffect } from "react";
import { broadcastService } from "../../services/broadcastService";
import { useChatContext } from "../../contexts/ChatContext";

export default function CoachBroadcasts() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useChatContext();

  useEffect(() => {
    loadBroadcasts();
    loadUnreadCount();

    // Listen for new broadcasts
    if (socket) {
      socket.on("broadcast:new", handleNewBroadcast);
      socket.on("broadcast:updated", handleBroadcastUpdated);
      socket.on("broadcast:deleted", handleBroadcastDeleted);
    }

    return () => {
      if (socket) {
        socket.off("broadcast:new", handleNewBroadcast);
        socket.off("broadcast:updated", handleBroadcastUpdated);
        socket.off("broadcast:deleted", handleBroadcastDeleted);
      }
    };
  }, [socket]);

  const handleNewBroadcast = (broadcast) => {
    setBroadcasts((prev) => [broadcast, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const handleBroadcastUpdated = (broadcast) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b._id === broadcast._id ? { ...b, ...broadcast } : b))
    );
  };

  const handleBroadcastDeleted = ({ _id }) => {
    setBroadcasts((prev) => prev.filter((b) => b._id !== _id));
  };

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await broadcastService.getMyBroadcasts();
      setBroadcasts(response.broadcasts || []);
    } catch (error) {
      console.error("Failed to load broadcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await broadcastService.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleMarkAsRead = async (broadcastId) => {
    try {
      await broadcastService.markAsRead(broadcastId);
      setBroadcasts((prev) =>
        prev.map((b) => (b._id === broadcastId ? { ...b, isRead: true } : b))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getAudienceBadgeColor = (audience) => {
    switch (audience) {
      case "ALL":
        return "bg-purple-100 text-purple-700";
      case "COACHES":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">
              Important updates from administration
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {unreadCount} Unread
            </span>
          )}
        </div>
      </div>

      {loading && broadcasts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading announcements...</p>
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-4 text-gray-600">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast._id}
              className={`bg-white border rounded-lg p-6 transition-all ${
                broadcast.isRead
                  ? "border-gray-200"
                  : "border-blue-300 shadow-md"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {!broadcast.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {broadcast.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">From:</span>
                      <span>{broadcast.senderName || "Admin"}</span>
                    </span>
                    <span>•</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getAudienceBadgeColor(
                        broadcast.targetAudience
                      )}`}
                    >
                      {broadcast.targetAudience === "ALL"
                        ? "All Users"
                        : "Coaches"}
                    </span>
                    <span>•</span>
                    <span>{new Date(broadcast.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {!broadcast.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(broadcast._id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {broadcast.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
