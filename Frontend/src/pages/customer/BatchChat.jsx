import { useState, useEffect } from "react";
import Card from "../../components/common/Card";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import studentService from "../../services/studentService";

const CustomerBatchChat = () => {
  const [student, setStudent] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // 'batch', '1-1', or 'admin'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy messages for different chat types
  const dummyMessages = {
    batch: [
      {
        id: 1,
        sender: "Coach",
        email: "coach@example.com",
        content:
          "Welcome to the batch! Let's start with some opening strategies.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
      {
        id: 2,
        sender: "Student 1",
        email: "student1@example.com",
        content: "Thank you coach! Excited to learn.",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        type: "text",
      },
      {
        id: 3,
        sender: "Parent",
        email: "parent@example.com",
        content: "Looking forward to seeing progress!",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "text",
      },
    ],
    "1-1": [
      {
        id: 1,
        sender: "Coach",
        email: "coach@example.com",
        content: "Hi! Ready for your personalized training session?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
      {
        id: 2,
        sender: "You",
        email: "you@example.com",
        content: "Yes, I'd like to work on endgame tactics.",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        type: "text",
      },
      {
        id: 3,
        sender: "Coach",
        email: "coach@example.com",
        content: "Great! Let's analyze some positions together.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "text",
      },
    ],
    admin: [
      {
        id: 1,
        sender: "Admin",
        email: "admin@indianchessacademy.com",
        content: "Hello! How can we help you today?",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: "text",
      },
      {
        id: 2,
        sender: "You",
        email: "you@example.com",
        content: "I have a question about my schedule.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: "text",
      },
      {
        id: 3,
        sender: "Admin",
        email: "admin@indianchessacademy.com",
        content: "Sure! Please let me know your specific question.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: "text",
      },
    ],
  };

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const myStudent = await studentService.getMyStudent();
        console.log("📚 Student loaded for chat:", myStudent);
        setStudent(myStudent);

        // Set default active chat based on student type
        if (myStudent.studentType === "group" && myStudent.assignedBatchId) {
          setActiveChat("batch");
          setMessages(dummyMessages.batch);
        } else if (myStudent.studentType === "1-1") {
          setActiveChat("1-1");
          setMessages(dummyMessages["1-1"]);
        } else {
          setActiveChat("admin");
          setMessages(dummyMessages.admin);
        }
      } catch (error) {
        console.error("Error loading student:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, []);

  const handleSwitchChat = (chatType) => {
    setActiveChat(chatType);
    setMessages(dummyMessages[chatType]);
  };

  const handleSend = async (content) => {
    // Add message to dummy messages (will be replaced with real API later)
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      email: "you@example.com",
      content: content,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    setMessages([...messages, newMessage]);
  };

  const handleFileUpload = async (file) => {
    // Add file message to dummy messages (will be replaced with real API later)
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      email: "you@example.com",
      content: `Uploaded file: ${file.name}`,
      timestamp: new Date().toISOString(),
      type: "file",
      fileName: file.name,
    };
    setMessages([...messages, newMessage]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Chat
          </h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load student information.</p>
          </div>
        </Card>
      </div>
    );
  }

  const getChatTitle = () => {
    switch (activeChat) {
      case "batch":
        return `Batch Chat - ${student.assignedBatchId?.name || "Group"}`;
      case "1-1":
        return "1-on-1 Coach Chat";
      case "admin":
        return "Admin Support";
      default:
        return "Chat";
    }
  };

  const getChatDescription = () => {
    switch (activeChat) {
      case "batch":
        return "Chat with your coach, batch members, and parents";
      case "1-1":
        return "Private conversation with your coach";
      case "admin":
        return "Get help from our support team";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Chat
        </h1>
        <p className="text-gray-600">
          Connect with your coach, batch members, and admin support
        </p>
      </div>

      {/* Chat Type Selector */}
      <Card>
        <div className="flex gap-2 flex-wrap">
          {student.studentType === "group" && student.assignedBatchId && (
            <button
              onClick={() => handleSwitchChat("batch")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChat === "batch"
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🎓 Batch Chat
            </button>
          )}
          {student.studentType === "1-1" && (
            <button
              onClick={() => handleSwitchChat("1-1")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeChat === "1-1"
                  ? "bg-navy text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👤 1-on-1 Coach
            </button>
          )}
          <button
            onClick={() => handleSwitchChat("admin")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeChat === "admin"
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🛟 Admin Support
          </button>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card
        className="p-0 overflow-hidden flex flex-col"
        style={{ height: "600px" }}
      >
        <div className="bg-navy text-white px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">{getChatTitle()}</h2>
          <p className="text-sm text-white/80">{getChatDescription()}</p>
        </div>

        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            currentUserEmail="you@example.com"
            participants={{}}
          />
        </div>

        <MessageInput
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          allowFiles={true}
        />
      </Card>
    </div>
  );
};

export default CustomerBatchChat;
