import express from 'express'; // Importing the Express library
import path from 'path'; // Importing the path library for file path operations
import mongoose from 'mongoose'; // Importing the Mongoose library for MongoDB object modeling
import dotenv from 'dotenv'; // Importing the dotenv library for loading environment variables
import productRouter from './routes/productRoutes.js'; // Importing the router for Product management
import cors from 'cors'; // Importing the CORS library for enabling Cross-Origin Resource Sharing

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
app.use('/api/products', productRouter); // API route for product management

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
