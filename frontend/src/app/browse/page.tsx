'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';
import Navbar from '@/components/Navbar';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface GenreRow {
  name: string;
  movies: Movie[];
}

export default function BrowsePage() {
  const [genres, setGenres] = useState<GenreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<number[]>([]);

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [browseRes, listRes] = await Promise.all([
          fetch('http://localhost:4000/api/movies/browse'),
          fetch('http://localhost:4000/api/list', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        if (!browseRes.ok) throw new Error('Failed to fetch movies');

        const browseData = await browseRes.json();
        const listData = listRes.ok ? await listRes.json() : [];

        setGenres([
          { name: 'Trending Now', movies: browseData.trending },
          { name: 'Action', movies: browseData.action },
          { name: 'Comedy', movies: browseData.comedy },
          { name: 'Sci-Fi', movies: browseData.scifi },
          { name: 'Horror', movies: browseData.horror },
        ]);

        setWatchlist(listData.map((item: { tmdbId: number }) => item.tmdbId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWatchlistToggle = async (movie: Movie) => {
    const token = getToken();
    const isInList = watchlist.includes(movie.id);
    setListError('');

    if (isInList) {
      const res = await fetch(`http://localhost:4000/api/list/remove/${movie.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only update local state if the server confirmed the deletion
      if (res.ok) {
        setWatchlist((prev) => prev.filter((id) => id !== movie.id));
      } else {
        const data = await res.json().catch(() => ({}));
        setListError(data.error || 'Failed to remove from list');
      }
    } else {
      const res = await fetch('http://localhost:4000/api/list/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
        }),
      });
      // Only update local state if the server confirmed the save
      if (res.ok) {
        setWatchlist((prev) => [...prev, movie.id]);
      } else {
        const data = await res.json().catch(() => ({}));
        setListError(data.error || 'Failed to add to list');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      {/* Inline error banner — appears when an add/remove API call fails */}
      {listError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-700 text-white text-sm px-5 py-3 rounded-lg shadow-lg">
          {listError}
        </div>
      )}
      <div className="pt-20 pb-10">
        {genres.map((genre) => (
          <div key={genre.name} className="mb-8">
            <h2 className="text-xl font-semibold px-8 mb-3 text-gray-200">{genre.name}</h2>
            <div className="flex gap-3 overflow-x-auto px-8 pb-2 scrollbar-hide">
              {genre.movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isInWatchlist={watchlist.includes(movie.id)}
                  onClick={() => setSelectedMovie(movie)}
                  onWatchlistToggle={() => handleWatchlistToggle(movie)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isInWatchlist={watchlist.includes(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onWatchlistToggle={() => handleWatchlistToggle(selectedMovie)}
        />
      )}
    </div>
  );
}
