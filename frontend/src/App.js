import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SnackbarProvider } from 'notistack';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Targets from './pages/Targets';
import TargetDetail from './pages/TargetDetail';
import Recon from './pages/Recon';
import Vulnerabilities from './pages/Vulnerabilities';
import Reports from './pages/Reports';
import Learning from './pages/Learning';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff41',
    },
    secondary: {
      main: '#ff1744',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/targets" element={<Targets />} />
                <Route path="/targets/:id" element={<TargetDetail />} />
                <Route path="/recon" element={<Recon />} />
                <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/learning" element={<Learning />} />
              </Routes>
            </Layout>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;