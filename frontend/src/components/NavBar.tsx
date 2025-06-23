import React, { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/AuthProvider';
// Assuming UserIcon is not used in this version, if it is, ensure it's imported and used correctly.
// import UserIcon from '@/components/icons/UserIcon';
import HamburgerMenuIcon from '@/components/icons/HamburgerMenu';

const NavBar: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(''); // State to hold the path client-side

  useEffect(() => {
    // Set the current path once the router is ready on the client-side
    if (router.isReady) {
      setCurrentPath(router.pathname);
    }
  }, [router.isReady, router.pathname]); // Update when router becomes ready or path changes

  const handleSignOut = async () => {
    setIsOpen(false); // Close menu on sign out
    await signOut();
    router.push('/login'); // router.push is fine here as it's a user interaction
  };

  // Helper function for active link styling
  const getLinkClassName = (path: string, baseStyle: string, activeStyle: string) => {
    return `${baseStyle} ${currentPath === path ? activeStyle : ''}`;
  };

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" legacyBehavior>
              <a className="font-bold text-xl text-blue-600 hover:text-blue-700">
                <img src="/icons/Echo Logo.png" alt="EchoTherapy Logo" className="h-16 w-auto" />
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {!user && !loading && (
              <>
                <Link href="/login" legacyBehavior>
                  <a className={getLinkClassName(
                    '/login',
                    'text-sm font-medium px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'bg-blue-700 text-white' // Active style for login (can be same as base if always highlighted)
                  )}>
                    Login
                  </a>
                </Link>
                <Link href="/signup" legacyBehavior>
                  <a className={getLinkClassName(
                    '/signup',
                    'text-sm font-medium px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'border-blue-700 text-blue-700 bg-blue-50' // Active style for signup
                  )}>
                    Sign Up
                  </a>
                </Link>
              </>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              <HamburgerMenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="absolute top-16 left-0 w-full bg-white shadow-lg z-10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && !loading ? (
              <>
                <Link href="/profile" legacyBehavior>
                  <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                    '/profile',
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'text-blue-700 bg-blue-50'
                  )}>
                    Profile
                  </a>
                </Link>
                <Link href="/past-conversations" legacyBehavior>
                  <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                    '/past-conversations',
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'text-blue-700 bg-blue-50'
                  )}>
                    History
                  </a>
                </Link>
                <Link href="/about-us" legacyBehavior>
                  <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                    '/about-us',
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'text-blue-700 bg-blue-50'
                  )}>
                    About Us
                  </a>
                </Link>
                <Link href="/faq" legacyBehavior>
                  <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                    '/faq',
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'text-blue-700 bg-blue-50'
                  )}>
                    FAQ
                  </a>
                </Link>
                <Link href="/contact" legacyBehavior>
                  <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                    '/contact',
                    'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                    'text-blue-700 bg-blue-50'
                  )}>
                    Contact Us
                  </a>
                </Link>
                <button
                  onClick={handleSignOut} // setIsOpen(false) is now in handleSignOut
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 hover:text-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              !loading && (
                <>
                  <Link href="/about-us" legacyBehavior>
                    <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                      '/about-us',
                      'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                      'text-blue-700 bg-blue-50'
                    )}>
                      About Us
                    </a>
                  </Link>
                  <Link href="/faq" legacyBehavior>
                    <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                      '/faq',
                      'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                      'text-blue-700 bg-blue-50'
                    )}>
                      FAQ
                    </a>
                  </Link>
                  <Link href="/contact" legacyBehavior>
                    <a onClick={() => setIsOpen(false)} className={getLinkClassName(
                      '/contact',
                      'block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                      'text-blue-700 bg-blue-50'
                    )}>
                      Contact Us
                    </a>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
