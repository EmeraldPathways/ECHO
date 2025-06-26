// src/pages/_app.tsx (Restore this to its proper state)
import { AuthProvider } from '@/components/AuthProvider';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
