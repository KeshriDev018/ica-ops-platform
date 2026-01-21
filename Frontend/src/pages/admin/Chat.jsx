import { useState, useEffect, useRef } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import useAuthStore from "../../store/authStore";
import { useChat } from "../../hooks/useChat";
import { useChatContext } from "../../contexts/ChatContext";
import * as chatService from "../../services/chatService";

const AdminChat = () => {
  const { user } = useAuthStore();
  const { isConnected, isUserOnline } = useChatContext();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [conversationMap, setConversationMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("students");
  const messagesEndRef = useRef(null);

  const {
    messages,
    conversations,
    sendMessage,
    handleTyping,
    handleStopTyping,
    getTypingUsers,
    loadConversations,
    createConversation,
  } = useChat(activeConversationId);

  // Load contacts and conversations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load contacts first
        const contactsData = await chatService.getAvailableContacts();
        setContacts(contactsData);

        // Load conversations (this updates the conversations state in useChat)
        await loadConversations();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, loadConversations]);

  // Build conversation map when conversations change
  useEffect(() => {
    const map = new Map();
    conversations?.forEach((conv) => {
      if (
        conv.conversationType === "DIRECT" &&
        conv.participants.length === 2
      ) {
        // Find the other participant (not the current user)
        const otherParticipant = conv.participants.find((p) => {
          // accountId can be string or object
          const id =
            typeof p.accountId === "string" ? p.accountId : p.accountId?._id;
          return id !== user.accountId;
        });
        if (otherParticipant) {
          const id =
            typeof otherParticipant.accountId === "string"
              ? otherParticipant.accountId
              : otherParticipant.accountId?._id;
          map.set(id, conv._id);
        }
      }
    });
    setConversationMap(map);
  }, [conversations, user]);

  const getUnreadCount = (contactId) => {
    const convId = conversationMap.get(contactId);
    if (!convId) return 0;
    const conversation = conversations.find((c) => c._id === convId);
    return conversation?.unreadCount || 0;
  };

  const getLastMessage = (contactId) => {
    const convId = conversationMap.get(contactId);
    if (!convId) return null;
    const conversation = conversations.find((c) => c._id === convId);
    return conversation?.lastMessage;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content, file = null) => {
    if (!activeConversationId || !content.trim()) return;

    try {
      await sendMessage(content);
      handleStopTyping();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleSelectContact = async (contact) => {
    try {
      console.log("[DEBUG] Selected contact:", contact);
      console.log("[DEBUG] Current user:", user);
      // Check if conversation already exists
      let convId = conversationMap.get(contact.accountId);

      if (!convId) {
        const participants = [
          { accountId: user.accountId, role: user.role },
          { accountId: contact.accountId, role: contact.role },
        ];
        console.log("[DEBUG] Creating conversation with:", participants);
        // Create new conversation - include current user (admin) and the contact
        const conversation = await createConversation("DIRECT", participants);
        console.log("[DEBUG] Conversation created:", conversation);
        convId = conversation._id;

        // Update map
        setConversationMap(
          new Map(conversationMap.set(contact.accountId, convId)),
        );
      }

      setActiveConversationId(convId);
    } catch (error) {
      console.error("[DEBUG] Error selecting contact:", error);
      alert("Failed to open conversation. Please try again.");
    }
  };

  const handleBroadcast = () => {
    alert("Broadcast functionality will be implemented in a future update.");
  };

  const typingUsers = getTypingUsers();
  // For parents, show both parent and student name
  const students = contacts
    .filter((c) => c.role === "CUSTOMER")
    .map((c) => ({
      ...c,
      displayName:
        c.name && c.studentName
          ? `${c.name} (${c.studentName})`
          : c.name || c.studentName || "Parent",
    }));
  const coaches = contacts.filter((c) => c.role === "COACH");
  const displayList = activeTab === "students" ? students : coaches;

  const activeContact = activeConversationId
    ? contacts.find((c) => {
        // c.accountId is always string, but conversationMap keys may be string or object _id
        return conversationMap.get(c.accountId) === activeConversationId;
      })
    : null;

  const participants = activeContact
    ? {
        [user?.email]: { name: "Admin", role: "ADMIN" },
        [activeContact.name]: {
          name: activeContact.name,
          role: activeContact.role,
        },
      }
    : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Chat & Broadcast
          </h1>
          <p className="text-gray-600">
            Connect with students and coaches
            <span className="ml-3 text-sm">
              {isConnected ? (
                <span className="text-green-600">🟢 Live</span>
              ) : (
                <span className="text-red-600">🔴 Connecting...</span>
              )}
            </span>
          </p>
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
                Parents ({students.length})
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
                displayList.map((contact) => {
                  const isActive =
                    conversationMap.get(contact.accountId) ===
                    activeConversationId;
                  const isOnline = isUserOnline(contact.accountId);
                  const unreadCount = getUnreadCount(contact.accountId);
                  const lastMsg = getLastMessage(contact.accountId);

                  return (
                    <div
                      key={contact.accountId}
                      onClick={() => handleSelectContact(contact)}
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
                        <div className="relative">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              isActive
                                ? "bg-white/20"
                                : activeTab === "students"
                                  ? "bg-navy"
                                  : "bg-orange"
                            }`}
                          >
                            {(contact.displayName || contact.name)
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">
                              {contact.displayName || contact.name || "No Name"}
                            </p>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {lastMsg ? (
                            <p
                              className={`text-xs truncate ${
                                isActive ? "text-white/80" : "text-gray-600"
                              }`}
                            >
                              {lastMsg.content}
                            </p>
                          ) : (
                            <p
                              className={`text-xs truncate ${
                                isActive ? "text-white/80" : "text-gray-600"
                              }`}
                            >
                              {contact.type || contact.role}
                            </p>
                          )}
                        </div>
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
            {activeConversationId && activeContact ? (
              <>
                <div
                  className={`px-6 py-4 flex-shrink-0 ${
                    activeContact.role === "CUSTOMER" ? "bg-navy" : "bg-orange"
                  } text-white`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                      {activeContact.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Parent: {activeContact.name}
                        {activeContact.studentName && (
                          <span className="ml-4">
                            | Student: {activeContact.studentName}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-white/80">
                        {isUserOnline(activeContact.accountId) ? (
                          <span>🟢 Online</span>
                        ) : (
                          <span>⚫ Offline</span>
                        )}
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
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="px-6 py-2 bg-gray-50 text-sm text-gray-600">
                    {typingUsers.map((u) => u.userName).join(", ")} is typing...
                  </div>
                )}

                <MessageInput
                  onSend={handleSend}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  allowFiles={false}
                />
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl font-semibold text-navy mb-2">
                    Start a Conversation
                  </p>
                  <p className="text-gray-500">
                    Select a parent or coach to begin chatting
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
