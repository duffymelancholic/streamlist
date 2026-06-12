import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('WARNING: TMDB_API_KEY is not defined in the environment variables!');
}

/**
 * Generic fetch helper for TMDB API
 */
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY || '',
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error (${response.status}): ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from TMDB endpoint ${endpoint}:`, error);
    throw error;
  }
}

/**
 * TMDB Service for fetching movie data
 */
export const tmdbService = {
  /**
   * Fetch trending movies of the week
   */
  async getTrending(page: number = 1) {
    return fetchFromTMDB('/trending/movie/week', { page: String(page) });
  },

  /**
   * Fetch movies by genre ID (e.g., 28 for Action, 35 for Comedy)
   */
  async getMoviesByGenre(genreId: number, page: number = 1) {
    return fetchFromTMDB('/discover/movie', {
      with_genres: String(genreId),
      page: String(page),
      sort_by: 'popularity.desc',
      'vote_count.gte': '100', // Filter out obscure titles for a better browse experience
    });
  },

  /**
   * Search movies by title
   */
  async searchMovies(query: string, page: number = 1) {
    return fetchFromTMDB('/search/movie', {
      query,
      page: String(page),
    });
  },

  /**
   * Fetch detailed info for a single movie
   */
  async getMovieDetails(movieId: number) {
    return fetchFromTMDB(`/movie/${movieId}`);
  }
};
