import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { Conversation } from '@/types'; // Your defined types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is not defined in API route.");
}
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Conversation[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 1. Authenticate the user
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }
  const token = authHeader.split(' ')[1];

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    console.error('Conversations API - Auth Error:', authError?.message);
    return res.status(401).json({ error: authError?.message || 'Invalid or expired token' });
  }

  // 2. Fetch conversations for the authenticated user
  try {
    const { data: conversations, error: dbError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        user_id,
        openai_thread_id,
        title,
        created_at,
        updated_at
      `) // Select specific fields
      // Optionally, you could also fetch the latest message for each conversation here
      // or a count of messages, but that makes the query more complex.
      // Example for fetching latest message (more advanced query):
      // .select('*, messages(content, timestamp, order(timestamp, desc), limit(1))')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }); // Show most recent first

    if (dbError) {
      console.error('Conversations API - DB Error (GET):', dbError.message);
      throw dbError;
    }

    return res.status(200).json(conversations || []);

  } catch (error: any) {
    console.error('Conversations API - GET Error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch conversations' });
  }
}
```**Note on fetching messages with conversations:** The commented-out part in the `select` shows how you *could* fetch the latest message. However, fetching *all* messages for *all* conversations in one go can be inefficient if there are many messages. It's often better to fetch the list of conversations first, and then when a user clicks on a specific conversation, fetch the messages for *that* conversation. We can add another endpoint for that if needed, or modify `chat.ts` to also fetch history for an existing `conversation_db_id`.

---

**`ai-companion-vercel/src/pages/api/chat.ts`**

This is the most complex one, integrating Supabase auth, your Supabase DB for message storage, and the OpenAI Assistants API. This is based on the conceptual version from our previous discussion.

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { ChatServiceResponse, ChatServiceRequest } from '@/types'; // Your defined types
import { User } from '@supabase/supabase-js'; // For typing the user object

// --- Environment Variables ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.OPENAI_ASSISTANT_ID;

if (!supabaseUrl || !supabaseServiceRoleKey || !openAIApiKey || !assistantId) {
  console.error("One or more critical environment variables are missing for /api/chat");
  // This will cause an error on server start if not handled, which is good.
  throw new Error("Server configuration error: Missing critical environment variables.");
}

// --- Initialize Clients ---
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
const openai = new OpenAI({ apiKey: openAIApiKey });


// --- Placeholder for your Trusted Data Source & Function Implementation ---
// In a real app, this would be a database, API, or file system access.
const TRUSTED_KNOWLEDGE_BASE = {
    "stress": {
        "definition": "Stress is a feeling of emotional or physical tension. It can come from any event or thought that makes you feel frustrated, angry, or nervous. Stress is your body's reaction to a challenge or demand. In short bursts, stress can be positive, such as when it helps you avoid danger or meet a deadline. But when stress lasts for a long time, it may harm your health.",
        "common_feelings": "Common feelings associated with stress include worry, irritability, being overwhelmed, or difficulty concentrating."
    },
    "mindfulness": {
        "definition": "Mindfulness is a type of meditation in which you focus on being intensely aware of what you're seeing and feeling in the moment, without interpretation or judgment. Practicing mindfulness involves breathing methods, guided imagery, and other practices to relax the body and mind and help reduce stress.",
        "general_note": "Many people explore mindfulness as a way to become more aware of their thoughts and feelings."
    }
    // ... Add more pre-vetted, safe, non-prescriptive topics
};

async function execute_get_general_information_on_topic(topic: string): Promise<string> {
  console.log(`[Function Call] Executing get_general_information_on_topic for: ${topic}`);
  const topicLower = topic.toLowerCase();
  const article = TRUSTED_KNOWLEDGE_BASE[topicLower as keyof typeof TRUSTED_KNOWLEDGE_BASE];
  if (article) {
    // Combine relevant parts, ensure it's brief and non-prescriptive
    return article.definition + (article.general_note ? " " + article.general_note : "");
  }
  return `I don't have specific pre-approved general information on '${topic}' right now.`;
}
// --- End of Placeholder & Function Implementation ---


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatServiceResponse | { error: string | { message: string } }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  let user: User | null = null;
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
    user = authData.user;

    // 2. Get User Input
    const { text: userMessageContent, thread_id: existingOpenAIThreadId, conversation_db_id: existingConversationDbId } = req.body as ChatServiceRequest;

    if (!userMessageContent) {
      return res.status(400).json({ error: 'Message content (text) is required' });
    }

    let currentOpenAIThreadId = existingOpenAIThreadId;
    let currentConversationDbId = existingConversationDbId;

    // 3. Manage OpenAI Thread
    if (!currentOpenAIThreadId) {
      const thread = await openai.beta.threads.create();
      currentOpenAIThreadId = thread.id;
      console.log(`Chat API - Created new OpenAI thread: ${currentOpenAIThreadId} for user ${user.id}`);
    }

    // 4. Add User Message to OpenAI Thread
    await openai.beta.threads.messages.create(currentOpenAIThreadId, {
      role: 'user',
      content: userMessageContent,
    });

    // 5. Create and Run Assistant on the Thread
    // System prompt is configured on the Assistant object in OpenAI dashboard
    let run = await openai.beta.threads.runs.create(currentOpenAIThreadId, {
      assistant_id: assistantId,
    });

    // 6. Poll for Run Completion & Handle Tool Calls
    const maxPollAttempts = 30;
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      run = await openai.beta.threads.runs.retrieve(currentOpenAIThreadId, run.id);

      console.log(`Chat API - User ${user.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}, Status: ${run.status}`);

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
              console.warn(`Chat API - Unknown function called: ${functionName}`);
              output = `Function ${functionName} is not implemented.`;
            }
            toolOutputs.push({ tool_call_id: toolCall.id, output });
          }
          await openai.beta.threads.runs.submit_tool_outputs(currentOpenAIThreadId, run.id, {
            tool_outputs: toolOutputs,
          });
        }
      } else if (['failed', 'cancelled', 'expired'].includes(run.status)) {
        console.error(`Chat API - Run failed for User ${user.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}: ${run.status}`, run.last_error);
        throw new Error(`AI processing failed: ${run.status} - ${run.last_error?.message || 'Unknown error'}`);
      }
    }

    if (run.status !== 'completed') {
      console.error(`Chat API - Run timed out for User ${user.id}, Thread ${currentOpenAIThreadId}, Run ${run.id}`);
      throw new Error('AI response timed out.');
    }

    // 7. Retrieve Assistant's Response
    const messagesResponse = await openai.beta.threads.messages.list(currentOpenAIThreadId, { order: 'desc', limit: 10 });
    const assistantMessage = messagesResponse.data
      .find(m => m.role === 'assistant' && m.run_id === run.id && m.content[0]?.type === 'text');
    
    // @ts-ignore
    const assistantReply = assistantMessage ? assistantMessage.content[0].text.value : "I'm not quite sure how to respond to that. Could you try rephrasing?";

    // 8. Save to Supabase Database
    if (!currentConversationDbId) {
      // Create new conversation record in your DB
      const { data: newConversation, error: convInsertError } = await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: user.id,
          openai_thread_id: currentOpenAIThreadId, // Link OpenAI thread to your DB record
          title: userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? '...' : ''),
        })
        .select('id')
        .single();
      if (convInsertError) throw convInsertError;
      currentConversationDbId = newConversation!.id;
    } else {
      // Update existing conversation's updated_at timestamp
      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationDbId)
        .eq('user_id', user.id); // Ensure user owns this conversation
    }

    // Save user message and assistant reply
    const { error: msgInsertError } = await supabaseAdmin.from('messages').insert([
      { conversation_id: currentConversationDbId, role: 'user', content: userMessageContent },
      { conversation_id: currentConversationDbId, role: 'assistant', content: assistantReply },
    ]);
    if (msgInsertError) throw msgInsertError;

    // 9. Send Response to Frontend
    return res.status(200).json({
      reply: assistantReply,
      openai_thread_id: currentOpenAIThreadId,
      conversation_db_id: currentConversationDbId,
      explanation: "Response from AI Companion."
    });

  } catch (error: any) {
    console.error('Full Chat API error:', error);
    // Ensure user is defined before trying to access user.id for logging, if auth failed early
    const userIdForLog = user ? user.id : 'unknown';
    console.error(`Chat API - Error for User ${userIdForLog}:`, error.message, error.stack);
    return res.status(500).json({ error: { message: error.message || 'Internal server error' } });
  }
}
