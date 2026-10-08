import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

import { AntdProvider } from './app/providers/AntdProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { MotionProvider } from './app/providers/MotionProvider';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryProvider>
        <AntdProvider>
          <AuthProvider>
            <MotionProvider>
              <App />
            </MotionProvider>
          </AuthProvider>
        </AntdProvider>
      </QueryProvider>
    </HelmetProvider>
  </StrictMode>,
);
