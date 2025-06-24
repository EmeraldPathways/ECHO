// src/components/AboutUsPageContent.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const AboutUsPageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>About Us | AI Companion</title>
        <meta name="description" content="Learn more about us" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <NavBar />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow w-full max-w-3xl flex flex-col items-center py-4 sm:py-16 px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">About Us</h1>
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Our Mission</h2>
            <p className="mb-4">
              At EchoTherapy, our mission is to provide accessible, empathetic, and confidential AI-powered support to individuals navigating their thoughts and emotions. We believe that everyone deserves a space to be heard and understood, and our AI companion is designed to offer just that—a caring presence to listen without judgment.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Our Team</h2>
            <p className="mb-4">
              We are a dedicated team of AI developers, mental wellness advocates, and designers passionate about leveraging technology for good. Our diverse backgrounds enable us to create an AI companion that is not only technologically advanced but also deeply attuned to the nuances of human emotion and communication.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Our Vision</h2>
            <p className="mb-4">
              We envision a future where supportive listening is readily available to everyone, everywhere. Through continuous innovation and a commitment to ethical AI development, we aim to be a leading resource in digital mental wellness, fostering a community where individuals feel empowered to explore their inner world.
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

export default AboutUsPageContent;
