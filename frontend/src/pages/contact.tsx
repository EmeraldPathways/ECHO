// src/pages/contact.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const ContactContent = dynamic(
  () => import('@/components/ContactPageContent'), // This path should be correct
  { ssr: false } // This disables server-side rendering for the component
);

const ContactContainer: React.FC = () => {
  return <ContactContent />;
};

export default ContactContainer;
