import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import useAuthStore from "../../store/authStore";
import studentService from "../../services/studentService";
import batchService from "../../services/batchService";

const CoachChat = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatType, setChatType] = useState("all"); // 'all', 'batch', '1-1', 'admin'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coachStudents, coachBatches] = await Promise.all([
        studentService.getCoachStudents(),
        batchService.getMyBatches(),
      ]);
      setStudents(coachStudents);
      setBatches(coachBatches);
    } catch (error) {
      console.error("Error loading chat data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dummy messages for demonstration
  const getDummyMessages = (chatId, type) => {
    const baseMessages = [
      {
        id: 1,
        sender: type === "admin" ? "Admin" : "You",
        text: "Hello! How can I help you today?",
        time: "10:30 AM",
        isOwn: type !== "admin",
      },
      {
        id: 2,
        sender: type === "admin" ? "You" : selectedChat?.name || "Student",
        text: "I have a question about the upcoming class.",
        time: "10:32 AM",
        isOwn: type === "admin",
      },
      {
        id: 3,
        sender: type === "admin" ? "Admin" : "You",
        text: "Sure, what would you like to know?",
        time: "10:33 AM",
        isOwn: type !== "admin",
      },
    ];
    return baseMessages;
  };

  const handleSelectChat = (chat, type) => {
    // Normalize the chat object - students have studentName, others have name
    const normalizedChat = {
      ...chat,
      name: chat.name || chat.studentName || "Unknown",
      type,
    };
    setSelectedChat(normalizedChat);
    setMessages(getDummyMessages(chat._id, type));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: "You",
      text: newMessage,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: selectedChat?.type === "admin" ? "Admin" : selectedChat?.name,
        text: "Thanks for your message! I'll get back to you soon.",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const oneOnOneStudents = students.filter((s) => s.studentType === "1-1");
  const groupStudents = students.filter((s) => s.studentType === "group");

  // Group students by batch - use the batches array to ensure we show all batches
  const batchChats = batches
    .filter((batch) => batch.status === "ACTIVE")
    .map((batch) => {
      // Find all students in this batch
      const batchStudents = groupStudents.filter((student) => {
        if (!student.assignedBatchId) return false;

        // Handle both string ID and populated object
        const studentBatchId =
          typeof student.assignedBatchId === "object"
            ? student.assignedBatchId._id
            : student.assignedBatchId;

        return studentBatchId === batch._id;
      });

      return {
        batch: batch,
        students: batchStudents,
      };
    })
    .filter((chat) => chat.students.length > 0); // Only show batches with students

  const filteredChats = () => {
    if (chatType === "admin") return [];
    if (chatType === "1-1") return oneOnOneStudents;
    if (chatType === "batch") return batchChats;
    return [...oneOnOneStudents, ...batchChats];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Messages
        </h1>
        <p className="text-gray-600">Chat with your students and admin</p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-80px)]">
        {/* Chat List Sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card className="h-full flex flex-col p-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <button
                onClick={() => setChatType("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  chatType === "all"
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setChatType("1-1")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  chatType === "1-1"
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                1-on-1
              </button>
              <button
                onClick={() => setChatType("batch")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  chatType === "batch"
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Batches
              </button>
              <button
                onClick={() => setChatType("admin")}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  chatType === "admin"
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {/* Admin Chat */}
              {(chatType === "all" || chatType === "admin") && (
                <div
                  onClick={() =>
                    handleSelectChat(
                      { _id: "admin", name: "Admin Support", type: "admin" },
                      "admin",
                    )
                  }
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?._id === "admin"
                      ? "bg-navy text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">Admin Support</h4>
                      <p
                        className={`text-sm truncate ${
                          selectedChat?._id === "admin"
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        Get help from admin
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 1-on-1 Students */}
              {(chatType === "all" || chatType === "1-1") &&
                oneOnOneStudents.map((student) => (
                  <div
                    key={student._id}
                    onClick={() => handleSelectChat(student, "1-1")}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?._id === student._id
                        ? "bg-navy text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {student.studentName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {student.studentName}
                        </h4>
                        <p
                          className={`text-sm truncate ${
                            selectedChat?._id === student._id
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          {student.level} • 1-on-1
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Batch Groups */}
              {(chatType === "all" || chatType === "batch") &&
                batchChats.map(({ batch, students }) => (
                  <div
                    key={batch._id}
                    onClick={() =>
                      handleSelectChat(
                        { _id: batch._id, name: batch.name, students },
                        "batch",
                      )
                    }
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?._id === batch._id
                        ? "bg-navy text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                        {batch.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{batch.name}</h4>
                        <p
                          className={`text-sm truncate ${
                            selectedChat?._id === batch._id
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          {batch.level} • {students.length} students
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              {filteredChats().length === 0 && chatType !== "admin" && (
                <div className="text-center py-8 text-gray-500">
                  No chats available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {selectedChat ? (
            <Card className="h-full flex flex-col p-6">
              {/* Chat Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      selectedChat.type === "admin"
                        ? "bg-orange-500"
                        : selectedChat.type === "batch"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    } text-white flex items-center justify-center font-semibold text-lg`}
                  >
                    {selectedChat.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy">
                      {selectedChat.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.type === "admin"
                        ? "Support team"
                        : selectedChat.type === "batch"
                          ? `${selectedChat.students?.length || 0} students in group`
                          : "1-on-1 Student"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px]">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.isOwn
                            ? "bg-navy text-white"
                            : "bg-gray-100 text-gray-800"
                        } rounded-lg p-3`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {message.sender}
                        </p>
                        <p>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwn ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-600">
                  Choose a student or admin from the list
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachChat;
