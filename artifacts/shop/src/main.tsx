import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { getGetStorefrontQueryOptions, setBaseUrl } from '@workspace/api-client-react';
import './index.css';
import App from './App';

// Generated API paths already include the /api/ prefix (e.g. /api/storefront).
// Replit's path-based routing forwards /api/* to the API server automatically,
// so no base-URL override is needed. setBaseUrl() is only needed for Expo/native
// clients pointing at a remote host; calling it with "/api" here would produce
// double-prefixed paths like /api/api/storefront.
void setBaseUrl; // keep import to avoid "unused" lint errors

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

// Prefetch storefront before mounting React so that by the time HomePage
// renders, the template and theme data are already in the cache.
// This eliminates the blank/skeleton flash — storefrontLoading is false
// on the very first render. We cap the wait at 1.5 s so a slow/offline
// API never blocks the page from appearing at all.
const prefetch = queryClient.prefetchQuery(getGetStorefrontQueryOptions());
const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));

Promise.race([prefetch, timeout]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App queryClient={queryClient} />
    </StrictMode>,
  );
});
