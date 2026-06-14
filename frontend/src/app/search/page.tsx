'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/MovieModal';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<number[]>([]);

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [searchRes, listRes] = await Promise.all([
          fetch(`http://localhost:4000/api/movies/search?query=${encodeURIComponent(query)}`),
          fetch('http://localhost:4000/api/list', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        const searchData = searchRes.ok ? await searchRes.json() : [];
        const listData = listRes.ok ? await listRes.json() : [];

        setResults(searchData);
        setWatchlist(listData.map((item: { tmdbId: number }) => item.tmdbId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleWatchlistToggle = async (movie: Movie) => {
    const token = getToken();
    const isInList = watchlist.includes(movie.id);

    if (isInList) {
      const res = await fetch(`http://localhost:4000/api/list/remove/${movie.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((id) => id !== movie.id));
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
      if (res.ok) {
        setWatchlist((prev) => [...prev, movie.id]);
      }
    }
  };

  return (
    <div className="pt-24 px-8 pb-10">
      <h1 className="text-2xl font-bold mb-2">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>

      {loading && (
        <div className="flex justify-center mt-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-gray-400 mt-10">No results found for &quot;{query}&quot;.</p>
      )}

      <div className="flex flex-wrap gap-4 mt-6">
        {results.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isInWatchlist={watchlist.includes(movie.id)}
            onClick={() => setSelectedMovie(movie)}
            onWatchlistToggle={() => handleWatchlistToggle(movie)}
          />
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

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <Suspense fallback={<div className="pt-24 px-8 text-gray-400">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
