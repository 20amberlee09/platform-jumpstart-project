import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CriticalErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary';
import { initSentry } from '@/lib/sentry';
import { analytics } from '@/lib/analytics';

// Initialize Sentry for production error tracking
initSentry();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CriticalErrorBoundary>
      <PageErrorBoundary>
        <App />
      </PageErrorBoundary>
    </CriticalErrorBoundary>
  </React.StrictMode>
);
