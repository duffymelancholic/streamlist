import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const watchlistRouter = Router();

// Apply the authentication middleware to all routes in this router
watchlistRouter.use(authenticate as any);

/**
 * GET /api/list
 * Fetches all movie list items saved by the currently authenticated user.
 */
watchlistRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const items = await prisma.listItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Order newest saved titles first
    });
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch watchlist' });
  }
});

/**
 * POST /api/list/add
 * Adds a new movie/show to the current user's watchlist.
 * Expects JSON payload: { tmdbId: number, title: string, posterPath: string | null }
 */
watchlistRouter.post('/add', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { tmdbId, title, posterPath } = req.body;

    if (!tmdbId || !title) {
      return res.status(400).json({ error: 'tmdbId and title are required fields' });
    }

    const item = await prisma.listItem.create({
      data: {
        tmdbId: Number(tmdbId),
        title,
        posterPath: posterPath || null,
        userId,
      },
    });

    res.status(201).json(item);
  } catch (error: any) {
    // Catch unique constraint violation (Prisma P2002 error code)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This title is already in your watchlist' });
    }
    console.error('Error adding item to watchlist:', error);
    res.status(500).json({ error: error.message || 'Failed to add item to watchlist' });
  }
});

/**
 * DELETE /api/list/remove/:tmdbId
 * Removes a movie/show from the user's watchlist using its TMDB ID.
 */
watchlistRouter.delete('/remove/:tmdbId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const tmdbId = parseInt(req.params.tmdbId as string);

    if (isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    await prisma.listItem.delete({
      where: {
        userId_tmdbId: {
          userId,
          tmdbId,
        },
      },
    });

    res.json({ message: 'Title successfully removed from watchlist' });
  } catch (error: any) {
    // Record not found in DB (Prisma P2025 error code)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Title not found in your watchlist' });
    }
    console.error('Error removing item from watchlist:', error);
    res.status(500).json({ error: error.message || 'Failed to remove item from watchlist' });
  }
});
