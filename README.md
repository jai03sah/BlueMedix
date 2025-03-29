# BlueMedix API

This repository contains the backend API for the BlueMedix medical supply management system.

## Features

- User authentication and authorization
- Product management
- Order processing
- Franchise management
- Role-based access control (Admin, Manager, User)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bluemedix.git
   cd bluemedix
   ```

2. Install dependencies:
   ```
   cd Server
   npm install
   ```

3. Create a `.env` file in the Server directory with the following variables:
   ```
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/bluemedix
   JWT_SECRET=your_jwt_secret
   ADMIN_SECRET_KEY=your_admin_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```
   npm start
   ```

## API Structure

The API is organized into the following main components:

### Authentication
- Login
- Register
- Create admin account

### Users
- Get all users (admin only)
- Get user by ID
- Update user profile
- Change user status
- Create and manage order managers

### Products
- Create, read, update, delete products
- Filter and search products
- Manage product stock

### Orders
- Create orders
- Track order status
- Process payments
- Generate invoices

### Franchises
- Create and manage franchises
- Assign managers to franchises
- View franchise statistics

## API Testing

To test the API endpoints:

1. Make sure the server is running
2. Run the test script:
   ```
   node api-test.js
   ```

This will run a series of tests against all the API endpoints and generate a report.

## Workflow Examples

### Creating a Franchise and Manager

There are two approaches to creating franchises and managers:

1. **Create Manager First, Then Assign to Franchise**
   ```javascript
   // 1. Create a manager
   const managerResponse = await axios.post('/api/users/manager', {
     name: 'John Doe',
     email: 'john@example.com',
     password: 'password123',
     phone: '1234567890'
   });
   
   // 2. Create a franchise
   const franchiseResponse = await axios.post('/api/franchises', {
     name: 'City Blue Center',
     address: {...},
     contactNumber: '9876543210',
     email: 'franchise@example.com'
   });
   
   // 3. Assign manager to franchise
   await axios.post('/api/franchises/assign-manager', {
     franchiseId: franchiseResponse.data.franchise._id,
     managerId: managerResponse.data.manager._id
   });
   ```

2. **Create Franchise First, Then Create Manager with Franchise**
   ```javascript
   // 1. Create a franchise
   const franchiseResponse = await axios.post('/api/franchises', {
     name: 'City Blue Center',
     address: {...},
     contactNumber: '9876543210',
     email: 'franchise@example.com'
   });
   
   // 2. Create a manager and assign to franchise
   await axios.post('/api/users/manager', {
     name: 'John Doe',
     email: 'john@example.com',
     password: 'password123',
     phone: '1234567890',
     franchiseId: franchiseResponse.data.franchise._id
   });
   ```

### Creating and Processing Orders

```javascript
// 1. Create an order
const orderResponse = await axios.post('/api/orders', {
  product_id: 'product_id',
  deliveryAddress: 'address_id',
  franchise: 'franchise_id',
  subtotalAmount: 89.99,
  totalAmount: 99.99,
  deliveryCharge: 10.00
});

// 2. Update order status (as admin or manager)
await axios.patch(`/api/orders/${orderResponse.data.order._id}/status`, {
  deliverystatus: 'accepted'
});

// 3. Update payment status (as admin)
await axios.patch(`/api/orders/${orderResponse.data.order._id}/payment`, {
  paymentStatus: 'Paid',
  paymentid: 'payment_id'
});
```

## Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.# BlueMedix Application

BlueMedix is a comprehensive medical supplies management system with user, admin, and manager roles.

## Project Structure

The project is divided into two main parts:

1. **Server** - Backend API built with Node.js, Express, and MongoDB
2. **Client** - Frontend application built with React and Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
   ```
   cd Server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the Server directory with the following variables:
   ```
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bluemedix
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the client directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

4. Start the development server:
   ```
   npm start
   ```

## Features

- **Authentication System**
  - User registration and login
  - Role-based access control
  - Password reset functionality

- **User Management**
  - Admin can manage all users
  - User profile management
  - Status management (Active, Inactive, Suspended)

- **Franchise Management**
  - Create and manage franchises
  - Assign managers to franchises

- **Role-Based Dashboards**
  - Admin dashboard for system management
  - Manager dashboard for franchise management
  - User dashboard for product browsing and ordering

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/verify-email/:userId` - Verify user email

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:userId` - Get user by ID
- `PATCH /api/users/:userId` - Update user profile
- `PATCH /api/users/:userId/status` - Change user status (admin only)
- `POST /api/users/manager` - Create manager with franchise (admin only)
- `GET /api/users/managers` - Get all managers (admin only)
- `POST /api/users/change-password` - Change user password

### Franchise Management

- `POST /api/franchises` - Create a new franchise (admin only)
- `GET /api/franchises` - Get all franchises
- `GET /api/franchises/:franchiseId` - Get franchise by ID
- `PATCH /api/franchises/:franchiseId` - Update franchise (admin only)
- `POST /api/franchises/assign-manager` - Assign manager to franchise (admin only)

## License

This project is licensed under the MIT License.