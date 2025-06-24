// TEMPORARY TEST VERSION of src/components/NavBar.tsx
import React from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useAuth } from '@/components/AuthProvider';
// import HamburgerMenuIcon from '@/components/icons/HamburgerMenu';

const NavBar: React.FC = () => {
  // const { user, loading, signOut } = useAuth();
  // const [isOpen, setIsOpen] = useState(false);
  // const [currentPath, setCurrentPath] = useState('');
  // const router = useRouter();

  // useEffect(() => {
  //   if (router.isReady) {
  //     setCurrentPath(router.pathname);
  //   }
  // }, [router.isReady, router.pathname]);

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" legacyBehavior>
              <a>
                <img src="/icons/Echo Logo.png" alt="EchoTherapy Logo" className="h-16 w-auto" />
              </a>
            </Link>
          </div>
          <div>NAVBAR TEST</div> {/* Minimal content */}
        </div>
      </div>
    </nav>
  );
};
export default NavBar;
