import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/router';
import { useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import Link from 'next/link'; // Import Link for the "Sign in" link

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signUp, user, loading: authLoading } = useAuth(); // Get user and authLoading
  const router = useRouter();
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user && router.isReady) { // Check router.isReady here too
      router.replace('/'); // Or dashboard
    }
  }, [user, authLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await signUp(email, password);
      setSuccess('Signup successful! Please check your email to confirm your account.');
      // Optionally, redirect to login after a delay:
      // if (router.isReady) { // Good practice to check if router is ready
      //   setTimeout(() => router.push('/login'), 2000);
      // }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  // Prevent rendering parts that might implicitly rely on router until it's ready
  // This is a bit defensive, as NavBar is already fixed.
  // if (!isRouterReady && !authLoading) { // Also consider authLoading
  //   return <div>Loading page...</div>; // Or a more sophisticated loader
  // }


  return (
    <div className="min-h-screen flex flex-col items-center bg-secondary-50 relative overflow-hidden pt-32">
      {/* Conditionally render NavBar or ensure NavBar itself handles router readiness well enough */}
      {isRouterReady && <NavBar />} {/* Or just <NavBar /> if confident in its internal handling */}
      
      <div className="h-16 w-full"></div> {/* Spacer div to clear the fixed NavBar */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 z-10 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          Already have an account?{' '}
          {/* Use Link component for client-side navigation */}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
