import React, { useState, useRef, useEffect } from "react";
import { sendMessageToAssistant, fetchConversationMessages } from "../services/api";
import { Message } from "../types";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { useAuth } from "./AuthProvider";

interface ChatWindowProps {
  initialConversationDbId?: number | null;
  initialOpenaiThreadId?: string | null;
  initialMessages?: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ initialConversationDbId, initialOpenaiThreadId, initialMessages }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(initialOpenaiThreadId || null);
  const [currentConversationDbId, setCurrentConversationDbId] = useState<number | null>(initialConversationDbId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      scrollToBottom(isNearBottom ? "smooth" : "auto");
    } else {
      scrollToBottom("auto");
    }
  }, [messages]);

  useEffect(() => {
    if (initialConversationDbId !== null && initialConversationDbId !== undefined) {
      setMessages(initialMessages || []);
      setCurrentThreadId(initialOpenaiThreadId || null);
      setCurrentConversationDbId(initialConversationDbId);
    }

    const loadMessages = async () => {
      if (initialConversationDbId && session?.access_token) {
        setIsLoading(true);
        try {
          const fetchedMessages = await fetchConversationMessages(initialConversationDbId, session.access_token);
          const formattedMessages: Message[] = fetchedMessages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.content,
            sender: msg.role,
          }));
          setMessages(formattedMessages);
          setCurrentThreadId(initialOpenaiThreadId || null);
          setCurrentConversationDbId(initialConversationDbId);
        } catch (error) {
          console.error("Failed to load conversation messages:", error);
          setMessages([{
            id: "error",
            text: "Failed to load conversation history.",
            sender: "bot",
          }]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (initialConversationDbId && session?.access_token) {
      loadMessages();
    }
  }, [initialOpenaiThreadId, initialConversationDbId, initialMessages, session?.access_token]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!session?.access_token) {
      console.error("No access token available for sending message.");
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const dbIdForApi = currentConversationDbId !== null ? String(currentConversationDbId) : null;
      const assistantResponse = await sendMessageToAssistant(text, currentThreadId, dbIdForApi, session.access_token);

      if (assistantResponse.openai_thread_id) {
        setCurrentThreadId(assistantResponse.openai_thread_id);
      }

      // --- FIX APPLIED HERE for conversation_db_id ---
      const newConvDbIdFromApi = assistantResponse.conversation_db_id;

      if (typeof newConvDbIdFromApi === 'string' && newConvDbIdFromApi.trim() !== '') {
        const numId = parseInt(newConvDbIdFromApi, 10); // Parse string to number (base 10)
        if (!isNaN(numId)) { // Check if parsing was successful
          setCurrentConversationDbId(numId);
        } else {
          console.error("Invalid numeric string for conversation_db_id from API:", newConvDbIdFromApi);
          setCurrentConversationDbId(null); // Fallback to null if parsing failed
        }
      } else if (typeof newConvDbIdFromApi === 'number') {
        setCurrentConversationDbId(newConvDbIdFromApi);
      } else if (newConvDbIdFromApi === null) {
        setCurrentConversationDbId(null);
      }
      // If newConvDbIdFromApi is undefined or an empty string, currentConversationDbId remains unchanged from this block.
      // --- END OF FIX ---

      const newBotMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        text: assistantResponse.result,
        sender: "bot",
        model: "AI Companion",
        explanation: assistantResponse.explanation || undefined,
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

    } catch (error) {
      console.error("Failed to get AI response in ChatWindow:", error);
      const errorMessageText = error instanceof Error ? error.message : "An unexpected error occurred.";
      const errorMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        text: `Error: ${errorMessageText}`,
        sender: "bot",
        model: "AI Companion",
        explanation: "An error occurred while fetching the response.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-[600px] h-[calc(100vh-200px)] min-h-[500px] max-h-[700px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-glow mx-auto border-2 border-primary/20">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-t-xl shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
        <div className="relative z-10 text-center">
          <img src="/icons/Echo Logo.png" alt="Echo Therapy Logo" className="h-10 w-auto mx-auto mb-0" />
          <p className="text-gray-500 text-sm">Navigating your thoughts with a caring AI companion</p>
        </div>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-1 space-y-3 bg-gradient-to-b from-primary/5 to-white/95 custom-scrollbar"
      >
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full animate-fadeInUp">
            <div className="mb-4 bg-gradient-to-br from-primary/5 to-white/95 w-20 h-20 rounded-full flex items-center justify-center shadow-xl glow-primary border-2 border-white/70">
            </div>
            <p className="text-2xl font-semibold mb-2 text-gradient">
              Welcome!
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      {isLoading && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-center">
            <div className="flex space-x-2">
              <div className="loading-dot" style={{ animationDelay: "0ms" }}></div>
              <div className="loading-dot" style={{ animationDelay: "150ms" }}></div>
              <div className="loading-dot" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-sm ml-3 font-medium text-gradient">
              ECHO is thinking...
            </span>
          </div>
        </div>
      )}
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-b-xl shadow-lg relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
        <div className="relative z-10 text-center">
          <p className="text-gray-500 text-sm">DISCLAIMER: I am not a therapist & cannot provide medical advice or crisis support. If you are in crisis, contact emergency services or a <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">crisis hotline</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
