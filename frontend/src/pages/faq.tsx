// src/pages/faq.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const FAQContent = dynamic(
  () => import('@/components/FAQPageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const FAQContainer: React.FC = () => {
  return <FAQContent />;
};

export default FAQContainer;
