// src/pages/cookie-policy.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const CookiePolicyContent = dynamic(
  () => import('@/components/CookiePolicyPageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const CookiePolicyContainer: React.FC = () => {
  return <CookiePolicyContent />;
};

export default CookiePolicyContainer;
