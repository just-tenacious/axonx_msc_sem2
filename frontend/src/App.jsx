import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--topbar-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;