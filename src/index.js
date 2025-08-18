import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from '../src/pages/routes';  // Importe o AppRoutes em vez do App diretamente
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRoutes />  {/* Use AppRoutes aqui */}
  </React.StrictMode>
);

reportWebVitals();