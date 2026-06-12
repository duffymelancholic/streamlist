import { authRouter } from './auth';
import { moviesRouter } from './routes/movies';
import { watchlistRouter } from './routes/watchlist';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware: Allows our frontend to communicate with this backend
app.use(cors());

// Middleware: Allows Express to understand JSON data sent in requests
app.use(express.json());

// Routes registration
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/list', watchlistRouter);

// A simple "Hello World" route to test if the server is working
app.get('/api/health', (req, res) => {
  res.json({ message: 'StreamList API is running!' });
});

// Start the server on port 4000 (or whatever port is in the .env file)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
