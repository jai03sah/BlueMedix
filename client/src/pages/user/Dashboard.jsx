import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch current user data
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setUserData(userResponse.data.user);
        
        // Fetch user orders (assuming there's an orders endpoint)
        try {
          const ordersResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/orders/my-orders`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          setOrders(ordersResponse.data.orders || []);
        } catch (orderError) {
          console.log('No orders found or endpoint not available yet');
          setOrders([]);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      <h1 className="text-3xl font-bold mb-8">Welcome, {userData.firstName}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-medium">{userData.firstName} {userData.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="font-medium">{userData.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Address</p>
              <p className="font-medium">{userData.address || 'Not provided'}</p>
            </div>
          </div>
          <Link 
            to="/user/profile" 
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Edit Profile
          </Link>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/user/orders/new" 
              className="block py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Place New Order
            </Link>
            <Link 
              to="/user/orders" 
              className="block py-3 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              View My Orders
            </Link>
            <Link 
              to="/user/products" 
              className="block py-3 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              Browse Products
            </Link>
            <Link 
              to="/user/support" 
              className="block py-3 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/user/orders" className="text-blue-500 hover:underline">
              View All
            </Link>
          </div>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/user/orders/${order._id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link 
                to="/user/orders/new" 
                className="inline-block py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Place Your First Order
              </Link>
            </div>
          )}
        </div>
        
        {/* Notifications or Announcements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Announcements</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-medium text-blue-800">New Products Available</h3>
              <p className="text-sm text-blue-700 mt-1">Check out our new medical supplies that just arrived!</p>
            </div>
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h3 className="font-medium text-green-800">Free Shipping</h3>
              <p className="text-sm text-green-700 mt-1">Free shipping on all orders over $100 this month.</p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="font-medium text-yellow-800">Holiday Schedule</h3>
              <p className="text-sm text-yellow-700 mt-1">Please note our adjusted hours during the upcoming holidays.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;