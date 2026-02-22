import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Lazy load pages
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Products = React.lazy(() => import('./pages/products/Products'));
const Batches = React.lazy(() => import('./pages/batches/Batches'));
const Sales = React.lazy(() => import('./pages/sales/Sales'));
const Clients = React.lazy(() => import('./pages/clients/Clients'));
const Expenses = React.lazy(() => import('./pages/expenses/Expenses'));
const Users = React.lazy(() => import('./pages/users/Users'));


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#333', color: 'red', height: '100vh', width: '100%' }}>
          <h2>Dasturda Xatolik (Crash):</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', background: 'white', color: 'black', marginTop: '20px' }}>Refresh Qilish</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="products" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="batches" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Batches />
                  </ProtectedRoute>
                } />
                <Route path="sales" element={
                  <ProtectedRoute allowedRoles={['admin', 'seller', 'manager']}>
                    <Sales />
                  </ProtectedRoute>
                } />
                <Route path="clients" element={
                  <ProtectedRoute allowedRoles={['admin', 'seller', 'manager']}>
                    <Clients />
                  </ProtectedRoute>
                } />
                <Route path="expenses" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <Expenses />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                } />

                {/* Add other routes here */}
              </Route>

              <Route path="/unauthorized" element={<div className="p-10 text-center">Unauthorized Access</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
