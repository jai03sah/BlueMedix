# BlueMedix API Documentation

This document provides information about the BlueMedix API endpoints, their functionality, and how to use them.

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Orders](#orders)
4. [Franchises](#franchises)
5. [Users](#users)
6. [API Testing](#api-testing)

## Authentication

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Create Admin

```
POST /api/auth/create-admin
```

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "phone": "1234567890",
  "adminSecretKey": "BluemedixAdmin"
}
```

## Products

### Create Product (Admin only)

```
POST /api/products
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "category": "category_id",
  "price": 99.99,
  "discount": 10,
  "warehouseStock": 100,
  "lowStockThreshold": 10,
  "image": ["image_url_1", "image_url_2"],
  "manufacturer": "Manufacturer Name",
  "publish": true
}
```

### Get All Products

```
GET /api/products
```

**Query Parameters:**
- `category`: Filter by category ID
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `publish`: Filter by publish status (true/false)
- `manufacturer`: Filter by manufacturer
- `search`: Search in name and description
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc/desc)
- `page`: Page number
- `limit`: Items per page

### Get Product by ID

```
GET /api/products/:productId
```

### Update Product (Admin only)

```
PUT /api/products/:productId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 129.99
}
```

### Delete Product (Admin only)

```
DELETE /api/products/:productId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Update Product Stock (Admin or Manager)

```
PATCH /api/products/:productId/stock
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "warehouseStock": 75
}
```

### Get Products by Category

```
GET /api/products/category/:categoryId
```

### CART

### Add Product to Cart

// POST /api/cart/add
// Headers: Authorization: Bearer <your_token>
// Request Body:

```json
{
  "productId": "67e6fdda632056979ec0bbb8",
  "quantity": 2,
  "franchiseId": "67e6c661397d0e2b6c7e177e"  
}
```

### Get User Cart

// GET /api/cart
// Headers: Authorization: Bearer <your_token>

### Update cart item quantity

// PUT /api/cart/item/:cartItemId
// Headers: Authorization: Bearer <your_token>
// Request Body:
```json
{
  "quantity": 3
}
```


// DELETE /api/cart/item/65f1a2b3c4d5e6f7a8b9c0d3
// Headers: Authorization: Bearer <your_token>

### Remove Item From Cart

```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

// DELETE /api/cart/clear
// Headers: Authorization: Bearer <your_token>

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

### Create Category(admin only)

// POST /api/categories
// Headers: Authorization: Bearer <admin_token>
// Request Body:

```json
{
  "name": "New Category",
  "image": "new_category.jpg"
}
```

### Update Category(update only)

// PUT /api/categories/65f1a2b3c4d5e6f7a8b9c0d7
// Headers: Authorization: Bearer <admin_token>
// Request Body:
```json
{
  "name": "Updated Category",
  "image": "updated_category.jpg"
}
```

### Delete Category(admin only)

// DELETE /api/categories/65f1a2b3c4d5e6f7a8b9c0d7
// Headers: Authorization: Bearer <admin_token>

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```
### Get Products count by category

// GET /api/categories/stats/products-count



### Update Franchise stock

// PUT /api/franchise-stock/franchise/65f1a2b3c4d5e6f7a8b9c0d2/product/65f1a2b3c4d5e6f7a8b9c0d1
// Headers: Authorization: Bearer <admin_or_franchise_manager_token>

```json
{
  "quantity": 10,
  "isAddition": true
}
```
### Get Franchise Stock

// PUT /api/franchise-stock/franchise/65f1a2b3c4d5e6f7a8b9c0d2/product/65f1a2b3c4d5e6f7a8b9c0d1
// Headers: Authorization: Bearer <admin_or_franchise_manager_token>

### Get Product Stock Across Franchises

// GET /api/franchise-stock/product/65f1a2b3c4d5e6f7a8b9c0d1
// Headers: Authorization: Bearer <your_token>

### Get Product Stock in Franchise

// GET /api/franchise-stock/franchise/65f1a2b3c4d5e6f7a8b9c0d2/product/65f1a2b3c4d5e6f7a8b9c0d1
// Headers: Authorization: Bearer <your_token>

### Get Low Stock items

// GET /api/franchise-stock/low-stock
// Headers: Authorization: Bearer <your_token>

### Delete Stock Entry(admin only)

// DELETE /api/franchise-stock/65f1a2b3c4d5e6f7a8b9c0d8
// Headers: Authorization: Bearer <admin_token>



## Orders

### Create Order

```
POST /api/orders
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "product_id": "product_id",
  "deliveryAddress": "address_id",
  "franchise": "franchise_id",
  "subtotalAmount": 89.99,
  "totalAmount": 99.99,
  "deliveryCharge": 10.00
}
```

### Get All Orders (Admin or Manager)

```
GET /api/orders
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `deliverystatus`: Filter by delivery status
- `paymentStatus`: Filter by payment status
- `franchiseId`: Filter by franchise ID
- `userId`: Filter by user ID
- `startDate`: Start date for filtering
- `endDate`: End date for filtering
- `page`: Page number
- `limit`: Items per page

### Get Order by ID (Admin or Manager)

```
GET /api/orders/:orderId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Update Order Status (Admin or Manager)

```
PATCH /api/orders/:orderId/status
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "deliverystatus": "accepted"
}
```

### Update Payment Status (Admin only)

```
PATCH /api/orders/:orderId/payment
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "paymentStatus": "Paid",
  "paymentid": "payment_id"
}
```

### Get User Orders

```
GET /api/orders/my-orders
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Generate Invoice (Admin or Manager)

```
POST /api/orders/:orderId/invoice
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "invoice_reciept": "invoice_url"
}
```

## Franchises

### Create Franchise (Admin only)

```
POST /api/franchises
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "City Blue Center",
  "address": {
    "street": "123 Street",
    "city": "new delhi",
    "state": "delhi",
    "pincode": "12345",
    "country": "India"
  },
  "contactNumber": "1234567890",
  "email": "citybluecenter@example.com",
  "isActive": true,
}
```

### Get All Franchises (Admin only)

```
GET /api/franchises
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Get Franchise by ID (Admin or Manager)

