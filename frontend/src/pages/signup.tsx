// src/pages/signup.tsx (This is the DYNAMIC WRAPPER)
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the actual signup page content, disabling SSR
const SignupPageContent = dynamic(
  () => import('@/pages/SignupFormPage'), // <--- CORRECTED PATH HERE
  { ssr: false }
);

const SignupPageContainer: React.FC = () => {
  return <SignupPageContent />;
};

export default SignupPageContainer;
