'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/browse" className="text-red-600 font-extrabold text-2xl tracking-tight">
        STREAMLIST
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/browse" className="text-gray-300 hover:text-white text-sm transition-colors">
          Home
        </Link>
        <Link href="/mylist" className="text-gray-300 hover:text-white text-sm transition-colors">
          My List
        </Link>
      </div>

      {/* Search + logout */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search titles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-black/60 border border-gray-700 text-white text-sm px-3 py-1.5 rounded-l focus:outline-none focus:border-red-600 w-40 md:w-56 transition-all"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-r transition-colors"
          >
            🔍
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs hidden md:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-300 hover:text-white border border-gray-700 px-3 py-1.5 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
