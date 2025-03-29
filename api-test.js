import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'Server/.env') });

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Store test data
const testData = {
  adminToken: null,
  categoryId: null,
  productId: null,
  franchiseId: null,
  managerId: null,
  userId: null,
  addressId: null,
  orderId: null
};

// Save test results to file
const saveResults = (results) => {
  const resultsPath = path.join(__dirname, 'api-test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log.info(`Test results saved to ${resultsPath}`);
};

// Main test function
async function runApiTests() {
  log.title('BLUEMEDIX API TEST SUITE');
  
  const testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };

  try {
    // Helper function to run a test
    const runTest = async (name, testFn) => {
      testResults.totalTests++;
      try {
        log.info(`Running test: ${name}`);
        await testFn();
        log.success(`✓ Test passed: ${name}`);
        testResults.passed++;
        testResults.tests.push({ name, status: 'passed' });
      } catch (error) {
        log.error(`✗ Test failed: ${name}`);
        console.error(error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        testResults.failed++;
        testResults.tests.push({ 
          name, 
          status: 'failed', 
          error: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null
        });
      }
    };

    // 1. Admin Login
    await runTest('Admin Login', async () => {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      
      if (!response.data.success) {
        throw new Error('Login failed');
      }
      
      testData.adminToken = response.data.token;
      testData.userId = response.data.user._id;
      log.info(`Admin token: ${testData.adminToken.substring(0, 20)}...`);
    });

    // Set auth header for subsequent requests
    const authHeader = () => ({ 
      headers: { Authorization: `Bearer ${testData.adminToken}` } 
    });

    // 2. Create Category
    await runTest('Create Category', async () => {
      const response = await axios.post(
        `${API_URL}/api/categories`, 
        {
          name: `Test Category ${Date.now()}`,
          image: 'https://example.com/category.jpg'
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to create category');
      }
      
      testData.categoryId = response.data.category._id;
      log.info(`Created category ID: ${testData.categoryId}`);
    });

    // 3. Create Product
    await runTest('Create Product', async () => {
      const response = await axios.post(
        `${API_URL}/api/products`, 
        {
          name: `Test Product ${Date.now()}`,
          description: 'This is a test product',
          category: testData.categoryId,
          price: 99.99,
          discount: 10,
          warehouseStock: 100,
          lowStockThreshold: 10,
          image: ['https://example.com/product.jpg'],
          manufacturer: 'Test Manufacturer',
          publish: true
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to create product');
      }
      
      testData.productId = response.data.product._id;
      log.info(`Created product ID: ${testData.productId}`);
    });

    // 4. Get All Products
    await runTest('Get All Products', async () => {
      const response = await axios.get(`${API_URL}/api/products`);
      
      if (!response.data.success) {
        throw new Error('Failed to get products');
      }
      
      log.info(`Retrieved ${response.data.products.length} products`);
    });

    // 5. Get Product by ID
    await runTest('Get Product by ID', async () => {
      const response = await axios.get(`${API_URL}/api/products/${testData.productId}`);
      
      if (!response.data.success) {
        throw new Error('Failed to get product by ID');
      }
      
      log.info(`Retrieved product: ${response.data.product.name}`);
    });

    // 6. Create Manager (without franchise)
    await runTest('Create Manager', async () => {
      const response = await axios.post(
        `${API_URL}/api/users/manager`,
        {
          name: `Test Manager ${Date.now()}`,
          email: `manager${Date.now()}@example.com`,
          password: 'manager123',
          phone: '9876543210'
          // No franchiseId - will be assigned later
        },
        authHeader()
      );

      if (!response.data.success) {
        throw new Error('Failed to create manager');
      }

      testData.managerId = response.data.manager._id;
      log.info(`Created manager ID: ${testData.managerId}`);
    });

    // 7. Create Franchise
    await runTest('Create Franchise', async () => {
      const response = await axios.post(
        `${API_URL}/api/franchises`,
        {
          name: `Test Franchise ${Date.now()}`,
          address: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            pincode: '12345',
            country: 'Test Country'
          },
          contactNumber: '1234567890',
          email: `franchise${Date.now()}@example.com`
          // No orderManager - will be assigned later
        },
        authHeader()
      );

      if (!response.data.success) {
        throw new Error('Failed to create franchise');
      }

      testData.franchiseId = response.data.franchise._id;
      log.info(`Created franchise ID: ${testData.franchiseId}`);
    });

    // 8. Get All Franchises
    await runTest('Get All Franchises', async () => {
      const response = await axios.get(
        `${API_URL}/api/franchises`,
        authHeader()
      );

      if (!response.data.success) {
        throw new Error('Failed to get franchises');
      }

      log.info(`Retrieved ${response.data.franchises.length} franchises`);
    });

    // 9. Assign Manager to Franchise
    await runTest('Assign Manager to Franchise', async () => {
      const response = await axios.post(
        `${API_URL}/api/franchises/assign-manager`, 
        {
          franchiseId: testData.franchiseId,
          managerId: testData.managerId
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to assign manager to franchise');
      }
      
      log.info(`Assigned manager to franchise`);
    });

    // 10. Create Address
    await runTest('Create Address', async () => {
      const response = await axios.post(
        `${API_URL}/api/addresses`, 
        {
          Street: '456 User Street',
          city: 'User City',
          state: 'User State',
          pincode: '54321',
          country: 'User Country',
          phone_number: 5551234567
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to create address');
      }
      
      testData.addressId = response.data.address._id;
      log.info(`Created address ID: ${testData.addressId}`);
    });

    // 11. Create Order
    await runTest('Create Order', async () => {
      const response = await axios.post(
        `${API_URL}/api/orders`, 
        {
          product_id: testData.productId,
          deliveryAddress: testData.addressId,
          franchise: testData.franchiseId,
          subtotalAmount: 89.99, // Price after discount
          totalAmount: 99.99, // Including delivery charge
          deliveryCharge: 10.00
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to create order');
      }
      
      testData.orderId = response.data.order._id;
      log.info(`Created order ID: ${testData.orderId}`);
    });

    // 12. Get All Orders
    await runTest('Get All Orders', async () => {
      const response = await axios.get(
        `${API_URL}/api/orders`,
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to get orders');
      }
      
      log.info(`Retrieved ${response.data.orders.length} orders`);
    });

    // 13. Get Order by ID
    await runTest('Get Order by ID', async () => {
      const response = await axios.get(
        `${API_URL}/api/orders/${testData.orderId}`,
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to get order by ID');
      }
      
      log.info(`Retrieved order with ID: ${response.data.order._id}`);
    });

    // 14. Update Order Status
    await runTest('Update Order Status', async () => {
      const response = await axios.patch(
        `${API_URL}/api/orders/${testData.orderId}/status`, 
        {
          deliverystatus: 'accepted'
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update order status');
      }
      
      log.info(`Updated order status to: accepted`);
    });

    // 15. Update Payment Status
    await runTest('Update Payment Status', async () => {
      const response = await axios.patch(
        `${API_URL}/api/orders/${testData.orderId}/payment`, 
        {
          paymentStatus: 'Paid',
          paymentid: `PAY-${Date.now()}`
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update payment status');
      }
      
      log.info(`Updated payment status to: Paid`);
    });

    // 16. Get Franchise Orders
    await runTest('Get Franchise Orders', async () => {
      const response = await axios.get(
        `${API_URL}/api/franchises/${testData.franchiseId}/orders`,
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to get franchise orders');
      }
      
      log.info(`Retrieved ${response.data.orders.length} orders for franchise`);
    });

    // 17. Get Franchise Stats
    await runTest('Get Franchise Stats', async () => {
      const response = await axios.get(
        `${API_URL}/api/franchises/${testData.franchiseId}/stats`,
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to get franchise stats');
      }
      
      log.info(`Retrieved stats for franchise: ${response.data.franchise}`);
    });

    // 18. Update Product
    await runTest('Update Product', async () => {
      const response = await axios.put(
        `${API_URL}/api/products/${testData.productId}`, 
        {
          name: `Updated Product ${Date.now()}`,
          price: 129.99
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update product');
      }
      
      log.info(`Updated product: ${response.data.product.name}`);
    });

    // 19. Update Product Stock
    await runTest('Update Product Stock', async () => {
      const response = await axios.patch(
        `${API_URL}/api/products/${testData.productId}/stock`, 
        {
          warehouseStock: 75
        },
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update product stock');
      }
      
      log.info(`Updated product stock to: ${response.data.product.warehouseStock}`);
    });

    // 20. Get User Orders
    await runTest('Get User Orders', async () => {
      const response = await axios.get(
        `${API_URL}/api/orders/my-orders`,
        authHeader()
      );
      
      if (!response.data.success) {
        throw new Error('Failed to get user orders');
      }
      
      log.info(`Retrieved ${response.data.orders.length} orders for user`);
    });

    // Test summary
    log.title('TEST SUMMARY');
    log.info(`Total tests: ${testResults.totalTests}`);
    log.success(`Passed: ${testResults.passed}`);
    log.error(`Failed: ${testResults.failed}`);
    log.warning(`Skipped: ${testResults.skipped}`);
    
    // Save results
    saveResults(testResults);
    
  } catch (error) {
    log.error('Test suite failed:');
    console.error(error);
  }
}

// Run the tests
runApiTests();