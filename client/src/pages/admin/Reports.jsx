import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  
  // Report data states
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange, customDateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build date range parameters
      let fromDate, toDate;
      const today = new Date();
      
      if (dateRange === 'week') {
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'month') {
        fromDate = new Date(today);
        fromDate.setMonth(today.getMonth() - 1);
      } else if (dateRange === 'quarter') {
        fromDate = new Date(today);
        fromDate.setMonth(today.getMonth() - 3);
      } else if (dateRange === 'year') {
        fromDate = new Date(today);
        fromDate.setFullYear(today.getFullYear() - 1);
      } else if (dateRange === 'custom' && customDateRange.from && customDateRange.to) {
        fromDate = new Date(customDateRange.from);
        toDate = new Date(customDateRange.to);
      }
      
      if (!toDate) {
        toDate = new Date(today);
      }
      
      // Format dates for API
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];
      
      // Fetch data based on active tab
      let endpoint;
      switch (activeTab) {
        case 'sales':
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/sales?from=${fromDateStr}&to=${toDateStr}`;
          break;
        case 'products':
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/products?from=${fromDateStr}&to=${toDateStr}`;
          break;
        case 'categories':
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/categories?from=${fromDateStr}&to=${toDateStr}`;
          break;
        case 'franchises':
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/franchises?from=${fromDateStr}&to=${toDateStr}`;
          break;
        case 'inventory':
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/inventory`;
          break;
        default:
          endpoint = `${process.env.REACT_APP_API_URL}/api/reports/sales?from=${fromDateStr}&to=${toDateStr}`;
      }
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Process and set data based on active tab
        switch (activeTab) {
          case 'sales':
            setSalesData(response.data.data);
            break;
          case 'products':
            setProductData(response.data.data);
            break;
          case 'categories':
            setCategoryData(response.data.data);
            break;
          case 'franchises':
            setFranchiseData(response.data.data);
            break;
          case 'inventory':
            setInventoryData(response.data.data);
            break;
          default:
            setSalesData(response.data.data);
        }
      } else {
        setError('Failed to fetch report data');
        toast.error('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Fetch report data error:', error);
      setError('An error occurred while fetching report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Generate mock data for demonstration (remove in production)
  const generateMockData = () => {
    // Mock sales data
    if (activeTab === 'sales') {
      const mockSalesData = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - i));
        
        mockSalesData.push({
          date: date.toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 10000) + 1000,
          orders: Math.floor(Math.random() * 50) + 5
        });
      }
      
      setSalesData(mockSalesData);
    }
    
    // Mock product data
    else if (activeTab === 'products') {
      const mockProductData = [
        { name: 'Product A', sales: 4500, units: 120 },
        { name: 'Product B', sales: 3800, units: 90 },
        { name: 'Product C', sales: 3200, units: 80 },
        { name: 'Product D', sales: 2800, units: 70 },
        { name: 'Product E', sales: 2200, units: 55 }
      ];
      
      setProductData(mockProductData);
    }
    
    // Mock category data
    else if (activeTab === 'categories') {
      const mockCategoryData = [
        { name: 'Category 1', value: 35 },
        { name: 'Category 2', value: 25 },
        { name: 'Category 3', value: 20 },
        { name: 'Category 4', value: 15 },
        { name: 'Category 5', value: 5 }
      ];
      
      setCategoryData(mockCategoryData);
    }
    
    // Mock franchise data
    else if (activeTab === 'franchises') {
      const mockFranchiseData = [
        { name: 'Franchise A', sales: 12500, orders: 320 },
        { name: 'Franchise B', sales: 9800, orders: 250 },
        { name: 'Franchise C', sales: 8200, orders: 210 },
        { name: 'Franchise D', sales: 6800, orders: 180 },
        { name: 'Franchise E', sales: 5500, orders: 140 }
      ];
      
      setFranchiseData(mockFranchiseData);
    }
    
    // Mock inventory data
    else if (activeTab === 'inventory') {
      const mockInventoryData = [
        { name: 'Product A', stock: 120, threshold: 20, status: 'In Stock' },
        { name: 'Product B', stock: 45, threshold: 50, status: 'Low Stock' },
        { name: 'Product C', stock: 80, threshold: 30, status: 'In Stock' },
        { name: 'Product D', stock: 15, threshold: 25, status: 'Low Stock' },
        { name: 'Product E', stock: 5, threshold: 15, status: 'Critical' }
      ];
      
      setInventoryData(mockInventoryData);
    }
    
    setLoading(false);
  };

  // Use mock data for demonstration
  useEffect(() => {
    generateMockData();
  }, [activeTab, dateRange, customDateRange]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          
          <button
            onClick={() => fetchReportData()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="from-date">
                From Date
              </label>
              <input
                type="date"
                id="from-date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to-date">
                To Date
              </label>
              <input
                type="date"
                id="to-date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sales Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Product Performance
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Category Analysis
          </button>
          <button
            onClick={() => setActiveTab('franchises')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'franchises'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Franchise Performance
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventory Status
          </button>
        </nav>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => fetchReportData()} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Sales Overview */}
          {activeTab === 'sales' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Sales Overview</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-blue-500 mb-1">Total Sales</h3>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(salesData.reduce((sum, item) => sum + item.sales, 0))}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-green-500 mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-green-800">
                    {salesData.reduce((sum, item) => sum + item.orders, 0)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-purple-500 mb-1">Average Order Value</h3>
                  <p className="text-2xl font-bold text-purple-800">
                    {formatCurrency(
                      salesData.reduce((sum, item) => sum + item.sales, 0) / 
                      salesData.reduce((sum, item) => sum + item.orders, 0) || 0
                    )}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-yellow-500 mb-1">Conversion Rate</h3>
                  <p className="text-2xl font-bold text-yellow-800">
                    {Math.round(Math.random() * 10 + 15)}%
                  </p>
                </div>
              </div>
              
              {/* Sales Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Sales Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'sales') return formatCurrency(value);
                        return value;
                      }} />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="orders" 
                        name="Orders" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Additional Sales Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Sales by Day of Week</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { day: 'Monday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Tuesday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Wednesday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Thursday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Friday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Saturday', sales: Math.floor(Math.random() * 5000) + 1000 },
                          { day: 'Sunday', sales: Math.floor(Math.random() * 5000) + 1000 }
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Credit Card', value: 65 },
                            { name: 'PayPal', value: 20 },
                            { name: 'Bank Transfer', value: 10 },
                            { name: 'Other', value: 5 }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Credit Card', value: 65 },
                            { name: 'PayPal', value: 20 },
                            { name: 'Bank Transfer', value: 10 },
                            { name: 'Other', value: 5 }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Performance */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Product Performance</h2>
              
              {/* Top Products Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Top Selling Products</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'sales') return formatCurrency(value);
                        return value;
                      }} />
                      <Legend />
                      <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                      <Bar dataKey="units" name="Units Sold" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Product Sales Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Product Sales Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units Sold
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productData.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{product.units}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(product.sales)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatCurrency(product.sales / product.units)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${Math.random() > 0.3 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.random() > 0.3 ? '+' : '-'}{Math.floor(Math.random() * 30) + 1}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Category Analysis */}
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Category Analysis</h2>
              
              {/* Category Distribution Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Sales by Category</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Category Growth</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData.map(cat => ({
                          ...cat,
                          growth: Math.floor(Math.random() * 40) - 10
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="growth" name="Growth %" fill="#8884d8">
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={Math.floor(Math.random() * 40) - 10 > 0 ? '#82ca9d' : '#ff8042'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Category Details Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Category Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales %
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Order Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryData.map((category, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{category.value}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(Math.floor(Math.random() * 10000) + 1000)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{Math.floor(Math.random() * 20) + 5}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatCurrency(Math.floor(Math.random() * 100) + 50)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Franchise Performance */}
          {activeTab === 'franchises' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Franchise Performance</h2>
              
              {/* Franchise Sales Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Sales by Franchise</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={franchiseData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'sales') return formatCurrency(value);
                        return value;
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Franchise Details Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Franchise Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Franchise
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Order Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {franchiseData.map((franchise, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{franchise.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][index]}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(franchise.sales)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{franchise.orders}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatCurrency(franchise.sales / franchise.orders)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${Math.random() > 0.3 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.random() > 0.3 ? '+' : '-'}{Math.floor(Math.random() * 30) + 1}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Status */}
          {activeTab === 'inventory' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Inventory Status</h2>
              
              {/* Inventory Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-blue-500 mb-1">Total Products</h3>
                  <p className="text-2xl font-bold text-blue-800">
                    {inventoryData.length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-green-500 mb-1">In Stock</h3>
                  <p className="text-2xl font-bold text-green-800">
                    {inventoryData.filter(item => item.status === 'In Stock').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-yellow-500 mb-1">Low Stock</h3>
                  <p className="text-2xl font-bold text-yellow-800">
                    {inventoryData.filter(item => item.status === 'Low Stock').length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-red-500 mb-1">Critical Stock</h3>
                  <p className="text-2xl font-bold text-red-800">
                    {inventoryData.filter(item => item.status === 'Critical').length}
                  </p>
                </div>
              </div>
              
              {/* Inventory Status Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Stock Levels</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stock" name="Current Stock" fill="#8884d8" />
                      <Bar dataKey="threshold" name="Low Stock Threshold" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Inventory Details Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Inventory Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Threshold
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Restocked
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.stock} units</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{item.threshold} units</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'In Stock' 
                                ? 'bg-green-100 text-green-800' 
                                : item.status === 'Low Stock'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.status !== 'In Stock' && (
                              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                Reorder
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;