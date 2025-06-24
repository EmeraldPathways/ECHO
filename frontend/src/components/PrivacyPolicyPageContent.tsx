// src/components/PrivacyPolicyPageContent.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const PrivacyPolicyPageContent: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | AI Companion</title>
        <meta name="description" content="Our Privacy Policy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-24">
        <NavBar />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

        <main className="flex-grow w-full max-w-3xl flex flex-col items-center py-4 sm:py-16 px-4 sm:px-0 animate-fade-in text-gray-800">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 text-primary-700">Privacy Policy</h1>
          <section className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Introduction</h2>
            <p className="mb-4">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Information We Collect</h2>
            <p className="mb-4">
              We may collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
            </p>
            <p className="mb-4">
              The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li><strong>Name and Contact Data:</strong> We collect your first and last name, email address, postal address, phone number, and other similar contact data.</li>
              <li><strong>Credentials:</strong> We collect passwords, password hints, and similar security information used for authentication and account access.</li>
              <li><strong>Usage Data:</strong> Information about how and when you use our services.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">How We Use Your Information</h2>
            <p className="mb-4">
              We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Disclosure of Your Information</h2>
            <p className="mb-4">
              We may share information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance.
            </p>
            <h2 className="text-2xl font-semibold mb-4 text-primary-600">Security of Your Information</h2>
            <p className="mb-4">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
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

export default PrivacyPolicyPageContent;
