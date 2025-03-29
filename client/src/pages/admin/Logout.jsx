import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
        
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        toast.success('Logged out successfully');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout');
        navigate('/admin/dashboard');
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Logging Out</h2>
        <p className="text-center text-gray-600">Please wait while we log you out...</p>
      </div>
    </div>
  );
};

export default AdminLogout;