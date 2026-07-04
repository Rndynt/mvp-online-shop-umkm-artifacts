import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';
import './index.css';
import App from './App';

// Generated API paths already include the /api/ prefix (e.g. /api/storefront).
// Replit's path-based routing forwards /api/* to the API server automatically,
// so no base-URL override is needed. setBaseUrl() is only needed for Expo/native
// clients pointing at a remote host; calling it with "/api" here would produce
// double-prefixed paths like /api/api/storefront.
void setBaseUrl; // keep import to avoid "unused" lint errors

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
