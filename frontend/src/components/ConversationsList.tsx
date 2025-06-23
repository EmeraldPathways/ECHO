import React from 'react';

// Define a basic Conversation type based on the usage in the error log
// You should adjust this to match your actual Conversation type in `../types` or wherever it's defined
interface Conversation {
  id: string; // The error indicates this is a string
  openai_thread_id: string | null;
  title: string;
  // Add any other properties your Conversation object has, e.g., last_message_preview, timestamp
  last_message_preview?: string;
  updated_at?: string; // Or Date
}

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (
    dbId: number, // The error indicates this parameter is expected to be a number
    openaiThreadId: string | null,
    title: string
  ) => void;
  currentConversationDbId?: number | null; // Optional: to highlight the active conversation
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onSelectConversation,
  currentConversationDbId,
}) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet. Start a new chat!
      </div>
    );
  }

  const handleSelectConversation = (conversation: Conversation) => {
    // This is where the error occurred (line 53 in your log)
    // We need to parse conversation.id from string to number

    // --- FIX APPLIED HERE ---
    const conversationDbIdAsNumber = parseInt(conversation.id, 10);

    if (isNaN(conversationDbIdAsNumber)) {
      console.error(
        `Invalid conversation ID: ${conversation.id}. Could not parse to number.`
      );
      // Optionally, you could show an error to the user or skip selection
      return;
    }
    // --- END OF FIX ---

    // Now, call onSelectConversation with the parsed number
    onSelectConversation(
      conversationDbIdAsNumber,
      conversation.openai_thread_id,
      conversation.title
    );
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg rounded-xl p-3 space-y-2 custom-scrollbar overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-3 text-gradient px-2">
        Past Conversations
      </h2>
      {conversations.map((conversation) => {
        // Attempt to parse conversation.id to number for comparison with currentConversationDbId
        const conversationIdForComparison = parseInt(conversation.id, 10);
        const isActive = !isNaN(conversationIdForComparison) && conversationIdForComparison === currentConversationDbId;

        return (
          <button
            key={conversation.id}
            onClick={() => handleSelectConversation(conversation)}
            className={`
              w-full text-left p-3 rounded-lg transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${
                isActive
                  ? 'bg-primary/80 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white/70 hover:bg-primary/20 text-gray-700 hover:text-primary-dark shadow-sm hover:shadow-md'
              }
              dark:bg-gray-700/70 dark:hover:bg-primary-dark/50 dark:text-gray-300 dark:hover:text-white
              dark:focus:ring-primary-light
              ${isActive ? 'dark:bg-primary-dark dark:text-white' : ''}
            `}
            title={`Select conversation: ${conversation.title}`}
          >
            <h3 className="font-semibold text-sm truncate">
              {conversation.title || 'Untitled Conversation'}
            </h3>
            {conversation.last_message_preview && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {conversation.last_message_preview}
              </p>
            )}
            {conversation.updated_at && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                <small>
                  {new Date(conversation.updated_at).toLocaleDateString()} - {new Date(conversation.updated_at).toLocaleTimeString()}
                </small>
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationsList;
