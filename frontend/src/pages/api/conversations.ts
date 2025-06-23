import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// StoredMessage was removed as it's not used here and caused a previous error.
// Ensure ChatServiceResponse and ChatServiceRequest are correctly defined in '@/types'.
import type { ChatServiceResponse, ChatServiceRequest } from '@/types';
import type { User } from '@supabase/supabase-js';

// --- Environment Variables ---
const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAIApiKey: string | undefined = process.env.OPENAI_API_KEY;
const assistantId: string | undefined = process.env.OPENAI_ASSISTANT_ID;

if (!supabaseUrl || !supabaseServiceRoleKey || !openAIApiKey || !assistantId) {
  console.error("CRITICAL: One or more environment variables are missing for /api/chat. App may not function.");
  // This throw will stop the server from starting if env vars are missing,
  // which is good for preventing runtime errors later.
  throw new Error("Server configuration error: Missing critical environment variables for chat API.");
}

// --- Initialize Clients ---
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const openai: OpenAI = new OpenAI({ apiKey: openAIApiKey });

// --- Placeholder for Trusted Data Source & Function Implementation ---
// Consider moving this to a separate file or database if it grows large.
const TRUSTED_KNOWLEDGE_BASE = {
    "stress": {
        "definition": "Stress is a feeling of emotional or physical tension. It can come from any event or thought that makes you feel frustrated, angry, or nervous. Stress is your body's reaction to a challenge or demand.",
        "general_note": "In short bursts, stress can be positive, such as when it helps you avoid danger or meet a deadline. But when stress lasts for a long time, it may harm your health."
    },
    "mindfulness": {
        "definition": "Mindfulness is a type of meditation in which you focus on being intensely aware of what you're seeing and feeling in the moment, without interpretation or judgment.",
        "general_note": "Practicing mindfulness involves breathing methods, guided imagery, and other practices to relax the body and mind and help reduce stress. Many people explore mindfulness as a way to become more aware of their thoughts and feelings."
    }
    // Add more topics...
};

