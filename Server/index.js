import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDb.js';

// Load environment variables first
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ADMIN_SECRET_KEY:', process.env.ADMIN_SECRET_KEY ? 'Set (value hidden)' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (value hidden)' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Connect to MongoDB
connectDB();

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import franchiseRoutes from './routes/franchise.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import cartRoutes from './routes/cart.routes.js';
import categoryRoutes from './routes/category.routes.js';
import franchiseStockRoutes from './routes/franchisestock.routes.js';
import addressRoutes from './routes/address.routes.js';

const app = express() ;

app.use(cors({
    credentials : true ,
    origin : process.env.FRONTEND_URL
}))

app.use(express.json()) ;
app.use(cookieParser()) ;
app.use(morgan()) ;
app.use(helmet({
    crossOriginResourcePolicy : false
}))

// Base route
app.get('/' , (req , res)=>{
    res.json({ message: "BlueMedix API", status: "running" });
})

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/franchises', franchiseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/franchise-stock', franchiseStockRoutes);
app.use('/api/addresses', addressRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
     console.log(`Server Started on port ${PORT}`);
});
