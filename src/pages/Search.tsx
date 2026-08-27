import React, { useState, useEffect, useRef } from "react";
import {
  Search as SearchIcon,
  X,
  Film,
  Tv,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import type { MediaItem } from "../types";
import { MediaCard } from "../components/MediaCard";
import { MediaCardSkeleton } from "../components/LoadingSkeleton";
import { searchMulti, searchByType } from "../services/tmdb";

interface SearchProps {
  onSelectMedia: (item: MediaItem) => void;
  initialQuery?: string;
}

type SearchCategory = "all" | "movie" | "tv" | "anime";

export const Search: React.FC<SearchProps> = ({
  onSelectMedia,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>("all");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [trendingKeywords] = useState<string[]>([
    "Dune",
    "Attack on Titan",
    "Spider-Man",
    "Demon Slayer",
    "Breaking Bad",
    "Interstellar",
    "Jujutsu Kaisen",
    "Avengers",
    "Stranger Things",
    "Solo Leveling",
    "One Piece",
  ]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        if (category === "all") {
          const data = await searchMulti(query.trim(), 1);
          setResults(data.results);
        } else if (category === "movie") {
          const data = await searchByType("movie", query.trim(), 1);
          setResults(data.results);
        } else if (category === "tv") {
          const data = await searchByType("tv", query.trim(), 1);
          setResults(data.results);
        } else if (category === "anime") {
          // Search TV and filter ja origin or anime
          const data = await searchByType("tv", query.trim(), 1);
          const animeFiltered = data.results.map((i) => ({
            ...i,
            media_type: "anime" as const,
          }));
          setResults(animeFiltered);
        }
      } catch (e) {
        console.error("Search error:", e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, category]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleKeywordClick = (keyword: string) => {
    setQuery(keyword);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Search Header and Input */}
      <div className="max-w-3xl mx-auto flex flex-col gap-6 mb-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Global Search
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Instant search across thousands of Movies, TV Series, and Anime.
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 z-10">
            <SearchIcon className="w-5 h-5 text-red-600" />
          </div>
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, anime, movie, or series..."
            className="w-full pl-12 pr-12 py-4 bg-[#0d0d0d] text-white placeholder-neutral-500 text-base sm:text-lg font-medium rounded-3xl border border-white/15 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 shadow-2xl backdrop-blur-md transition-all"
          />
          {query && (
            <button
              onClick={handleClear}
              aria-label="Clear Search Input"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 active:scale-95 ${
              category === "all"
                ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20 scale-100"
                : "bg-[#0d0d0d] text-neutral-300 hover:text-white border border-white/10 hover:border-red-500"
            }`}
          >
            All Media
          </button>

          <button
            onClick={() => setCategory("movie")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 active:scale-95 ${
              category === "movie"
                ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20 scale-100"
                : "bg-[#0d0d0d] text-neutral-300 hover:text-white border border-white/10 hover:border-red-500"
            }`}
          >
            <Film className="w-4 h-4 transition-transform duration-300" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setCategory("tv")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 active:scale-95 ${
              category === "tv"
                ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20 scale-100"
                : "bg-[#0d0d0d] text-neutral-300 hover:text-white border border-white/10 hover:border-red-500"
            }`}
          >
            <Tv className="w-4 h-4 transition-transform duration-300" />
            <span>TV Series</span>
          </button>
        </div>

        {/* Popular Searches Keywords */}
        {!hasSearched && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-semibold">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Trending Searches:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {trendingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleKeywordClick(kw)}
                  className="px-3 py-1 rounded-lg bg-[#0d0d0d] hover:bg-neutral-900 text-neutral-300 hover:text-white hover:border-red-500/40 text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <div className="p-12 text-center my-8 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col items-center gap-3">
          <AlertCircle className="w-12 h-12 text-neutral-600" />
          <h3 className="text-lg font-bold text-white">
            No results found for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-neutral-400 text-sm max-w-sm">
            Try checking for spelling errors or searching for a general
            franchise name.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">
              Found {results.length} results for &ldquo;{query}&rdquo;
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {results.map((item) => (
              <MediaCard
                key={`${item.media_type || "media"}-${item.id}`}
                item={item}
                onSelect={onSelectMedia}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
