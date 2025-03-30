import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logout from '../auth/Logout';

const ManagerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const isActive = (path) => {
    return location.pathname === path ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-700';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-green-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
        <div className="flex items-center space-x-2 px-4">
          <span className="text-2xl font-extrabold">BlueMedix</span>
          <span className="px-2 py-1 bg-green-800 rounded-lg text-xs">Manager</span>
        </div>
        
        <nav>
          <Link 
            to="/manager/dashboard" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/manager/dashboard')}`}
          > 
            Dashboard
          </Link>
          <Link 
            to="/manager/orders" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/manager/orders')}`}
          >
            Orders
          </Link>
          <Link 
            to="/manager/inventory" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/manager/inventory')}`}
          >
            Inventory
          </Link>
          <Link 
            to="/manager/customers" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/manager/customers')}`}
          >
            Customers
          </Link>
          <Link 
            to="/manager/reports" 
            className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/manager/reports')}`}
          >
            Reports
          </Link>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-500 focus:outline-none md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <button  
                onClick={() => setDropdownOpen(!dropdownOpen)} 
               className="flex items-center space-x-2 focus:outline-none">
                <span className="text-gray-700">{user?.name}</span> 
                <img 
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.img_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "Manager")}
                  alt="Profile"
                /> 
              </button> 
              {dropdownOpen && ( /* Dropdown menu */
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ">
                <Link 
                  to="/manager/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </Link>
                <Link
                  to="/manager/logout"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)} 
                >
                  Sign out
                </Link>
              </div>
            )}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;