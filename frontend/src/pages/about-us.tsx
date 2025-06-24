// src/pages/about-us.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const AboutUsContent = dynamic(
  () => import('@/components/AboutUsPageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const AboutUsContainer: React.FC = () => {
  return <AboutUsContent />;
};

export default AboutUsContainer;
