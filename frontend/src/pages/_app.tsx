// TEMPORARY MINIMAL TEST CONTENT for src/pages/_app.tsx
import '@/styles/globals.css'; // Keep global styles
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
