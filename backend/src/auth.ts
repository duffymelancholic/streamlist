import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from './middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const authRouter = Router();

// A secret key used to sign our JWTs. (We will add this to .env later!)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

// SIGNUP ROUTE
authRouter.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 2. Hash the password before saving (NEVER save plain text passwords)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save the new user to the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // 4. Create a token so the user is instantly logged in
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during signup' });
  }
});

// LOGIN ROUTE
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 2. Compare the typed password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Create a token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// GET PROFILE ROUTE
// This allows the frontend to verify the session and load the user profile
authRouter.get('/me', authenticate as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Something went wrong while retrieving profile' });
  }
});

