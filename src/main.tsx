import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CriticalErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CriticalErrorBoundary>
      <PageErrorBoundary>
        <App />
      </PageErrorBoundary>
    </CriticalErrorBoundary>
  </React.StrictMode>
);
