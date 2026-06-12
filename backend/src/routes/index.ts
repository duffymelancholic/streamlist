import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// A simple test route to verify the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'Lord Nick of the couch, your backend is alive.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
