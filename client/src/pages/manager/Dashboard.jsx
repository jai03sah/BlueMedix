import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [franchiseData, setFranchiseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.franchise) {
        toast.error('No franchise assigned to this manager');
        setLoading(false);
        return;
      }
      
      // Fetch franchise details
      const franchiseResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/franchises/${user.franchise}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (franchiseResponse.data.success) {
        setFranchiseData(franchiseResponse.data.franchise);
        
        // In a real application, you would fetch order and product stats here
        // For now, we'll use dummy data
        setStats({
          totalOrders: 124,
          pendingOrders: 18,
          totalProducts: 256,
          lowStockProducts: 12
        });
      }
    } catch (error) {
      console.error('Error fetching manager data:', error);
      toast.error('Failed to load franchise data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!franchiseData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> No franchise data available. Please contact an administrator.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to {franchiseData.name}</h1>
        <p className="text-gray-600">
          {franchiseData.address.street}, {franchiseData.address.city}, {franchiseData.address.state}, {franchiseData.address.pincode}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
          <Link to="/manager/orders" className="text-blue-500 hover:underline mt-4 inline-block">
            View all orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          <Link to="/manager/orders/pending" className="text-blue-500 hover:underline mt-4 inline-block">
            View pending orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Total Products</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalProducts}</p>
          <Link to="/manager/inventory" className="text-blue-500 hover:underline mt-4 inline-block">
            View inventory
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Low Stock</h2>
          <p className="text-3xl font-bold text-red-600">{stats.lowStockProducts}</p>
          <Link to="/manager/inventory/low-stock" className="text-blue-500 hover:underline mt-4 inline-block">
            View low stock items
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              to="/manager/orders/create" 
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Create New Order
            </Link>
            <Link 
              to="/manager/inventory/update" 
              className="block w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Update Inventory
            </Link>
            <Link 
              to="/manager/reports" 
              className="block w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              Generate Reports
            </Link>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Today, 10:30 AM</p>
              <p className="font-medium">New order #12345 received</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Today, 9:15 AM</p>
              <p className="font-medium">Inventory updated for 5 products</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Yesterday, 4:45 PM</p>
              <p className="font-medium">Order #12340 status changed to "Shipped"</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Yesterday, 2:30 PM</p>
              <p className="font-medium">Monthly sales report generated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;