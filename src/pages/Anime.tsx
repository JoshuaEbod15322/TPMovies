import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import type { MediaItem } from "../types";
import { MediaCard } from "../components/MediaCard";
import { MediaCardSkeleton, HeroSkeleton } from "../components/LoadingSkeleton";
import { Hero } from "../components/Hero";
import {
  ANIME_GENRES,
  getTrendingAnime,
  getPopularAnime,
  discoverAnimeByGenre,
} from "../services/animeApi";
import { Pagination } from "../components/Pagination";

interface AnimeProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia?: (item: MediaItem) => void;
}

export const Anime: React.FC<AnimeProps> = ({
  onSelectMedia,
  onWatchMedia,
}) => {
  const [heroAnime, setHeroAnime] = useState<MediaItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<number | string>("");
  const [animeList, setAnimeList] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Hero featured anime once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadHeroAnime() {
      try {
        const trendData = await getTrendingAnime(1);
        if (!isMounted) return;
        const valid = (trendData.results || []).filter(
          (a) => a.backdrop_path && a.overview,
        );
        const mapped = (
          valid.length > 0
            ? valid.slice(0, 7)
            : (trendData.results || []).slice(0, 5)
        ).map((item) => ({ ...item, media_type: "anime" as const }));
        setHeroAnime(mapped);
      } catch (err) {
        console.error("Error loading anime hero:", err);
      } finally {
        if (isMounted) setHeroLoading(false);
      }
    }
    loadHeroAnime();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchAnime = async (targetPage: number) => {
    setLoading(true);
    setError(null);

    try {
      let data: { results: MediaItem[]; total_pages: number };

      if (selectedGenre) {
        data = await discoverAnimeByGenre(
          selectedGenre,
          targetPage,
          "popularity.desc",
        );
      } else {
        data = await getPopularAnime(targetPage);
      }

      setAnimeList(data.results);
      setTotalPages(data.total_pages);
    } catch (e) {
      setError("Unable to load anime list. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAnime(1);
  }, [selectedGenre]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAnime(newPage);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Featured Anime Hero Banner */}
      {heroLoading ? (
        <HeroSkeleton />
      ) : (
        <Hero
          items={heroAnime}
          onWatchNow={(item) =>
            onWatchMedia ? onWatchMedia(item) : onSelectMedia(item)
          }
          onViewDetails={(item) => onSelectMedia(item)}
        />
      )}

      <div className="pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Genre Filter Toolbar */}
        <div className="app-category-toolbar bg-[#0d0d0d] border border-white/10 rounded-4xl p-3.5 mb-8">
          <div
            className="app-category-scroll flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setSelectedGenre("")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === ""
                  ? "bg-red-600 text-white border border-red-500 font-bold"
                  : "bg-black text-neutral-300 hover:text-white border border-white/10"
              }`}
            >
              All Genres
            </button>
            {ANIME_GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === g.id
                    ? "bg-red-600 text-white border border-red-500 font-bold"
                    : "bg-black text-neutral-300 hover:text-white border border-white/10"
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
              onClick={() => fetchAnime(1)}
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
        {!loading && !error && animeList.length === 0 && (
          <div className="p-12 text-center my-8 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col items-center gap-3">
            <Search className="w-12 h-12 text-neutral-600" />
            <h3 className="text-lg font-bold text-white">No Anime Found</h3>
            <p className="text-neutral-400 text-sm max-w-sm">
              Try selecting another anime genre to discover titles.
            </p>
          </div>
        )}

        {/* Anime Grid */}
        {!loading && !error && animeList.length > 0 && (
          <>
            <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {animeList.map((anime) => (
                <MediaCard
                  key={`anime-${anime.id}`}
                  item={{ ...anime, media_type: "anime" }}
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