```
GET /api/franchises/:franchiseId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Update Franchise (Admin only)

```
PUT /api/franchises/:franchiseId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Updated Franchise Name",
  "contactNumber": "9876543210",
  "isActive": true
}
```

### Assign Manager to Franchise (Admin only)

```
POST /api/franchises/assign-manager
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "franchiseId": "franchise_id",
  "managerId": "manager_id"
}
```

### Get Franchise Orders (Admin or Manager)

```
GET /api/franchises/:franchiseId/orders
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `status`: Filter by delivery status
- `startDate`: Start date for filtering
- `endDate`: End date for filtering
- `page`: Page number
- `limit`: Items per page

### Get Franchise Statistics (Admin or Manager)

```
GET /api/franchises/:franchiseId/stats
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

## Users

### Get All Users (Admin only)

```
GET /api/users
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Get User by ID (Admin or Manager)

```
GET /api/users/:userId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Update User Profile

```
PATCH /api/users/:userId
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "img_url": "image_url"
}
```

### Change User Status (Admin only)

```
PATCH /api/users/:userId/status
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "status": "Active"
}
```

### Create Manager (Admin only)

```
POST /api/users/manager
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "Manager Name",
  "email": "manager@example.com",
  "password": "manager123",
  "phone": "1234567890",
  "franchiseId": "franchise_id" // Optional - can be assigned later
}
```

### Get All Managers (Admin only)

```
GET /api/users/managers
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### Change Password

```
POST /api/users/change-password
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## API Testing

The repository includes an API testing script that can be used to test all the endpoints. To run the tests:

1. Make sure the server is running
2. Run the following command:

```
node api-test.js
```

The test results will be saved to `api-test-results.json`.

## Error Handling

All API endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (if available)"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error