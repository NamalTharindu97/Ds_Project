// Importing necessary modules
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file

mongoose
  .connect(process.env.MONGODB_URI) // Connect to MongoDB database
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express(); // Create express application

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: true })); // Parse incoming form data

// Endpoint to get PayPal client ID
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// Endpoint to get Google API key
app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

// Routes for handling file uploads
app.use('/api/upload', uploadRouter);

// Routes for handling product-related operations
app.use('/api/products', productRouter);

// Routes for handling user-related operations
app.use('/api/users', userRouter);

// Routes for handling order-related operations
app.use('/api/orders', orderRouter);

// Serve frontend build files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
