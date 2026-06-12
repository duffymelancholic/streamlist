import { Router } from 'express';
import { tmdbService } from '../services/tmdb';

export const moviesRouter = Router();

/**
 * GET /api/movies/browse
 * Fetches multiple lists (Trending, Action, Comedy, Sci-Fi, Horror) in parallel for the dashboard page.
 */
moviesRouter.get('/browse', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;

    // Fetch rows in parallel to optimize latency
    const [trending, action, comedy, scifi, horror] = await Promise.all([
      tmdbService.getTrending(page),
      tmdbService.getMoviesByGenre(28, page),  // 28 = Action
      tmdbService.getMoviesByGenre(35, page),  // 35 = Comedy
      tmdbService.getMoviesByGenre(878, page), // 878 = Sci-Fi
      tmdbService.getMoviesByGenre(27, page),  // 27 = Horror
    ]);

    res.json({
      trending: trending.results || [],
      action: action.results || [],
      comedy: comedy.results || [],
      scifi: scifi.results || [],
      horror: horror.results || [],
    });
  } catch (error: any) {
    console.error('Error fetching browse movies:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch browse movies' });
  }
});

/**
 * GET /api/movies/search?query=...
 * Searches movies by keyword using TMDB API.
 */
moviesRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query parameter "query" is required' });
    }

    const searchResults = await tmdbService.searchMovies(query.trim(), page);
    res.json(searchResults.results || []);
  } catch (error: any) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: error.message || 'Failed to search movies' });
  }
});

/**
 * GET /api/movies/details/:id
 * Fetches complete details (backdrop, overview, score, runtime, release year etc.) for a single movie.
 */
moviesRouter.get('/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const details = await tmdbService.getMovieDetails(id);
    res.json(details);
  } catch (error: any) {
    console.error(`Error fetching movie details for ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch movie details' });
  }
});
