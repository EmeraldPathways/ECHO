   import React, { useEffect } from 'react';
   import Head from 'next/head';
   import { useRouter } from 'next/router';
   import ChatWindow from '@/components/ChatWindow';
   import { useAuth } from '@/components/AuthProvider';
   import Link from 'next/link';
   import NavBar from '@/components/NavBar';
   import InteractiveDemo from '@/components/InteractiveDemo';

   const HomePageContent: React.FC = () => {
     const { user, loading, signOut } = useAuth();
     const router = useRouter();

     useEffect(() => {
       if (!loading && !user) {
         // router.replace('/login');
       }
     }, [user, loading, router]);

     if (loading) {
       return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <div className="text-lg text-gray-700">Loading application...</div>
         </div>
       );
     }

     return (
       <>
         <Head>
           <title>AI Companion | Chat</title>
           <meta name="description" content="Chat with your AI Mental Health Companion."/>
           <meta name="viewport" content="width=device-width, initial-scale=1" />
           <link rel="icon" href="/favicon.ico" />
         </Head>
         <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
           <NavBar />
           <div className="flex-grow w-full flex flex-col items-center py-4 sm:py-16 px-2 sm:px-0 animate-fade-in">
             <header className="mb-4 sm:mb-6 text-center"></header>
             <main className="w-full max-w-3xl flex-grow flex flex-col mb-8">
               {user ? (<ChatWindow />) : (<div className="flex flex-col items-center w-full max-w-xl mx-auto"><InteractiveDemo /></div>)}
             </main>
           </div>
           <footer className="w-full py-6 sm:py-8 bg-gray-100 text-center text-xs sm:text-sm text-gray-600 border-t border-gray-200">
             <div className="max-w-3xl mx-auto px-4">
               <p className="font-medium mb-2">Disclaimer: This AI tool is for supportive listening only...</p>
               <p className="mb-3">If you are in crisis, please contact emergency services or a crisis hotline.</p>
               <div className="flex justify-center space-x-6 mb-3">
                 <Link href="/privacy-policy" className="text-blue-700 hover:underline">Privacy Policy</Link>
                 <Link href="/cookie-policy" className="text-blue-700 hover:underline">Cookie Policy</Link>
                 <Link href="/terms-of-service" className="text-blue-700 hover:underline">Terms of Service</Link>
               </div>
               <p className="text-gray-500">© {new Date().getFullYear()} EchoTherapy. All rights reserved.</p>
             </div>
           </footer>
         </div>
       </>
     );
   };
   export default HomePageContent;
