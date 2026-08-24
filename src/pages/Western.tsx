import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import type { MediaItem } from "../types";
import { MediaCard } from "../components/MediaCard";
import { MediaCardSkeleton, HeroSkeleton } from "../components/LoadingSkeleton";
import { Hero } from "../components/Hero";
import { discoverMovies, discoverTV, WESTERN_GENRE_ID } from "../services/tmdb";
import { Pagination } from "../components/Pagination";

interface WesternProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia?: (item: MediaItem) => void;
}

type WesternMediaType = "all" | "movie" | "tv";

export const Western: React.FC<WesternProps> = ({
  onSelectMedia,
  onWatchMedia,
}) => {
  const [heroWestern, setHeroWestern] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [mediaType, setMediaType] = useState<WesternMediaType>("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Hero featured Western titles once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadHeroWestern() {
      try {
        const [movieData, tvData] = await Promise.all([
          discoverMovies({
            page: 1,
            with_genres: WESTERN_GENRE_ID,
            sort_by: "popularity.desc",
          }),
          discoverTV({
            page: 1,
            with_genres: WESTERN_GENRE_ID,
            sort_by: "popularity.desc",
          }),
        ]);

        if (!isMounted) return;

        const moviesMapped = (movieData.results || []).map((m) => ({
          ...m,
          media_type: "movie" as const,
        }));
        const tvMapped = (tvData.results || []).map((t) => ({
          ...t,
          media_type: "tv" as const,
        }));

        const combined = [...moviesMapped, ...tvMapped].filter(
          (item) => item.backdrop_path && item.overview,
        );

        // Sort by vote count / popularity
        combined.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        setHeroWestern(combined.slice(0, 7));
      } catch (err) {
        console.error("Error loading western hero:", err);
      } finally {
        if (isMounted) setHeroLoading(false);
      }
    }
    loadHeroWestern();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchWesternContent = async (targetPage: number) => {
    setLoading(true);
    setError(null);

    try {
      if (mediaType === "movie") {
        const data = await discoverMovies({
          page: targetPage,
          with_genres: WESTERN_GENRE_ID,
          sort_by: "popularity.desc",
        });
        setItems(data.results);
        setTotalPages(data.total_pages);
      } else if (mediaType === "tv") {
        const data = await discoverTV({
          page: targetPage,
          with_genres: WESTERN_GENRE_ID,
          sort_by: "popularity.desc",
        });
        setItems(data.results);
        setTotalPages(data.total_pages);
      } else {
        // Combined All Westerns
        const [movieData, tvData] = await Promise.all([
          discoverMovies({
            page: targetPage,
            with_genres: WESTERN_GENRE_ID,
            sort_by: "popularity.desc",
          }),
          discoverTV({
            page: targetPage,
            with_genres: WESTERN_GENRE_ID,
            sort_by: "popularity.desc",
          }),
        ]);

        const combined = [...movieData.results, ...tvData.results];
        combined.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        setItems(combined.slice(0, 20));
        setTotalPages(Math.max(movieData.total_pages, tvData.total_pages));
      }
    } catch (e) {
      setError("Unable to load Western titles. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWesternContent(1);
  }, [mediaType]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchWesternContent(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Featured Western Hero Banner */}
      {heroLoading ? (
        <HeroSkeleton />
      ) : (
        <Hero
          items={heroWestern}
          onWatchNow={(item) =>
            onWatchMedia ? onWatchMedia(item) : onSelectMedia(item)
          }
          onViewDetails={(item) => onSelectMedia(item)}
        />
      )}

      <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          {/* Media Type Tabs */}
          <div className="app-segment-tabs flex items-center gap-1 bg-[#0d0d0d] p-1.5 rounded-2xl border border-white/10">
            <button
              id="western-tab-all"
              onClick={() => setMediaType("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mediaType === "all"
                  ? "bg-red-600 text-white font-extrabold shadow-md"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              All Western
            </button>
            <button
              id="western-tab-movies"
              onClick={() => setMediaType("movie")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mediaType === "movie"
                  ? "bg-red-600 text-white font-extrabold shadow-md"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              Movies
            </button>
            <button
              id="western-tab-tv"
              onClick={() => setMediaType("tv")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mediaType === "tv"
                  ? "bg-red-600 text-white font-extrabold shadow-md"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              TV Series
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-8 my-8 rounded-2xl bg-[#0d0d0d] border border-red-500/30 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="font-semibold text-white">{error}</p>
            <button
              onClick={() => fetchWesternContent(1)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="p-12 text-center my-8 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col items-center gap-3">
            <Search className="w-12 h-12 text-neutral-600" />
            <h3 className="text-lg font-bold text-white">
              No Western Titles Found
            </h3>
            <p className="text-neutral-400 text-sm max-w-sm">
              Try switching media types to discover other Western titles.
            </p>
          </div>
        )}

        {/* Western Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {items.map((item) => (
                <MediaCard
                  key={`western-${item.media_type || "media"}-${item.id}`}
                  item={item}
                  onSelect={onSelectMedia}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};
