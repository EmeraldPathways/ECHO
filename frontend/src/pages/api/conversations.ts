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
