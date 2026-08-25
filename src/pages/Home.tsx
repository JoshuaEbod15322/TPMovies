import React, { useEffect, useState } from "react";
import { Compass, Film, Tv, Sparkles, Radio } from "lucide-react";
import type { MediaItem, ContinueWatchingItem } from "../types";
import { Hero } from "../components/Hero";
import { MediaRow } from "../components/MediaRow";
import { ContinueWatchingRow } from "../components/ContinueWatchingRow";
import { HeroSkeleton, MediaRowSkeleton } from "../components/LoadingSkeleton";
import { Top10Modal, TOP_10_CATEGORIES } from "../components/Top10Modal";
import type { Top10Category } from "../components/Top10Modal";
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTopRated,
  getRecentlyReleased,
} from "../services/tmdb";
import {
  getTrendingAnime,
  getPopularAnime,
  getCurrentlyAiringAnime,
} from "../services/animeApi";
import { useContinueWatching } from "../hooks/useLocalStorage";

interface HomeProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem, season?: number, episode?: number) => void;
  onNavigateTab: (tab: "movies" | "tv" | "anime" | "genres" | "search") => void;
}

export const Home: React.FC<HomeProps> = ({
  onSelectMedia,
  onWatchMedia,
  onNavigateTab,
}) => {
  const continueWatchingList = useContinueWatching();

  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [discoveryItems, setDiscoveryItems] = useState<MediaItem[]>([]);
  const [trendingToday, setTrendingToday] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [recentlyReleased, setRecentlyReleased] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  // const [trendingAnime, setTrendingAnime] = useState<MediaItem[]>([]);
  const [airingAnime, setAiringAnime] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Top 10 Modal state
  const [isTop10Open, setIsTop10Open] = useState(false);
  const [selectedTop10Category, setSelectedTop10Category] =
    useState<Top10Category>("trending_today");

  useEffect(() => {
    let isMounted = true;

    async function loadHomeContent() {
      setLoading(true);
      try {
        const [
          trendingAll,
          popMoviesData,
          popTvData,
          popAnimeData,
          topRatedData,
          recentMoviesData,
          trendMoviesData,
          trendTvData,
          trendAnimeData,
          airingAnimeData,
        ] = await Promise.allSettled([
          getTrending("all", "day"),
          getPopularMovies(1),
          getPopularTV(1),
          getPopularAnime(1),
          getTopRated("movie", 1),
          getRecentlyReleased("movie", 1),
          getTrending("movie", "week"),
          getTrending("tv", "week"),
          getTrendingAnime(1),
          getCurrentlyAiringAnime(1),
        ]);

        if (!isMounted) return;

        const trendingResults =
          trendingAll.status === "fulfilled" ? trendingAll.value : [];
        setTrendingToday(trendingResults);

        // Featured Hero Items: top trending items with backdrops
        const validHero = trendingResults.filter(
          (item) => item.backdrop_path && item.overview,
        );
        setHeroItems(
          validHero.length > 0
            ? validHero.slice(0, 7)
            : trendingResults.slice(0, 5),
        );

        const popMovies =
          popMoviesData.status === "fulfilled"
            ? popMoviesData.value.results
            : [];
        const popTv =
          popTvData.status === "fulfilled" ? popTvData.value.results : [];
        const popAnime =
          popAnimeData.status === "fulfilled" ? popAnimeData.value.results : [];
        const topRatedList =
          topRatedData.status === "fulfilled" ? topRatedData.value.results : [];
        const recentMovies =
          recentMoviesData.status === "fulfilled"
            ? recentMoviesData.value.results
            : [];
        const trendMovies =
          trendMoviesData.status === "fulfilled" ? trendMoviesData.value : [];
        const trendTv =
          trendTvData.status === "fulfilled" ? trendTvData.value : [];
        const trendAnime =
          trendAnimeData.status === "fulfilled"
            ? trendAnimeData.value.results
            : [];
        const airingAnimeList =
          airingAnimeData.status === "fulfilled"
            ? airingAnimeData.value.results
            : [];

        setPopularMovies(popMovies);
        setPopularTV(popTv);
        setPopularAnime(popAnime);
        setTopRated(topRatedList);
        setRecentlyReleased(recentMovies);
        setTrendingMovies(trendMovies);
        setTrendingTV(trendTv);
        // setTrendingAnime(trendAnime);
        setAiringAnime(airingAnimeList);

        // Build randomized Discovery pool comprising movies, series, and anime
        const mixedDiscoveryPool: MediaItem[] = [
          ...popMovies,
          ...popTv,
          ...popAnime,
          ...trendMovies,
          ...trendTv,
          ...trendAnime,
          ...recentMovies,
          ...airingAnimeList,
          ...trendingResults,
        ];

        // Deduplicate items by unique ID
        const uniqueDiscoveryMap = new Map<number | string, MediaItem>();
        mixedDiscoveryPool.forEach((item) => {
          if (item && item.id && (item.poster_path || item.backdrop_path)) {
            uniqueDiscoveryMap.set(item.id, item);
          }
        });

        // Randomly shuffle the mixed media pool
        const shuffledDiscovery = Array.from(uniqueDiscoveryMap.values()).sort(
          () => 0.5 - Math.random(),
        );

        setDiscoveryItems(shuffledDiscovery.slice(0, 24));
      } catch (err) {
        console.error("Error fetching home content:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenTop10 = (category: Top10Category) => {
    setSelectedTop10Category(category);
    setIsTop10Open(true);
  };

  const handleContinueWatchingSelect = (cwItem: ContinueWatchingItem) => {
    onWatchMedia(
      {
        id: cwItem.id,
        title: cwItem.title,
        name: cwItem.title,
        poster_path: cwItem.posterPath,
        backdrop_path: cwItem.backdropPath,
        media_type: cwItem.mediaType,
        overview: "",
        vote_average: cwItem.rating || 0,
      },
      cwItem.season || 1,
      cwItem.episode || 1,
    );
  };

  const categoryItemsMap: Record<Top10Category, MediaItem[]> = {
    trending_today: trendingToday,
    recently_released: recentlyReleased,
    top_rated: topRated,
    trending_movies: trendingMovies,
    trending_tv: trendingTV,
  };

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Hero Section */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <Hero
          items={heroItems}
          onWatchNow={(item) => onWatchMedia(item)}
          onViewDetails={(item) => onSelectMedia(item)}
        />
      )}

      {/* Continue Watching Section (Local Only) */}
      <ContinueWatchingRow
        items={continueWatchingList}
        onSelect={handleContinueWatchingSelect}
      />

      {/* Top 10 Spotlight Quick Selection Bar */}
      <section className="my-6 px-4 sm:px-8 max-w-7xl mx-auto w-full pl-4 sm:pl-0">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {TOP_10_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                id={`home-top10-btn-${cat.id}`}
                onClick={() => handleOpenTop10(cat.id)}
                className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-red-900 hover:text-white text-neutral-200 border border-white/10 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-red-600/20 hover:scale-[1.02] active:scale-98"
              >
                <span className="text-red-500 group-hover:text-white">
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Rows */}
      {loading ? (
        <>
          <MediaRowSkeleton title="Discovery" />
          <MediaRowSkeleton title="Popular Movies" />
          <MediaRowSkeleton title="Popular TV Series" />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {/* 🧭 Discovery (Random Movies, Series & Anime) */}
          <MediaRow
            title="Discovery"
            items={discoveryItems}
            icon={<Compass className="w-6 h-6 text-red-600" />}
            onSelectMedia={onSelectMedia}
            onViewAll={() => onNavigateTab("genres")}
          />

          {/* 🎬 Popular Movies */}
          <MediaRow
            title="Popular Movies"
            items={popularMovies}
            icon={<Film className="w-6 h-6 text-red-600" />}
            onSelectMedia={onSelectMedia}
            onViewAll={() => onNavigateTab("movies")}
          />

          {/* Popular TV Series */}
          <MediaRow
            title="Popular TV Series"
            items={popularTV}
            icon={<Tv className="w-6 h-6 text-red-500" />}
            onSelectMedia={onSelectMedia}
            onViewAll={() => onNavigateTab("tv")}
          />

          {/* 🍥 Popular Anime */}
          <MediaRow
            title="Popular Anime"
            items={popularAnime}
            icon={<Sparkles className="w-6 h-6 text-red-500" />}
            onSelectMedia={onSelectMedia}
            onViewAll={() => onNavigateTab("anime")}
          />

          {/* Currently Airing Anime */}
          <MediaRow
            title="Currently Airing Anime"
            items={airingAnime}
            icon={<Radio className="w-6 h-6 text-red-500" />}
            onSelectMedia={onSelectMedia}
            onViewAll={() => onNavigateTab("anime")}
          />
        </div>
      )}

      {/* Top 10 Modal */}
      <Top10Modal
        isOpen={isTop10Open}
        onClose={() => setIsTop10Open(false)}
        activeCategory={selectedTop10Category}
        onCategoryChange={(cat) => setSelectedTop10Category(cat)}
        categoryItems={categoryItemsMap}
        onSelectMedia={onSelectMedia}
      />
    </div>
  );
};
