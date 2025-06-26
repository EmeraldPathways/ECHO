// src/pages/index.tsx
import dynamic from 'next/dynamic'; // <--- ADD THIS IMPORT
import React from 'react';

const HomePageContent = dynamic(
  () => import('@/components/HomePageContent'), // Ensure this path is correct
  { ssr: false }
);

const IndexPageContainer: React.FC = () => {
  return <HomePageContent />;
};

export default IndexPageContainer;
