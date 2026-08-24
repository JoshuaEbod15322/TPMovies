import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Flame,
  Laugh,
  Theater,
  Wand2,
  Skull,
  Search,
  Heart,
  Rocket,
  Zap,
  Sun,
  Trophy,
  ShieldAlert,
  Compass,
  FileVideo,
  Swords,
  ChevronDown,
} from "lucide-react";
import type { Genre, MediaItem } from "../types";
import { MediaCard } from "../components/MediaCard";
import { MediaCardSkeleton } from "../components/LoadingSkeleton";
import {
  discoverMovies,
  discoverTV,
  MOVIE_GENRES,
  TV_GENRES,
} from "../services/tmdb";
import { ANIME_GENRES, discoverAnimeByGenre } from "../services/animeApi";
import { Pagination } from "../components/Pagination";

interface GenresProps {
  onSelectMedia: (item: MediaItem) => void;
}

export const Genres: React.FC<GenresProps> = ({ onSelectMedia }) => {
  const [genreType, setGenreType] = useState<"movie" | "tv" | "anime">("movie");
  const [selectedGenreId, setSelectedGenreId] = useState<number>(28); // Default to Action
  const [selectedGenreName, setSelectedGenreName] = useState<string>("Action");
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const getGenreIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "action":
      case "action & adventure":
        return <Flame className="w-4 h-4 text-red-500" />;
      case "adventure":
        return <Compass className="w-4 h-4 text-red-500" />;
      case "animation":
        return <Sparkles className="w-4 h-4 text-red-500" />;
      case "comedy":
        return <Laugh className="w-4 h-4 text-red-500" />;
      case "crime":
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "documentary":
        return <FileVideo className="w-4 h-4 text-red-500" />;
      case "drama":
        return <Theater className="w-4 h-4 text-red-500" />;
      case "fantasy":
      case "fantasy & sci-fi":
      case "isekai & magic":
        return <Wand2 className="w-4 h-4 text-red-500" />;
      case "horror":
      case "horror & dark fantasy":
        return <Skull className="w-4 h-4 text-red-500" />;
      case "mystery":
      case "mystery & supernatural":
        return <Search className="w-4 h-4 text-red-500" />;
      case "romance":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "science fiction":
      case "sci-fi / mecha":
        return <Rocket className="w-4 h-4 text-red-500" />;
      case "thriller":
      case "shounen & martial arts":
        return <Zap className="w-4 h-4 text-red-500" />;
      case "war":
      case "war & politics":
        return <Swords className="w-4 h-4 text-red-500" />;
      case "sports & competition":
        return <Trophy className="w-4 h-4 text-red-500" />;
      default:
        return <Sun className="w-4 h-4 text-red-500" />;
    }
  };

  const fetchGenreContent = async (targetPage: number) => {
    setLoading(true);

    try {
      let data: { results: MediaItem[]; total_pages: number };
      if (genreType === "movie") {
        data = await discoverMovies({
          page: targetPage,
          with_genres: selectedGenreId,
          sort_by: sortBy,
        });
      } else if (genreType === "tv") {
        data = await discoverTV({
          page: targetPage,
          with_genres: selectedGenreId,
          sort_by: sortBy,
        });
      } else {
        data = await discoverAnimeByGenre(selectedGenreId, targetPage, sortBy);
      }

      setItems(data.results);
      setTotalPages(data.total_pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchGenreContent(1);
  }, [genreType, selectedGenreId, sortBy]);

  const handleSelectGenre = (genre: Genre) => {
    setSelectedGenreId(genre.id);
    setSelectedGenreName(genre.name);
    setIsGenreMenuOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchGenreContent(newPage);
  };

  const currentGenreList = (
    genreType === "anime"
      ? ANIME_GENRES
      : genreType === "tv"
        ? TV_GENRES
        : MOVIE_GENRES
  ).filter((g) => g.id !== 37 && g.name.toLowerCase() !== "western");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              Genre Discovery
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Browse by Genre
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Discover movies, TV shows, and anime tailored to your favorite
            styles and themes.
          </p>
        </div>

        {/* Media Type Tabs */}
        <div className="app-segment-tabs flex flex-wrap items-center justify-center gap-1 bg-[#0d0d0d] p-1 sm:p-1.5 rounded-2xl border border-white/10 mx-auto md:mx-0 w-fit max-w-full">
          <button
            onClick={() => {
              setGenreType("movie");
              setSelectedGenreId(28);
              setSelectedGenreName("Action");
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[15px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              genreType === "movie"
                ? "bg-red-600 text-white font-extrabold shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Movies
          </button>

          <button
            onClick={() => {
              setGenreType("tv");
              setSelectedGenreId(10759);
              setSelectedGenreName("Action & Adventure");
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[15px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              genreType === "tv"
                ? "bg-red-600 text-white font-extrabold shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            TV Series
          </button>

          <button
            onClick={() => {
              setGenreType("anime");
              setSelectedGenreId(10759);
              setSelectedGenreName("Action & Adventure");
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[15px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              genreType === "anime"
                ? "bg-red-600 text-white font-extrabold shadow-md"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Anime
          </button>
        </div>
      </div>

      {/* Mobile Genre Dropdown */}
      <div className="md:hidden mb-8">
        <button
          type="button"
          onClick={() => setIsGenreMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isGenreMenuOpen}
          aria-controls="mobile-genre-list"
          className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0d0d0d] border border-white/10 text-left text-sm font-semibold text-white"
        >
          <span className="flex items-center gap-2">
            {getGenreIcon(selectedGenreName)}
            {selectedGenreName}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              isGenreMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isGenreMenuOpen && (
          <div
            id="mobile-genre-list"
            className="mt-2 grid grid-cols-1 gap-1.5 p-2 rounded-xl bg-[#0d0d0d] border border-white/10 shadow-xl"
          >
            {currentGenreList.map((g) => {
              const isSelected = selectedGenreId === g.id;
              return (
                <button
                  key={g.slug || g.id}
                  type="button"
                  onClick={() => handleSelectGenre(g)}
                  className={`w-full p-2.5 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-red-800 text-white font-bold"
                      : "text-neutral-200 hover:bg-neutral-900"
                  }`}
                >
                  {getGenreIcon(g.name)}
                  <span className="text-xs font-semibold">{g.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Genre Pills Grid */}
      <div className="app-genre-grid hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-8">
        {currentGenreList.map((g) => {
          const isSelected = selectedGenreId === g.id;
          return (
            <button
              key={g.slug || g.id}
              onClick={() => handleSelectGenre(g)}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer group ${
                isSelected
                  ? "bg-red-800 text-white border-red-500 font-bold shadow-lg shadow-red-600/20 scale-[1.02]"
                  : "bg-[#0d0d0d] hover:bg-neutral-900 text-neutral-200 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex-shrink-0">{getGenreIcon(g.name)}</div>
              <span className="text-xs sm:text-sm font-semibold truncate">
                {g.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header with Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{selectedGenreName}</span>
          </h2>
        </div>

        {/* Sort by Custom Dropdown */}
        <div className="relative w-100 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsSortMenuOpen((prev) => !prev)}
            aria-expanded={isSortMenuOpen}
            className="w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[#0d0d0d] hover:bg-neutral-900 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-neutral-400 font-normal">Sort:</span>
              {sortBy === "popularity.desc" ? "Most Popular" : "Highest Rated"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                isSortMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isSortMenuOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-47 z-30 p-1.5 rounded-xl bg-[#0d0d0d] border border-white/10 shadow-xl backdrop-blur-md gap-1.5 flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setSortBy("popularity.desc");
                  setIsSortMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sortBy === "popularity.desc"
                    ? "bg-red-800 text-white font-bold"
                    : "text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                Most Popular
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy("vote_average.desc");
                  setIsSortMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sortBy === "vote_average.desc"
                    ? "bg-red-800 text-white font-bold"
                    : "text-neutral-200 hover:bg-neutral-900"
                }`}
              >
                Highest Rated
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <MediaCard
                key={`${genreType}-${item.id}`}
                item={{
                  ...item,
                  media_type:
                    genreType === "anime"
                      ? "anime"
                      : genreType === "tv"
                        ? "tv"
                        : "movie",
                }}
                onSelect={onSelectMedia}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </>
      ) : (
        <div className="p-12 text-center my-8 rounded-2xl bg-neutral-900/50 border border-white/10 text-neutral-400">
          <p>No content found in this genre. Try selecting another category.</p>
        </div>
      )}
    </div>
  );
};