async function execute_get_general_information_on_topic(topic: string): Promise<string> {
  console.log(`[Function Call] Attempting to execute get_general_information_on_topic for: ${topic}`);
  const topicLower = topic.toLowerCase();
  const article = TRUSTED_KNOWLEDGE_BASE[topicLower as keyof typeof TRUSTED_KNOWLEDGE_BASE];
  if (article) {
    return article.definition + (article.general_note ? " " + article.general_note : "");
  }
  console.log(`[Function Call] No information found for topic: ${topic}`);
  return `I currently don't have specific pre-approved general information on '${topic}' to share. However, I'm here to listen to your thoughts about it.`;
}
// --- End of Function Implementation ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatServiceResponse | { error: string | { message: string } }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let authenticatedUser: User | null = null;
  try {
    // 1. Authenticate User
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      console.error('Chat API - Auth Error:', authError?.message);
      return res.status(401).json({ error: authError?.message || 'Invalid or expired token' });
    }
    authenticatedUser = authData.user;

    // 2. Get User Input
    const { text: userMessageContent, thread_id: existingOpenAIThreadId, conversation_db_id: existingConversationDbId } = req.body as ChatServiceRequest;

    if (!userMessageContent || typeof userMessageContent !== 'string' || userMessageContent.trim() === "") {
      return res.status(400).json({ error: 'Message content (text) is required and cannot be empty.' });
    }

    let currentOpenAIThreadId = existingOpenAIThreadId;
    // Type for currentConversationDbId allows string (from client or UUIDs) or number (if new ID is numeric)
    let currentConversationDbId: string | number | null | undefined = existingConversationDbId;

    // 3. Manage OpenAI Thread & Supabase Conversation Record
    if (!currentOpenAIThreadId && (currentConversationDbId === null || currentConversationDbId === undefined)) {
      console.log(`Chat API - User ${authenticatedUser.id}: Creating new OpenAI thread and DB conversation.`);
      const thread = await openai.beta.threads.create();
      currentOpenAIThreadId = thread.id;

      const { data: newConversation, error: convInsertError } = await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: authenticatedUser.id,
          openai_thread_id: currentOpenAIThreadId,
          title: userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? '...' : ''),
        })
        .select('id')
        .single();

      if (convInsertError) {
        console.error('Chat API - DB Error creating conversation:', convInsertError.message);
        throw convInsertError; // Propagate error to catch block
      }
      currentConversationDbId = newConversation!.id; // Supabase ID could be number or string (UUID)
      console.log(`Chat API - User ${authenticatedUser.id}: New DB conversation ID ${currentConversationDbId} linked to OpenAI Thread ${currentOpenAIThreadId}`);
    } else if (currentOpenAIThreadId && (typeof currentConversationDbId === 'string' || typeof currentConversationDbId === 'number')) {
      // Existing conversation, update its timestamp
      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationDbId)
        .eq('user_id', authenticatedUser.id); // Ensure user owns this conversation
    } else {
        // This case indicates an inconsistent state (e.g., one ID present but not the other)
        console.error(`Chat API - User ${authenticatedUser.id}: Inconsistent state - OpenAI Thread ID: ${currentOpenAIThreadId}, DB Conversation ID: ${currentConversationDbId}`);
        return res.status(400).json({ error: "Inconsistent conversation state. Please start a new chat." });
    }

    // Assert that currentOpenAIThreadId and currentConversationDbId are now defined
    if (!currentOpenAIThreadId || (currentConversationDbId === null || currentConversationDbId === undefined)) {
        console.error(`Chat API - User ${authenticatedUser.id}: Critical error - thread or conversation ID is null/undefined after setup.`);
        throw new Error("Failed to initialize or retrieve conversation identifiers.");
    }

    // 4. Add User Message to OpenAI Thread
    await openai.beta.threads.messages.create(currentOpenAIThreadId, { // Non-null assertion removed as it's checked above
      role: 'user',
      content: userMessageContent,
    });

    // 5. Save User Message to Supabase DB
    const { error: userMsgInsertError } = await supabaseAdmin.from('messages').insert([
      { conversation_id: currentConversationDbId, role: 'user', content: userMessageContent },
    ]);
    if (userMsgInsertError) {
        console.error('Chat API - DB Error saving user message:', userMsgInsertError.message);
        // Decide if this is a critical failure. For now, we proceed.
    }

    // 6. Create and Run Assistant
    let run = await openai.beta.threads.runs.create(currentOpenAIThreadId, { // Non-null assertion removed for currentOpenAIThreadId
      assistant_id: assistantId!, // Non-null assertion for assistantId, checked at startup
    });

    // 7. Poll for Run Completion & Handle Tool Calls
    const maxPollAttempts = 35; // Approx 70 seconds
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      run = await openai.beta.threads.runs.retrieve(currentOpenAIThreadId, run.id);

      console.log(`Chat API - User ${authenticatedUser.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}, Status: ${run.status}, Attempt: ${attempt + 1}`);

      if (run.status === 'completed') break;

      if (run.status === 'requires_action') {
        if (run.required_action && run.required_action.type === 'submit_tool_outputs') {
          const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs = [];

          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            let output = "";

            if (functionName === 'get_general_information_on_topic') {
              output = await execute_get_general_information_on_topic(args.topic);
            } else {
              console.warn(`Chat API - Unknown function called by Assistant: ${functionName}`);
              output = `Error: Function ${functionName} is not implemented on this backend.`;
            }
            toolOutputs.push({ tool_call_id: toolCall.id, output });
          }
          
          if (toolOutputs.length > 0) {
            // Corrected method name to camelCase
            await openai.beta.threads.runs.submitToolOutputs(currentOpenAIThreadId, run.id, {
              tool_outputs: toolOutputs,
            });
          }
        }
      } else if (['failed', 'cancelled', 'expired'].includes(run.status)) {
        console.error(`Chat API - Run failed for User ${authenticatedUser.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}: ${run.status}`, run.last_error);
        throw new Error(`AI processing failed: ${run.status} - ${run.last_error?.message || 'Unknown error from AI'}`);
      }
    }

    if (run.status !== 'completed') {
      console.error(`Chat API - Run timed out for User ${authenticatedUser.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}`);
      throw new Error('AI response timed out. Please try sending your message again.');
    }

    // 8. Retrieve Assistant's Response
    const messagesResponse = await openai.beta.threads.messages.list(currentOpenAIThreadId, { order: 'desc', limit: 10 });
    
    let assistantReply = "I'm not quite sure how to respond to that at the moment. Could you try rephrasing or asking something else?";
    // @ts-ignore is used here because OpenAI's content array can be complex.
    // A more robust solution would involve checking content array item types.
    if (messagesResponse.data.length > 0 && messagesResponse.data[0].role === 'assistant' && messagesResponse.data[0].content[0]?.type === 'text') {
        // @ts-ignore
        assistantReply = messagesResponse.data[0].content[0].text.value;
    }

    // 9. Save Assistant Message to Supabase DB
    const { error: assistantMsgInsertError } = await supabaseAdmin.from('messages').insert([
      { conversation_id: currentConversationDbId, role: 'assistant', content: assistantReply },
    ]);
    if (assistantMsgInsertError) {
        console.error('Chat API - DB Error saving assistant message:', assistantMsgInsertError.message);
        // User gets the reply, but it's not saved. Decide if this needs more handling.
    }

    // 10. Send Response to Frontend
    // Ensure the structure here matches your `ChatServiceResponse` type from `@/types`
    return res.status(200).json({
      result: assistantReply, // Changed 'reply' to 'result' to match ChatServiceResponse
      openai_thread_id: currentOpenAIThreadId, // Non-null assertion removed as it's checked earlier
      conversation_db_id: String(currentConversationDbId), // Convert to string to match ChatServiceResponse
      explanation: "Response from AI Companion."
    });

  } catch (error: any) {
    const userIdForLog = authenticatedUser ? authenticatedUser.id : 'unauthenticated_or_early_error';
    console.error(`Chat API - Overall Error for User ${userIdForLog}:`, error.message, error.stack);
    return res.status(500).json({ error: { message: error.message || 'Internal server error in chat API' } });
  }
}
