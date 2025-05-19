import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import errorHandler from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import stateRoutes from './routes/stateRoutes.js';
import stayRoutes from './routes/stayRoutes.js';

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;


// Database connection
const dbURL = process.env.MONGO_URI || process.env.dbURL;
mongoose
  .connect(dbURL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Add the new routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/stays', stayRoutes);

// Error handling middleware - should be last
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});