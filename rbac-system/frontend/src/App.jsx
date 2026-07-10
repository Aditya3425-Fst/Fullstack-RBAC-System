import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleProtectedRoute from './components/routing/RoleProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import Users from './pages/Users/Users';
import Logs from './pages/Logs/Logs';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import NotFound from './pages/NotFound/NotFound';

import './styles/global.css';

const App = () => {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <RoleProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
                <Layout>
                  <Users />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <RoleProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                <Layout>
                  <Logs />
                </Layout>
              </RoleProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ zIndex: 'var(--z-toast)' }}
      />
    </>
  );
};

export default App;
