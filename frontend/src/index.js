import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SnackbarProvider maxSnack={3}>
    <App />
  </SnackbarProvider>
);