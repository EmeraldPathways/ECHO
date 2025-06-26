// TEMPORARY MINIMAL STATIC PAGE for src/pages/contact.tsx
import React from 'react';
import Head from 'next/head';

// NO NavBar, NO dynamic import, NO complex components

const MinimalContactPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Contact Test</title>
      </Head>
      <div>
        <h1>Minimal Contact Page</h1>
        <p>This is a test to see if the build passes for /contact.</p>
      </div>
    </>
  );
};

export default MinimalContactPage;
