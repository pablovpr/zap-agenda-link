
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadSavedTheme, applyTheme } from './utils/themes';

// CONFIGURAR TIMEZONE PADRÃO PARA BRASIL
// Definir timezone global para a aplicação
process.env.TZ = 'America/Sao_Paulo';

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

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('🕐 Service Worker registrado com timezone Brasil:', 'America/Sao_Paulo');
      })
      .catch((registrationError) => {
        console.error('Erro ao registrar Service Worker:', registrationError);
      });
  });
}

// Log inicial do timezone para debug
console.log('🇧🇷 Aplicação iniciada com timezone do Brasil:', {
  timezone: 'America/Sao_Paulo',
  current_time: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  utc_time: new Date().toISOString()
});
