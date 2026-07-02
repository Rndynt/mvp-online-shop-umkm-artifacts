import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';
import './index.css';
import App from './App';

// Configure API base URL from env (falls back to same origin in dev via Vite proxy)
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
