// This should be the content of your src/types/index.ts (or similar main types file)

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  model?: string; // e.g., "AI Companion"
  explanation?: string;
  created_at?: string; // Add created_at for sorting and display
}

// This type is no longer used to select different models in the UI
// export type AiModel = "mentallama";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  location?: string;
  message_count?: number;
  profile_picture_url?: string | null; // Allow null for profile picture URL
  updated_at?: string; // <--- THIS IS THE LINE YOU NEED TO ADD/MODIFY
  // Add other fields as needed
}

export interface Conversation {
  id: string;
  user_id: string;
  openai_thread_id: string;
  title: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface ChatServiceRequest {
  text: string;
  thread_id: string | null;
  conversation_db_id: string | null; // Ensure this matches what your components send
}

export interface ChatServiceResponse {
  result: string;
  openai_thread_id: string;
  conversation_db_id: string; // This expects a string, ensure API sends string
  explanation?: string; // Optional explanation from the AI
}
