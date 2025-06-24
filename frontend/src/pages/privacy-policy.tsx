// src/pages/privacy-policy.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const PrivacyPolicyContent = dynamic(
  () => import('@/components/PrivacyPolicyPageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const PrivacyPolicyContainer: React.FC = () => {
  return <PrivacyPolicyContent />;
};

export default PrivacyPolicyContainer;
