// src/pages/signup.tsx (NEW FILE)
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the actual signup page content, disabling SSR
const SignupPageContent = dynamic(
  () => import('@/components/SignupFormPage'), // Ensure this path is correct
  { ssr: false } // This is the crucial part
);

const SignupPageContainer: React.FC = () => {
  return <SignupPageContent />;
};

export default SignupPageContainer;
