
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadSavedTheme, applyTheme } from './utils/themes';

// Aplicar tema salvo ao carregar a aplicação
const savedTheme = loadSavedTheme();
applyTheme(savedTheme);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
<<<<<<< HEAD
        if (process.env.NODE_ENV === 'development') {
          console.log('Service Worker registrado');
        }
      })
      .catch((registrationError) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao registrar Service Worker:', registrationError);
        }
=======
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
>>>>>>> 89d79ac5197a410ea5db373514bd9663989ec539
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // In development, unregister any existing service workers to avoid conflicts
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
