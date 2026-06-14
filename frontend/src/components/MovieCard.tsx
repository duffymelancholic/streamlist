'use client';


interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface Props {
  movie: Movie;
  isInWatchlist: boolean;
  onClick: () => void;
  onWatchlistToggle: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

export default function MovieCard({ movie, isInWatchlist, onClick, onWatchlistToggle }: Props) {
  return (
    <div
      className="relative flex-shrink-0 w-36 cursor-pointer group transition-transform duration-200 hover:scale-105 hover:z-10"
      onClick={onClick}
    >
      {movie.poster_path ? (
        <img
          src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="w-full rounded-md object-cover aspect-[2/3]"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-gray-800 rounded-md flex items-center justify-center">
          <span className="text-gray-400 text-xs text-center px-2">{movie.title}</span>
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex flex-col justify-end p-2">
        <p className="text-white text-xs font-semibold line-clamp-2">{movie.title}</p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent the card click (modal open) from also firing
            onWatchlistToggle();
          }}
          className={`mt-1 text-xs px-2 py-1 rounded font-medium transition-colors ${
            isInWatchlist
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isInWatchlist ? '✓ In My List' : '+ My List'}
        </button>
      </div>
    </div>
  );
}
