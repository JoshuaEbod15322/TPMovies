import React, { useState, useEffect } from "react";
import { Tv, AlertCircle, RefreshCw } from "lucide-react";
import type { MediaItem } from "../types";
import { MediaCard } from "../components/MediaCard";
import { MediaCardSkeleton, HeroSkeleton } from "../components/LoadingSkeleton";
import { Hero } from "../components/Hero";
import { discoverTV, getPopularTV, TV_GENRES } from "../services/tmdb";
import { Pagination } from "../components/Pagination";

interface TVSeriesProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia?: (item: MediaItem) => void;
}

export const TVSeries: React.FC<TVSeriesProps> = ({
  onSelectMedia,
  onWatchMedia,
}) => {
  const [heroShows, setHeroShows] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Hero featured TV Series once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadHeroTV() {
      try {
        const popData = await getPopularTV(1);
        if (!isMounted) return;
        const valid = (popData.results || []).filter(
          (t) => t.backdrop_path && t.overview,
        );
        const mapped = (
          valid.length > 0 ? valid.slice(0, 7) : popData.results.slice(0, 5)
        ).map((item) => ({ ...item, media_type: "tv" as const }));
        setHeroShows(mapped);
      } catch (err) {
        console.error("Error loading TV hero:", err);
      } finally {
        if (isMounted) setHeroLoading(false);
      }
    }
    loadHeroTV();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchShows = async (targetPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await discoverTV({
        page: targetPage,
        with_genres: selectedGenre,
        sort_by: "popularity.desc",
      });

      setTvShows(data.results);
      setTotalPages(data.total_pages);
    } catch (e) {
      setError(
        "Unable to load TV series. Please check your connection or try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchShows(1);
  }, [selectedGenre]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchShows(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Featured TV Series Hero Banner */}
      {heroLoading ? (
        <HeroSkeleton />
      ) : (
        <Hero
          items={heroShows}
          onWatchNow={(item) =>
            onWatchMedia ? onWatchMedia(item) : onSelectMedia(item)
          }
          onViewDetails={(item) => onSelectMedia(item)}
        />
      )}

      <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Genre Filter Toolbar */}
        <div className="app-category-toolbar bg-[#0d0d0d] border border-white/10 rounded-4xl p-4 mb-8 shadow-xl backdrop-blur-md">
          {/* Genre Tags */}
          <div
            className="app-category-scroll flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setSelectedGenre("")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === ""
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-black/60 text-neutral-300 hover:text-white hover:bg-neutral-900 border border-white/10"
              }`}
            >
              All Genres
            </button>
            {TV_GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === g.id
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                    : "bg-black/60 text-neutral-300 hover:text-white hover:bg-neutral-900 border border-white/10"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-8 my-8 rounded-2xl bg-[#0d0d0d] border border-red-500/30 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="font-semibold text-white">{error}</p>
            <button
              onClick={() => fetchShows(1)}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tvShows.length === 0 && (
          <div className="p-12 text-center my-8 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col items-center gap-3">
            <Tv className="w-12 h-12 text-neutral-600" />
            <h3 className="text-lg font-bold text-white">No TV Shows Found</h3>
            <p className="text-neutral-400 text-sm max-w-sm">
              Try selecting another genre to discover TV series.
            </p>
            <button
              onClick={() => setSelectedGenre("")}
              className="mt-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold cursor-pointer border border-white/10"
            >
              Reset to All Genres
            </button>
          </div>
        )}

        {/* TV Grid */}
        {!loading && !error && tvShows.length > 0 && (
          <>
            <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {tvShows.map((show) => (
                <MediaCard
                  key={`tv-${show.id}`}
                  item={show}
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
