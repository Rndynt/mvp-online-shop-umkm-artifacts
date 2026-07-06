import { createRoot } from 'react-dom/client';

import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// When management is deployed standalone (e.g. Cloudflare Pages) on a
// different origin than api-server, VITE_API_ORIGIN must point at the
// api-server's public URL (e.g. https://api.yourdomain.com).
// Leave unset when management and api-server share the same origin.
setBaseUrl(import.meta.env.VITE_API_ORIGIN ?? null);

createRoot(document.getElementById('root')!).render(<App />);
