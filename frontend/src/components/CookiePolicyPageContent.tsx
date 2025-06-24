// src/components/CookiePolicyPageContent.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const CookiePolicyPageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>Cookie Policy | AI Companion</title>
        <meta name="description" content="Our Cookie Policy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <NavBar />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow w-full max-w-3xl flex flex-col items-center py-4 sm:py-16 px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">Cookie Policy</h1>
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">What are Cookies?</h2>
            <p className="mb-4">
              Cookies are small pieces of data stored on your device (computer or mobile device) when you visit a website. They are widely used to "remember" you and your preferences, either for a single visit (through a "session cookie") or for multiple repeat visits (using a "persistent cookie").
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">How We Use Cookies</h2>
            <p className="mb-4">
              We use cookies to enhance your experience, understand how our services are used, and for security purposes. This helps us to improve our website and provide a more personalized experience.
            </p>
            <p className="mb-4">
              Specifically, we use cookies for:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li><strong>Authentication:</strong> To identify you when you sign in and keep you logged in.</li>
              <li><strong>Security:</strong> To detect and prevent fraudulent activity.</li>
              <li><strong>Performance and Analytics:</strong> To understand how our services are performing and how users interact with them.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Your Choices</h2>
            <p className="mb-4">
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
            </p>
          </section>
        </main>
        <footer className="w-full py-6 sm:py-8 bg-gray-100 text-center text-xs sm:text-sm text-gray-600 border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4">
            <p className="font-medium mb-2">
              Disclaimer: This AI tool is for supportive listening only. It is not a replacement for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="mb-3">
              If you are in crisis, please contact emergency services or a crisis hotline.
            </p>
            <div className="flex justify-center space-x-6 mb-3">
              <Link href="/privacy-policy" className="text-blue-700 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="text-blue-700 hover:underline">
                Cookie Policy
              </Link>
              <Link href="/terms-of-service" className="text-blue-700 hover:underline">
                Terms of Service
              </Link>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} EchoTherapy. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CookiePolicyPageContent;
