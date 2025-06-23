import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Removed StoredMessage as it's not used here and caused a previous error
import type { ChatServiceResponse, ChatServiceRequest } from '@/types';
import type { User } from '@supabase/supabase-js';
// Removed unused import: import { json } from 'stream/consumers';

// --- Environment Variables ---
const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAIApiKey: string | undefined = process.env.OPENAI_API_KEY;
const assistantId: string | undefined = process.env.OPENAI_ASSISTANT_ID;

if (!supabaseUrl || !supabaseServiceRoleKey || !openAIApiKey || !assistantId) { // This check is vital
  console.error("CRITICAL: One or more environment variables are missing for /api/chat. App may not function.");
  throw new Error("Server configuration error: Missing critical environment variables for chat API.");
}

// --- Initialize Clients ---
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const openai: OpenAI = new OpenAI({ apiKey: openAIApiKey });

// --- Placeholder for Trusted Data Source & Function Implementation ---
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
    // Ensure this type aligns with your ChatServiceRequest and ChatServiceResponse types for conversation_db_id
    let currentConversationDbId: number | string | null | undefined = existingConversationDbId;


    // 3. Manage OpenAI Thread & Supabase Conversation Record
    // Check if both OpenAI thread ID and our DB conversation ID are missing to determine a new conversation
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
        throw convInsertError;
      }
      currentConversationDbId = newConversation!.id;
      console.log(`Chat API - User ${authenticatedUser.id}: New DB conversation ID ${currentConversationDbId} linked to OpenAI Thread ${currentOpenAIThreadId}`);
    } else if (currentOpenAIThreadId && (typeof currentConversationDbId === 'number' || typeof currentConversationDbId === 'string')) {
      // Existing conversation, update timestamp
      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationDbId)
        .eq('user_id', authenticatedUser.id);
    } else {
        console.error(`Chat API - User ${authenticatedUser.id}: Inconsistent state - OpenAI Thread ID: ${currentOpenAIThreadId}, DB Conversation ID: ${currentConversationDbId}`);
        return res.status(400).json({ error: "Inconsistent conversation state. Please start a new chat." });
    }

    // 4. Add User Message to OpenAI Thread
    await openai.beta.threads.messages.create(currentOpenAIThreadId!, {
      role: 'user',
      content: userMessageContent,
    });

    // 5. Save User Message to Supabase DB
    const { error: userMsgInsertError } = await supabaseAdmin.from('messages').insert([
      { conversation_id: currentConversationDbId, role: 'user', content: userMessageContent },
    ]);
    if (userMsgInsertError) {
        console.error('Chat API - DB Error saving user message:', userMsgInsertError.message);
    }

    // 6. Create and Run Assistant
    let run = await openai.beta.threads.runs.create(currentOpenAIThreadId!, {
      assistant_id: assistantId!, // <--- FIX APPLIED HERE: Non-null assertion
    });

    // 7. Poll for Run Completion & Handle Tool Calls
    const maxPollAttempts = 35;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      run = await openai.beta.threads.runs.retrieve(currentOpenAIThreadId!, run.id);

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
            await openai.beta.threads.runs.submit_tool_outputs(currentOpenAIThreadId!, run.id, {
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
    const messagesResponse = await openai.beta.threads.messages.list(currentOpenAIThreadId!, { order: 'desc', limit: 1 });
    
    let assistantReply = "I'm not quite sure how to respond to that at the moment. Could you try rephrasing or asking something else?";
    // @ts-ignore // OpenAI type for content can be complex array, this simplifies for text content
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
    }

    // 10. Send Response to Frontend
    // Ensure the structure here matches your `ChatServiceResponse` type from `@/types`
    return res.status(200).json({
      reply: assistantReply, // Or 'result' if that's what ChatServiceResponse expects
      openai_thread_id: currentOpenAIThreadId!,
      conversation_db_id: currentConversationDbId!, // Ensure type (number/string) matches ChatServiceResponse
      explanation: "Response from AI Companion."
    });

  } catch (error: any) {
    const userIdForLog = authenticatedUser ? authenticatedUser.id : 'unauthenticated_or_early_error';
    console.error(`Chat API - Overall Error for User ${userIdForLog}:`, error.message, error.stack);
    return res.status(500).json({ error: { message: error.message || 'Internal server error in chat API' } });
  }
}
