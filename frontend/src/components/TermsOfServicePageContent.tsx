// src/components/TermsOfServicePageContent.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const TermsOfServicePageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>Terms of Service | AI Companion</title>
        <meta name="description" content="Our Terms of Service" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <NavBar />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow w-full max-w-3xl flex flex-col items-center py-4 sm:py-16 px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">Terms of Service</h1>
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using our AI Companion application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">2. Use of Service</h2>
            <p className="mb-4">
              Our AI Companion is designed to provide supportive listening and is not a substitute for professional medical advice, diagnosis, or treatment. It is intended for informational and recreational purposes only.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">3. User Responsibilities</h2>
            <p className="mb-4">
              You are responsible for your use of the application and for any content you provide. You agree not to use the application for any unlawful or prohibited activities.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">4. Disclaimer of Warranties</h2>
            <p className="mb-4">
              The application is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or usefulness of the information provided by the AI.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">5. Limitation of Liability</h2>
            <p className="mb-4">
              We shall not be liable for any damages arising from your use or inability to use the application. Your sole remedy for dissatisfaction with the application is to stop using it.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">6. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms of Service at any time. Your continued use of the application after such modifications constitutes your acceptance of the revised terms.
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

export default TermsOfServicePageContent;
