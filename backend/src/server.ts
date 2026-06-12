import { authRouter } from './auth';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from a .env file (we'll create this later)
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware: Allows our frontend to communicate with this backend
app.use(cors());

// Middleware: Allows Express to understand JSON data sent in requests
app.use(express.json());

// Any request that starts with /api/auth will be handled by our authRouter
app.use('/api/auth', authRouter);

// A simple "Hello World" route to test if the server is working
app.get('/api/health', (req, res) => {
  res.json({ message: 'StreamList API is running!' });
});

// Start the server on port 4000 (or whatever port is in the .env file)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
