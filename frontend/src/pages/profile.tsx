import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import ConversationsList from '@/components/ConversationsList';
import ChatWindow from '@/components/ChatWindow';
import type { Message as UIMessage, Conversation as DBConversation } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { fetchConversationMessages } from '@/services/api';

const ProfilePage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'personalInfo' | 'conversationHistory' | 'account'>('personalInfo');

  const [selectedConversation, setSelectedConversation] = useState<{
    dbId: number | null;
    openaiThreadId: string | null | undefined;
    title: string | null | undefined;
    messages: UIMessage[];
  } | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  const handleSelectConversation = useCallback(async (
    dbId: number,
    openaiThreadId: string | null | undefined,
    title: string | null | undefined
  ) => {
    setIsLoadingChat(true);
    setSelectedConversation(null); // Clear previous selection while loading

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error("No access token for fetching messages.");
      setIsLoadingChat(false);
      // Optionally show an error to the user
      return;
    }

    try {
      // Fetch messages for this conversation using the API service
      const fetchedMessages = await fetchConversationMessages(dbId, session.access_token);
      console.log("Fetched messages from API:", fetchedMessages);

      const uiMessages: UIMessage[] = (fetchedMessages || []).map(msg => ({
        id: msg.id.toString(), // Use DB message ID
        text: msg.content,
        sender: msg.role as 'user' | 'bot',
        created_at: msg.created_at, // Ensure created_at is passed if available in fetchedMessages
      }));
      console.log("Formatted UI messages:", uiMessages);

      setSelectedConversation({
        dbId,
        openaiThreadId,
        title: title || "Conversation",
        messages: uiMessages,
      });
    } catch (error) {
      console.error("Error loading selected conversation messages:", error);
      // Handle error (e.g., show a notification to the user)
      setSelectedConversation(null); // Clear selection on error
    } finally {
      setIsLoadingChat(false);
    }
  }, []);

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (loading || !user) {
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
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        {/* Navigation Bar (same as index.tsx) */}
        <NavBar />

        <main className="flex-grow w-full container mx-auto px-4 py-8 sm:py-12">
          <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'personalInfo' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('personalInfo')}
              >
                Personal Information
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'conversationHistory' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('conversationHistory')}
              >
                Conversation History
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'account' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === 'personalInfo' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <ProfileForm />
                </div>
              )}

              {activeTab === 'account' && (
                <div className="bg-white p-6 rounded-lg shadow space-y-8">
                  {/* Account Usage Section */}
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

                  {/* Account Settings Section */}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Account Settings</h2>
                    <ul className="space-y-4">
                      <li>
                        <Link href="/help" className="text-blue-600 hover:underline">
                          Help & FAQ
                        </Link>
                      </li>
                      <li>
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <button className="text-red-600 hover:underline focus:outline-none">
                          Delete Account
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'conversationHistory' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  {isLoadingChat && (
                    <div className="text-center p-10 text-gray-600">Loading chat messages...</div>
                  )}
                  {!isLoadingChat && selectedConversation ? (
                    <div className="flex flex-col h-[calc(100vh-25rem)]"> {/* Adjust height as needed for tabs */}
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
                      {/* Display messages as plain text */}
                      <div className="flex-grow overflow-y-auto p-4 border rounded-md bg-gray-50">
                        {selectedConversation.messages.map((message, index) => (
                          <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className="font-semibold">{message.sender === 'user' ? 'You' : 'AI Companion'}: </span>
                            <span>{message.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !isLoadingChat && <ConversationsList onSelectConversation={handleSelectConversation} />
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