import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Shows from './pages/Shows';
import Seasons from './pages/Seasons';
import Episodes from './pages/Episodes';
import Users from './pages/Users';
import Loading from './components/common/Loading';

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error("Query error:", error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    }
  },
});

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 4, // Slightly curved corners, not too round
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase text in buttons
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position="top-right" autoClose={5000} />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movies"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Movies />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shows"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Shows />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seasons"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Seasons />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/episodes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Episodes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;