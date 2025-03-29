import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalFranchises: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch users count
        const usersResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Fetch managers count
        const managersResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/managers`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Fetch franchises count
        const franchisesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/franchises`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setStats({
          totalUsers: usersResponse.data.users.length,
          totalManagers: managersResponse.data.managers.length,
          totalFranchises: franchisesResponse.data.franchises.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          <Link to="/admin/users" className="text-blue-500 hover:underline mt-4 inline-block">
            View all users
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Order Managers</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalManagers}</p>
          <Link to="/admin/managers" className="text-blue-500 hover:underline mt-4 inline-block">
            View all managers
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Franchises</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalFranchises}</p>
          <Link to="/admin/franchises" className="text-blue-500 hover:underline mt-4 inline-block">
            View all franchises
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              to="/admin/users/create" 
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Create New User
            </Link>
            <Link 
              to="/admin/managers/create" 
              className="block w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Create New Manager
            </Link>
            <Link 
              to="/admin/franchises/create" 
              className="block w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              Create New Franchise
            </Link>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Backup</span>
              <span className="text-sm text-gray-600">Today, 03:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;