import { useEffect, useState, useRef } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import useAuthStore from "../../store/authStore";
import { useChat } from "../../hooks/useChat";
import { useChatContext } from "../../contexts/ChatContext";
import * as chatService from "../../services/chatService";

const CoachChat = () => {
  const { user } = useAuthStore();
  const { isConnected, isUserOnline } = useChatContext();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [conversationMap, setConversationMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("admin");
  const [chatType, setChatType] = useState("admin"); // Add this back for tab filtering
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
      if (conv.conversationType === "DIRECT" && conv.participants.length === 2) {
        const otherParticipant = conv.participants.find(
          (p) => p.accountId._id !== user.accountId
        );
        if (otherParticipant) {
          map.set(otherParticipant.accountId._id, conv._id);
        }
      }
    });
    setConversationMap(map);
  }, [conversations, user]);

  const getUnreadCount = (contactId) => {
    const convId = conversationMap.get(contactId);
    if (!convId) return 0;
    const conversation = conversations.find(c => c._id === convId);
    return conversation?.unreadCount || 0;
  };

  const getLastMessage = (contactId) => {
    const convId = conversationMap.get(contactId);
    if (!convId) return null;
    const conversation = conversations.find(c => c._id === convId);
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
      // Check if conversation already exists
      let convId = conversationMap.get(contact.accountId);

      if (!convId) {
        // Create new conversation - include current user (coach) and the contact
        const conversation = await createConversation("DIRECT", [
          { accountId: user.accountId, role: user.role },
          { accountId: contact.accountId, role: contact.role },
        ]);
        convId = conversation._id;

        // Update map
        setConversationMap(new Map(conversationMap.set(contact.accountId, convId)));
      }

      setActiveConversationId(convId);
    } catch (error) {
      console.error("Error selecting contact:", error);
      alert("Failed to open conversation. Please try again.");
    }
  };

  const typingUsers = getTypingUsers();
  const admins = contacts.filter((c) => c.role === "ADMIN");

  const activeContact = activeConversationId
    ? contacts.find((c) => conversationMap.get(c.accountId) === activeConversationId)
    : null;

  const participants = activeContact
    ? {
        [user?.email]: { name: "You", role: "COACH" },
        [activeContact.name]: {
          name: activeContact.name,
          role: activeContact.role,
        },
      }
    : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Messages
          </h1>
          <p className="text-gray-600">
            Chat with your students and admin
            <span className="ml-3 text-sm">
              {isConnected ? (
                <span className="text-green-600">🟢 Live</span>
              ) : (
                <span className="text-red-600">🔴 Connecting...</span>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Contacts Sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Contacts</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setChatType("admin");
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "admin"
                    ? "bg-orange text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Contact List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {admins.length > 0 ? (
                admins.map((contact) => {
                  const isOnline = isUserOnline(contact.accountId);
                  const isActive = conversationMap.get(contact.accountId) === activeConversationId;
                  const unreadCount = getUnreadCount(contact.accountId);
                  const lastMsg = getLastMessage(contact.accountId);

                  return (
                    <button
                      key={contact.accountId}
                      onClick={() => handleSelectContact(contact)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-orange text-white"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold truncate">{contact.name}</div>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {lastMsg ? (
                            <div
                              className={`text-xs truncate ${
                                isActive ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {lastMsg.content}
                            </div>
                          ) : (
                            <div
                              className={`text-xs truncate ${
                                isActive ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {contact.role.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No contacts available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {activeConversationId && activeContact ? (
            <Card className="p-6">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{activeContact.name}</h3>
                    <p className="text-sm text-gray-600">
                      {isUserOnline(activeContact.accountId) ? (
                        <span className="text-green-600">● Online</span>
                      ) : (
                        <span className="text-gray-500">● Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[450px] overflow-y-auto mb-4">
                <MessageList
                  messages={messages}
                  participants={participants}
                  currentUserEmail={user?.email}
                  typingUsers={typingUsers}
                />
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                placeholder="Type your message..."
                disabled={false}
              />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  Start a Conversation
                </h3>
                <p className="text-gray-600">
                  Select an admin to begin chatting
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
