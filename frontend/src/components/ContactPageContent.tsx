// src/components/ContactPageContent.tsx
import React from 'react';
import Head from 'next/head';
import NavBar from '@/components/NavBar';

const ContactPageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>Contact Us | AI Companion</title>
        <meta name="description" content="Contact the AI Companion team" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-32">
        <NavBar />
        <div className="h-16 w-full"></div> {/* Spacer div to clear the fixed NavBar */}
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow flex flex-col items-center w-full max-w-3xl px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">Contact Us</h1>
          
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <p className="text-gray-600 mb-4">
              Have questions or feedback? We'd love to hear from you.
            </p>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Email</h2>
                <p className="text-gray-600">support@aicompanion.com</p>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900">Hours</h2>
                <p className="text-gray-600">Monday - Friday: 9am - 5pm EST</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ContactPageContent;
