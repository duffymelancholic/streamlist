'use client';

import { useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface Props {
  movie: Movie;
  isInWatchlist: boolean;
  onClose: () => void;
  onWatchlistToggle: () => void;
}

const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export default function MovieModal({ movie, isInWatchlist, onClose, onWatchlistToggle }: Props) {
  // Close the modal when the user presses the Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    // Dark overlay backdrop — clicking it closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* The modal box itself — stop clicks from bubbling up to the overlay */}
      <div
        className="bg-[#181818] rounded-lg overflow-hidden max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop image */}
        {movie.backdrop_path ? (
          <div className="relative w-full aspect-video">
            <img
              src={`${TMDB_BACKDROP_BASE}${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Movie details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                <span className="text-green-400 font-semibold">★ {rating}</span>
                <span>{year}</span>
              </div>
            </div>
            <button
              onClick={onWatchlistToggle}
              className={`flex-shrink-0 px-4 py-2 rounded font-semibold text-sm transition-colors ${
                isInWatchlist
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isInWatchlist ? '✓ In My List' : '+ Add to My List'}
            </button>
          </div>

          <p className="mt-4 text-gray-300 text-sm leading-relaxed line-clamp-4">
            {movie.overview || 'No description available.'}
          </p>
        </div>
      </div>
    </div>
  );
}
