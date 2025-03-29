# BlueMedix Admin Setup Guide

This guide explains how to create an admin user for the BlueMedix application.

## Method 1: Using the Admin Creation Form

1. **Set up the Admin Secret Key**:
   - Open your Server `.env` file
   - Add the following line with a secure secret key:
     ```
     ADMIN_SECRET_KEY=your_secure_secret_key_here
     ```
   - Make sure to use a strong, unique password for this key

2. **Access the Admin Creation Page**:
   - Navigate to: `http://localhost:3000/create-admin`
   - This page is accessible without authentication

3. **Fill in the Admin Details**:
   - Full Name
   - Email Address
   - Phone Number
   - Password (and confirm)
   - Admin Secret Key (the one you set in the .env file)

4. **Submit the Form**:
   - Click "Create Admin Account"
   - If successful, you'll be redirected to the admin dashboard
   - If unsuccessful, check the error message and try again

## Method 2: Using the API Directly

You can also create an admin user by making a direct API request:

```bash
curl -X POST http://localhost:8080/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "phone": "1234567890",
    "adminSecretKey": "BluemedixAdmin"
  }'
```

## Method 3: Using MongoDB Directly (Emergency Access)

If you need emergency admin access, you can create an admin user directly in MongoDB:

1. Connect to your MongoDB database
2. Insert a new user document with role set to "admin"
3. Make sure to hash the password properly (the system uses bcrypt)

Example MongoDB command (not recommended except in emergencies):

```javascript
// This is a simplified example - the actual implementation would need to hash the password
db.users.insertOne({
  name: "Emergency Admin",
  email: "emergency@example.com",
  password: "hashed_password_here", // This should be properly hashed with bcrypt
  phone: "1234567890",
  role: "admin",
  Status: "Active",
  verify_email: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Security Considerations

- Keep your `ADMIN_SECRET_KEY` secure and change it periodically
- The admin creation page should be disabled or protected in production environments
- Consider implementing IP restrictions for admin creation in production
- Regularly audit the list of admin users in your system

## After Creating an Admin

Once you've created an admin user:

1. Log in with the admin credentials
2. You'll be redirected to the admin dashboard
3. From there, you can:
   - Manage users
   - Create managers
   - Manage franchises
   - Access all admin features

For security reasons, it's recommended to create only the necessary number of admin accounts and regularly review the list of administrators in your system.