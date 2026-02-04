import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MetadataProvider } from './contexts/MetadataContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MetadataProvider>
      <App />
    </MetadataProvider>
  </React.StrictMode>
);
