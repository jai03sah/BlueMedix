import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateAdmin from './pages/CreateAdmin';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ManagerManagement from './pages/admin/ManagerManagement';
import CreateManager from './pages/admin/CreateManager';
import OrderManagement from './pages/admin/OrderManagement';
import ProductManagement from './pages/admin/ProductManagement';
import FranchiseManagement from './pages/admin/FranchiseManagement';
import Reports from './pages/admin/Reports';
import AdminLogout from './pages/admin/Logout';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerLogout from './pages/manager/Logout';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Categories from './pages/user/Categories';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import UserLogout from './pages/user/Logout';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import ManagerLayout from './components/layouts/ManagerLayout';
import UserLayout from './components/layouts/UserLayout';

// Protected Route Components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const ManagerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['orderManager']}>
    <ManagerLayout>{children}</ManagerLayout>
  </ProtectedRoute>
);

const UserRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['user', 'admin', 'orderManager']}>
    <UserLayout>{children}</UserLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-admin" element={<CreateAdmin />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/managers" element={<AdminRoute><ManagerManagement /></AdminRoute>} />
        <Route path="/admin/managers/create" element={<AdminRoute><CreateManager /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
        <Route path="/admin/franchises" element={<AdminRoute><FranchiseManagement /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/admin/logout" element={<AdminLogout />} />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
        <Route path="/manager/logout" element={<ManagerLogout />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
        <Route path="/products" element={<UserRoute><Products /></UserRoute>} />
        <Route path="/products/:productId" element={<UserRoute><ProductDetail /></UserRoute>} />
        <Route path="/categories" element={<UserRoute><Categories /></UserRoute>} />
        <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
        <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
        <Route path="/user/logout" element={<UserLogout />} />

        {/* Default Route - Redirect based on user role */}
        <Route path="/" element={<UserRoute> <DefaultRedirect /> </UserRoute>} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Helper components
const DefaultRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'orderManager':
      return <Navigate to="/manager/dashboard" />;
    default:
      return <Navigate to="/user/dashboard" />;
  }
};

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  </div>
);

export default App;