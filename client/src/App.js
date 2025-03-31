import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Home Page
import Home from './pages/Home';

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
import ManagerOrders from './pages/manager/Orders';
import ManagerInventory from './pages/manager/Inventory';
import ManagerLogout from './pages/manager/Logout';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Categories from './pages/user/Categories';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import Addresses from './pages/user/Addresses';
import AddAddress from './pages/user/AddAddress';
import EditAddress from './pages/user/EditAddress';
import UserLogout from './pages/user/Logout';

// Documentation Pages
import WorkflowDiagram from './pages/WorkflowDiagram';
import BlockDiagram from './pages/BlockDiagram';
import ERDiagram from './pages/ERDiagram';
import Documentation from './pages/Documentation';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import ManagerLayout from './components/layouts/ManagerLayout';
import UserLayout from './components/layouts/UserLayout';
import PublicProductsLayout from './components/layouts/PublicProductsLayout';

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
        <Route path="/manager/orders" element={<ManagerRoute><ManagerOrders /></ManagerRoute>} />
        <Route path="/manager/inventory" element={<ManagerRoute><ManagerInventory /></ManagerRoute>} />
        <Route path="/manager/logout" element={<ManagerLogout />} />

        {/* Public Routes for Products and Categories */}
        <Route path="/products" element={<PublicProductsLayout><Products /></PublicProductsLayout>} />
        <Route path="/products/:productId" element={<PublicProductsLayout><ProductDetail /></PublicProductsLayout>} />
        <Route path="/categories" element={<PublicProductsLayout><Categories /></PublicProductsLayout>} />

        {/* Protected User Routes */}
        <Route path="/user/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
        <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
        <Route path="/orders" element={<UserRoute><Orders /></UserRoute>} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/addresses/add" element={<AddAddress />} />
        <Route path="/addresses/edit/:addressId" element={<EditAddress />} />
        <Route path="/user/logout" element={<UserLogout />} />

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Documentation Routes */}
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/workflow-diagram" element={<WorkflowDiagram />} />
        <Route path="/block-diagram" element={<BlockDiagram />} />
        <Route path="/er-diagram" element={<ERDiagram />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Helper components

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