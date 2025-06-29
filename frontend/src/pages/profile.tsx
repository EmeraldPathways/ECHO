// src/pages/profile.tsx (NEW DYNAMIC WRAPPER)
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the actual profile page content, disabling SSR
const ProfilePageContent = dynamic(
  () => import('@/components/ProfilePageContent'), // Ensure this path is correct
  { ssr: false } // This is the crucial part
);

const ProfilePageContainer: React.FC = () => {
  // You could add a basic loading state here if desired,
  // though ProfilePageContent itself has a loading state.
  return <ProfilePageContent />;
};

export default ProfilePageContainer;
