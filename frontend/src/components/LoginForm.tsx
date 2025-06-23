import React, { useState, FormEvent } from 'react';
import { useAuth } from './AuthProvider'; // Assuming AuthProvider is in the same directory or adjust path
import { useRouter } from 'next/router';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Correctly destructure functions from useAuth as defined in AuthProvider
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Call signUp with individual arguments
        await signUp(email, password);
        setMessage('Sign up successful! Please check your email to verify your account if email confirmation is enabled. You are now being logged in.');
        // Supabase/AuthProvider handles session update via onAuthStateChange.
        // Redirect will happen after state update or can be forced here.
        router.push('/'); // Redirect to home/chat page after signup
      } else {
        // Call signIn with individual arguments
        await signIn(email, password);
        // Successful sign-in, AuthProvider will update user state.
        // setMessage('Sign in successful! Redirecting...'); // Optional message
        router.push('/'); // Redirect to home/chat page
      }
      // No explicit 'authResponse.error' or 'authResponse.user' to check here,
      // as errors are thrown and success means AuthProvider handles state.
    } catch (err: any) {
      console.error("Auth error in LoginForm:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      <p className="text-center text-sm text-gray-600">
        {isSignUp ? 'Sign up to start your journey.' : 'Sign in to continue your conversations.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="you@example.com"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {message && <p className="text-sm text-green-600 text-center">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </div>
      </form>

      <p className="text-sm text-center text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
          className="font-medium text-blue-600 hover:text-blue-500"
          disabled={loading}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
