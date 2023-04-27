// Import required modules
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

// Create Express app instance
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Use userRouter for '/api/users' routes
app.use('/api/users', userRouter);

// Serve frontend static assets in production
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

// Handle server errors
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
