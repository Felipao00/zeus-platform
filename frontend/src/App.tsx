import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Photos from './pages/Photos';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Notes from './pages/Notes';
import Links from './pages/Links';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Logs from './pages/Logs';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1e',
              color: '#fff',
              border: '1px solid #27272d',
            },
          }}
        />
        <Routes>
          {/* Landing Page - pública */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth - públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* App - protegidas */}
          <Route path="/app" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="files" element={<Files />} />
            <Route path="photos" element={<Photos />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="notes" element={<Notes />} />
            <Route path="links" element={<Links />} />
            <Route path="vault" element={<Vault />} />
            <Route path="settings" element={<Settings />} />
            <Route path="search" element={<Search />} />
            <Route path="logs" element={<Logs />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;