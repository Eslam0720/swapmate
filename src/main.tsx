import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AppProvider } from './contexts/AppContext.tsx';
import { AuthProvider } from './components/AuthProvider.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <AppProvider>
            <App />
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);