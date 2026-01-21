import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { useChat } from "../../hooks/useChat";
import * as chatService from "../../services/chatService";
import Card from "../../components/common/Card";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import studentService from "../../services/studentService";

const CustomerMessages = () => {
  // Remove dummy messages and duplicate loading state

  const { user } = useAuthStore();
  const [adminContact, setAdminContact] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { messages, sendMessage, uploadFile, loadMessages } =
    useChat(conversationId);
  // No student loading, only admin support chat

  // Send message using real chat logic
  const handleSend = async (content) => {
    if (!conversationId) return;
    try {
      await sendMessage(content);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const handleFileUpload = async (file) => {
    if (!conversationId) return;
    try {
      await uploadFile(file);
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  // Find admin contact and conversation on mount
  useEffect(() => {
    const setupChat = async () => {
      try {
        // Get admin contacts
        const contacts = await chatService.getAvailableContacts();
        const admin = contacts.find((c) => c.role === "ADMIN");
        setAdminContact(admin);
        if (!admin) throw new Error("No admin contact found");

        // Find or create conversation with admin
        const conversations = await chatService.getUserConversations();
        let conv = conversations.find(
          (c) =>
            c.conversationType === "DIRECT" &&
            c.participants.some((p) => {
              const id =
                typeof p.accountId === "string"
                  ? p.accountId
                  : p.accountId?._id;
              return id === admin.accountId;
            }),
        );
        if (!conv) {
          // Create conversation if not exists
          conv = await chatService.createConversation("DIRECT", [
            { accountId: user.accountId, role: user.role },
            { accountId: admin.accountId, role: admin.role },
          ]);
        }
        setConversationId(conv._id);
        await loadMessages(conv._id);
      } catch (err) {
        console.error("Error setting up chat:", err);
      }
    };
    if (user?.accountId) setupChat();
  }, [user, loadMessages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Messages
        </h1>
        <p className="text-gray-600">Get help from our support team</p>
      </div>

      {/* Only Admin Support Chat */}
      <Card
        className="p-0 overflow-hidden flex flex-col"
        style={{ height: "600px" }}
      >
        <div className="bg-navy text-white px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-sm text-white/80">
            Chat with our admin team for any help or support.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            currentUserEmail={user?.email}
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

export default CustomerMessages;
