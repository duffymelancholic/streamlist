'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MovieModal from '@/components/MovieModal';

interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
}

interface MovieDetail {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

export default function MyListPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);

  const getToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/list', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your list');
        const data = await res.json();
        setItems(data);
        setWatchlistIds(data.map((item: WatchlistItem) => item.tmdbId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const openModal = async (tmdbId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/movies/details/${tmdbId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedMovie(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (tmdbId: number) => {
    await fetch(`http://localhost:4000/api/list/remove/${tmdbId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setItems((prev) => prev.filter((item) => item.tmdbId !== tmdbId));
    setWatchlistIds((prev) => prev.filter((id) => id !== tmdbId));
    if (selectedMovie?.id === tmdbId) setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="pt-24 px-8 pb-10">
        <h1 className="text-3xl font-bold mb-8">My List</h1>

        {loading && (
          <div className="flex justify-center mt-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">Your list is empty.</p>
            <p className="text-gray-600 text-sm mt-2">Go to Browse and add some titles!</p>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group cursor-pointer">
              <div onClick={() => openModal(item.tmdbId)}>
                {item.posterPath ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${item.posterPath}`}
                    alt={item.title}
                    className="w-full rounded-md object-cover aspect-[2/3] group-hover:opacity-70 transition-opacity"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs text-center px-2">{item.title}</span>
                  </div>
                )}
              </div>

              {/* Remove button shown on hover */}
              <button
                onClick={() => handleRemove(item.tmdbId)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/80 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                title="Remove from list"
              >
                ✕
              </button>
              <p className="text-xs text-gray-400 mt-1 text-center truncate">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isInWatchlist={watchlistIds.includes(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onWatchlistToggle={() => handleRemove(selectedMovie.id)}
        />
      )}
    </div>
  );
}
