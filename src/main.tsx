import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { AntdProvider } from './app/providers/AntdProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AntdProvider>
        <App />
      </AntdProvider>
    </QueryProvider>
  </StrictMode>,
);