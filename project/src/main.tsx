import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("%c [PayAware] System Booting...", "color: #4f46e5; font-weight: bold; font-size: 14px;");
console.log("[Config] Supabase URL:", import.meta.env.VITE_SUPABASE_URL || "Using Fallback (ghvvynxalczkewrlvceq)");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
