import { useState, useEffect } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import useAuthStore from "../../store/authStore";
import chatService from "../../services/chatService";
import studentService from "../../services/studentService";
import coachService from "../../services/coachService";

const AdminChat = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students"); // 'students' or 'coaches'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsData, coachesData] = await Promise.all([
          studentService.getAll(),
          coachService.getAll(),
        ]);
        setStudents(studentsData);
        setCoaches(coachesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      try {
        const chatMessages = await chatService.getDirectMessages(
          activeChat.chat_id,
          activeChat.type,
        );
        setMessages(chatMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();

    // Poll for new messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const handleSend = async (content) => {
    if (!activeChat || !user) return;

    try {
      // TODO: Will integrate with chat service later
      const newMessage = {
        id: Date.now(),
        sender_email: user.email,
        content: content,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleSelectChat = (person, type) => {
    setActiveChat({
      id: person._id,
      name: type === "student" ? person.studentName : person.name,
      email: person.email,
      type: type,
    });
    // Clear messages for now - will load from service later
    setMessages([]);
  };

  const handleBroadcast = () => {
    // TODO: Implement broadcast functionality
    alert("Broadcast functionality will be implemented in a future update.");
  };

  const participants = activeChat
    ? {
        [user?.email]: { name: "Admin", role: "ADMIN" },
        [activeChat.email]: {
          name: activeChat.name,
          role: activeChat.type === "student" ? "STUDENT" : "COACH",
        },
      }
    : {};

  const displayList = activeTab === "students" ? students : coaches;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Chat & Broadcast
          </h1>
          <p className="text-gray-600">Connect with students and coaches</p>
        </div>
        <Button variant="primary" size="md" onClick={handleBroadcast}>
          Broadcast Message
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact List */}
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-navy mb-3">Contacts</h2>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "students"
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Students ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("coaches")}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "coaches"
                    ? "bg-orange text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Coaches ({coaches.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {displayList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab} found
                </div>
              ) : (
                displayList.map((person) => {
                  const isActive = activeChat?.id === person._id;
                  const name =
                    activeTab === "students" ? person.studentName : person.name;
                  const level = activeTab === "students" ? person.level : null;

                  return (
                    <div
                      key={person._id}
                      onClick={() =>
                        handleSelectChat(
                          person,
                          activeTab === "students" ? "student" : "coach",
                        )
                      }
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? activeTab === "students"
                            ? "bg-navy text-white shadow-md"
                            : "bg-orange text-white shadow-md"
                          : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            isActive
                              ? "bg-white/20"
                              : activeTab === "students"
                                ? "bg-navy"
                                : "bg-orange"
                          }`}
                        >
                          {name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {name || "No Name"}
                          </p>
                          <p
                            className={`text-sm truncate ${
                              isActive ? "text-white/80" : "text-gray-600"
                            }`}
                          >
                            {person.email}
                          </p>
                          {level && (
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-navy/10 text-navy"
                              }`}
                            >
                              {level}
                            </span>
                          )}
                        </div>

                        {/* Online indicator */}
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full ${
                            Math.random() > 0.5 ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Card>

        {/* Chat Window */}
        <div className="md:col-span-2">
          <Card
            className="p-0 overflow-hidden flex flex-col"
            style={{ height: "600px" }}
          >
            {activeChat ? (
              <>
                <div
                  className={`px-6 py-4 flex-shrink-0 ${
                    activeChat.type === "student" ? "bg-navy" : "bg-orange"
                  } text-white`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                      {activeChat.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{activeChat.name}</h3>
                      <p className="text-sm text-white/80">
                        {activeChat.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    currentUserEmail={user?.email}
                    participants={participants}
                  />
                </div>

                <MessageInput onSend={handleSend} allowFiles={false} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl font-semibold text-navy mb-2">
                    Start a Conversation
                  </p>
                  <p className="text-gray-500">
                    Select a student or coach to begin chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
