import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { AntdProvider } from './app/providers/AntdProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AntdProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AntdProvider>
    </QueryProvider>
  </StrictMode>,
);