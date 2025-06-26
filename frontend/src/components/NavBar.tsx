// TEMPORARY MINIMAL TEST CONTENT for src/components/NavBar.tsx
import React from 'react';
import Link from 'next/link';

const NavBar: React.FC = () => {
  return (
    <nav style={{ padding: '1rem', background: '#eee', borderBottom: '1px solid #ccc' }}>
      <Link href="/" style={{ marginRight: '1rem' }}>
        Minimal Home
      </Link>
      <Link href="/contact" style={{ marginRight: '1rem' }}>
        Minimal Contact
      </Link>
      <span>Minimal NavBar Test</span>
    </nav>
  );
};

export default NavBar;
