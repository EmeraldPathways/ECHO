// src/pages/terms-of-service.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const TermsOfServiceContent = dynamic(
  () => import('@/components/TermsOfServicePageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const TermsOfServiceContainer: React.FC = () => {
  return <TermsOfServiceContent />;
};

export default TermsOfServiceContainer;
