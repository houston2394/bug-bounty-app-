import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff41' },
    secondary: { main: '#ff1744' },
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
  },
  typography: { fontFamily: 'Monaco, Consolas, "Courier New", monospace' },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/targets" element={<Targets />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;