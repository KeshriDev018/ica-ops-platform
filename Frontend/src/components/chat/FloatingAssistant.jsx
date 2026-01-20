import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  MessageCircle,
  Minimize2,
} from "lucide-react";
import api from "../../lib/api";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your ICA Operations Assistant. Ask me about:\n• Demo conversion & priorities\n• High-risk demos\n• Admin follow-up SLA\n• Coach effectiveness\n• Funnel simulations\n• Metric explanations",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 528,
    y: window.innerHeight - 712,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/assistant/query", {
        message: input.trim(),
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        intent: response.data.intent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error querying assistant:", error);
      const errorMessage = {
        role: "assistant",
        content:
          error.response?.data?.message ||
          "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const maxX = window.innerWidth - (chatRef.current?.offsetWidth || 480);
      const maxY = window.innerHeight - (chatRef.current?.offsetHeight || 680);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, dragStart]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={toggleOpen}
          className="relative w-20 h-20 bg-gradient-to-br from-orange to-orange/80 hover:from-orange/90 hover:to-orange/70 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-pulse hover:animate-none group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle
            size={32}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Bot size={12} className="text-white" />
          </span>
        </button>
        <div className="absolute -top-12 right-0 bg-navy text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-bounce">
          Ask me anything! 💡
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border-2 border-orange/30 ${
          isMinimized ? "w-96" : "w-[480px]"
        }`}
        style={{ height: isMinimized ? "60px" : "680px" }}
      >
        {/* Header */}
        <div
          className="bg-gradient-to-r from-orange to-orange/80 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between shadow-lg cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <span className="font-bold text-lg">AI Assistant</span>
              <div className="text-xs text-white/80">Always here to help</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="hover:bg-white/30 p-2 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 size={20} />
            </button>
            <button
              onClick={toggleOpen}
              className="hover:bg-white/30 p-2 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[calc(100%-140px)] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-orange to-orange/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-navy to-navy/90 text-white shadow-lg"
                        : message.isError
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-white text-gray-800 border border-gray-200 shadow-md"
                    } rounded-2xl px-4 py-3`}
                  >
                    {message.intent && (
                      <div className="text-xs opacity-70 mb-1 font-medium uppercase">
                        {message.intent.replace(/_/g, " ")}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-navy to-navy/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange to-orange/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t-2 border-orange/20 p-4 bg-white rounded-b-2xl shadow-inner">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-orange transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-orange to-orange/80 hover:from-orange/90 hover:to-orange/70 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingAssistant;
