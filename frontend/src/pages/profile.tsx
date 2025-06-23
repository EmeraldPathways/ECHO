import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import ConversationsList from '@/components/ConversationsList'; // Ensure this path is correct
// ChatWindow is not directly used in this part of the logic, but keep if needed elsewhere
// import ChatWindow from '@/components/ChatWindow';
import type { Message as UIMessage, Conversation as DBConversation } from '@/types'; // DBConversation is your Conversation type
import { supabase } from '@/lib/supabaseClient'; // Assuming this is your configured Supabase client for frontend
import { fetchConversationMessages } from '@/services/api'; // Assuming this service exists and is correct

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, signOut, session } = useAuth(); // Get session from useAuth
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'personalInfo' | 'conversationHistory' | 'account'>('personalInfo');

  // State for the list of all conversations
  const [dbConversations, setDbConversations] = useState<DBConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const [selectedConversation, setSelectedConversation] = useState<{
    dbId: number | null;
    openaiThreadId: string | null | undefined;
    title: string | null | undefined;
    messages: UIMessage[];
  } | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [user, authLoading, router]);

  // Fetch all conversations for the conversation history tab
  useEffect(() => {
    const loadConversations = async () => {
      if (user && session?.access_token && activeTab === 'conversationHistory') {
        setIsLoadingConversations(true);
        try {
          const response = await fetch('/api/conversations', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch conversations');
          }
          const data: DBConversation[] = await response.json();
          setDbConversations(data || []);
        } catch (error) {
          console.error("Error fetching conversations list:", error);
          setDbConversations([]); // Set to empty on error
        } finally {
          setIsLoadingConversations(false);
        }
      }
    };

    // Load conversations when the tab becomes active and user/session are available
    if (activeTab === 'conversationHistory') {
        loadConversations();
    } else {
        // Optionally clear or don't load if tab is not active
        // setDbConversations([]); 
    }
  }, [user, session, activeTab]); // Dependencies for fetching conversations

  const handleSelectConversation = useCallback(async (
    dbId: number,
    openaiThreadId: string | null | undefined,
    title: string | null | undefined
  ) => {
    setIsLoadingChat(true);
    setSelectedConversation(null);

    if (!session?.access_token) {
      console.error("No access token for fetching messages.");
      setIsLoadingChat(false);
      return;
    }

    try {
      const fetchedMessages = await fetchConversationMessages(dbId, session.access_token);
      const uiMessages: UIMessage[] = (fetchedMessages || []).map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.role as 'user' | 'bot',
        created_at: msg.created_at,
      }));

      setSelectedConversation({
        dbId,
        openaiThreadId,
        title: title || "Conversation",
        messages: uiMessages,
      });
    } catch (error) {
      console.error("Error loading selected conversation messages:", error);
      setSelectedConversation(null);
    } finally {
      setIsLoadingChat(false);
    }
  }, [session]); // Added session to dependency array

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (authLoading || !user) { // Changed 'loading' to 'authLoading' for clarity
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Loading profile page...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Profile | AI Companion</title>
        <meta name="description" content="Manage your AI Companion profile." />
      </Head>
      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <NavBar />

        <main className="flex-grow w-full container mx-auto px-4 py-8 sm:py-12">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'personalInfo' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => { setSelectedConversation(null); setActiveTab('personalInfo'); }}
              >
                Personal Information
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'conversationHistory' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => { setSelectedConversation(null); setActiveTab('conversationHistory'); }}
              >
                Conversation History
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'account' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => { setSelectedConversation(null); setActiveTab('account'); }}
              >
                Account
              </button>
            </div>

            <div className="mt-8">
              {activeTab === 'personalInfo' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <ProfileForm />
                </div>
              )}

              {activeTab === 'account' && (
                <div className="bg-white p-6 rounded-lg shadow space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Account Usage</h2>
                    <div className="space-y-4">
                      <p className="text-lg text-gray-700">
                        Messages left: <span className="font-bold text-blue-600">0</span>
                      </p>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                        Buy More Messages
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ml-4">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Account Settings</h2>
                    <ul className="space-y-4">
                      <li><Link href="/help" className="text-blue-600 hover:underline">Help & FAQ</Link></li>
                      <li><Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link></li>
                      <li><Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
                      <li><button className="text-red-600 hover:underline focus:outline-none">Delete Account</button></li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'conversationHistory' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  {isLoadingChat && ( // This is for loading individual chat messages
                    <div className="text-center p-10 text-gray-600">Loading chat messages...</div>
                  )}
                  {!isLoadingChat && selectedConversation ? (
                    <div className="flex flex-col h-[calc(100vh-25rem)]">
                      <div className="mb-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-700 truncate">
                          Viewing: {selectedConversation.title}
                        </h2>
                        <button
                          onClick={handleBackToList}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          ← Back to Conversation List
                        </button>
                      </div>
                      <div className="flex-grow overflow-y-auto p-4 border rounded-md bg-gray-50">
                        {selectedConversation.messages.map((message, index) => (
                          <div key={message.id || index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className="font-semibold">{message.sender === 'user' ? 'You' : 'AI Companion'}: </span>
                            <span>{message.text}</span>
                            {message.created_at && <div className="text-xs text-gray-400">{new Date(message.created_at).toLocaleString()}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isLoadingConversations ? ( // Show loading for the list
                     <div className="text-center p-10 text-gray-600">Loading conversation history...</div>
                  ) : (
                    // --- FIX APPLIED HERE ---
                    <ConversationsList
                      conversations={dbConversations} // Pass the fetched conversations
                      onSelectConversation={handleSelectConversation}
                      currentConversationDbId={selectedConversation?.dbId} // Optional: for highlighting
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

         <footer className="w-full py-4 sm:py-6 text-center text-xs sm:text-sm text-gray-500 border-t border-gray-200">
          <p>AI Companion © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
};

export default ProfilePage;
