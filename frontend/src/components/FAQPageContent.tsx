// src/components/FAQPageContent.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const FAQPageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>FAQ | AI Companion</title>
        <meta name="description" content="Frequently Asked Questions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <NavBar />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow w-full max-w-3xl flex flex-col items-center py-4 sm:py-16 px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">Frequently Asked Questions</h1>
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Q: What is EchoTherapy?</h2>
            <p className="mb-4">
              A: EchoTherapy is an AI-powered companion designed to provide supportive listening and assist you in navigating your thoughts and emotions. It offers a non-judgmental space for you to express yourself freely.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Q: Is EchoTherapy a substitute for professional therapy?</h2>
            <p className="mb-4">
              A: No, EchoTherapy is not a replacement for professional medical advice, diagnosis, or treatment. It is intended for supportive listening and informational purposes only. If you are in crisis or require professional help, please consult a qualified healthcare provider.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Q: How does EchoTherapy ensure my privacy?</h2>
            <p className="mb-4">
              A: We are committed to protecting your privacy. Please refer to our detailed Privacy Policy for information on how we collect, use, and safeguard your personal information.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Q: Is my data secure?</h2>
            <p className="mb-4">
              A: We implement administrative, technical, and physical security measures to help protect your personal information. While we strive for absolute security, no method of transmission over the Internet or method of electronic storage is 100% secure. For more details, please see our Privacy Policy.
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

export default FAQPageContent;
