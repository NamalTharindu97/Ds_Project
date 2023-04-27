import express from 'express'; // Importing the Express library
import path from 'path'; // Importing the path library for file path operations
import mongoose from 'mongoose'; // Importing the Mongoose library for MongoDB object modeling
import dotenv from 'dotenv'; // Importing the dotenv library for loading environment variables
import cors from 'cors'; // Importing the CORS library for enabling Cross-Origin Resource Sharing

import orderRouter from './routes/orderRoutes.js'; // Importing the router for order management

dotenv.config(); // Loading environment variables from .env file

// Connecting to MongoDB database
mongoose
  .connect(process.env.MONGODB_URI) // MongoDB connection URI stored in .env file
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express(); // Creating an Express app

app.use(cors()); // Enabling Cross-Origin Resource Sharing
app.use(express.json()); // Parsing JSON data in request body
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded data in request body

// Route for getting PayPal client ID
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb'); // PayPal client ID stored in .env file
});
// Route for getting Google API key
app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' });
});
// API route for order management
app.use('/api/orders', orderRouter);

const __dirname = path.resolve(); // Setting the root directory of the project
app.use(express.static(path.join(__dirname, '/frontend/build'))); // Serving static files from frontend/build directory
app.get(
  '*',
  (req, res) => res.sendFile(path.join(__dirname, '/frontend/build/index.html')) // Serving index.html file for all other requests
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 4000; // Setting the server port number
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`); // Starting the server and logging a message to console
});
