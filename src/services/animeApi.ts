import type { Genre, MediaDetails, MediaItem } from "../types";
import { getSeasonDetails, getTVDetails } from "./tmdb";

export const ANIME_GENRES: Genre[] = [
  { id: 10759, name: "Action & Adventure", slug: "action", icon: "Flame" },
  { id: 35, name: "Comedy", slug: "comedy", icon: "Laugh" },
  { id: 18, name: "Drama", slug: "drama", icon: "Mask" },
  { id: 10765, name: "Fantasy & Sci-Fi", slug: "fantasy", icon: "Wand2" },
  { id: 9648, name: "Mystery & Supernatural", slug: "mystery", icon: "Search" },
  { id: 10749, name: "Romance", slug: "romance", icon: "Heart" },
  { id: 878, name: "Sci-Fi / Mecha", slug: "scifi", icon: "Rocket" },
  { id: 27, name: "Horror & Dark Fantasy", slug: "horror", icon: "Skull" },
  {
    id: 10751,
    name: "Slice of Life / Family",
    slug: "slice-of-life",
    icon: "Sun",
  },
  { id: 28, name: "Shounen & Martial Arts", slug: "shounen", icon: "Zap" },
  { id: 14, name: "Isekai & Magic", slug: "isekai", icon: "Sparkles" },
  { id: 10752, name: "Sports & Competition", slug: "sports", icon: "Trophy" },
];

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_API_KEY = "4e44d9029b1270a757cddc766a1bcb63";

const getApiKey = () => {
  const envKey = (import.meta as any).env?.VITE_TMDB_API_KEY;
  return envKey && envKey !== "MY_TMDB_API_KEY" && envKey.trim() !== ""
    ? envKey
    : DEFAULT_API_KEY;
};

const mapAnimeResult = (item: any, mediaType: "movie" | "tv"): MediaItem => ({
  ...item,
  media_type: mediaType === "movie" ? "movie" : "anime",
  anime_type: mediaType === "movie" ? "movie" : "series",
  japanese_title: item.original_title || item.original_name,
});

const discoverAnime = async (
  page: number,
  sortBy: string,
  extraParams: Record<string, string> = {},
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  const apiKey = getApiKey();
  const baseParams = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
    sort_by: sortBy,
    with_genres: "16",
    with_original_language: "ja",
    page: String(page),
    ...extraParams,
  });

  const [movieResponse, seriesResponse] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/discover/movie?${baseParams.toString()}`),
    fetch(`${TMDB_BASE_URL}/discover/tv?${baseParams.toString()}`),
  ]);
  const [movieData, seriesData] = await Promise.all([
    movieResponse.json(),
    seriesResponse.json(),
  ]);

  const results = [
    ...(movieData.results || []).map((item: any) =>
      mapAnimeResult(item, "movie"),
    ),
    ...(seriesData.results || []).map((item: any) =>
      mapAnimeResult(item, "tv"),
    ),
  ].sort((first, second) => (second.popularity || 0) - (first.popularity || 0));

  return {
    results,
    total_pages: Math.max(
      movieData.total_pages || 1,
      seriesData.total_pages || 1,
    ),
  };
};

// Discover anime with TMDB Animation genre (16) + Japanese origin
export const getTrendingAnime = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    return await discoverAnime(page, "popularity.desc", {
      "vote_count.gte": "20",
    });
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

export const getPopularAnime = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    return await discoverAnime(page, "popularity.desc", {
      "vote_count.gte": "50",
    });
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

export const getCurrentlyAiringAnime = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const apiKey = getApiKey();
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&with_genres=16&with_original_language=ja&air_date.gte=2024-01-01&with_status=0,1,2&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      results: (data.results || []).map((item: any) => ({
        ...item,
        media_type: "anime",
        japanese_title: item.original_name,
        airing_status: "Currently Airing",
      })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

export const getTopRatedAnime = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const apiKey = getApiKey();
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&language=en-US&sort_by=vote_average.desc&vote_count.gte=300&with_genres=16&with_original_language=ja&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      results: (data.results || []).map((item: any) => ({
        ...item,
        media_type: "anime",
        japanese_title: item.original_name,
      })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

export const getRecentlyReleasedAnime = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const apiKey = getApiKey();
    const currentYear = new Date().getFullYear();
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&language=en-US&sort_by=first_air_date.desc&first_air_date_year=${currentYear}&with_genres=16&with_original_language=ja&vote_count.gte=10&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      results: (data.results || []).map((item: any) => ({
        ...item,
        media_type: "anime",
        japanese_title: item.original_name,
      })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

export const discoverAnimeByGenre = async (
  genreId: number | string,
  page = 1,
  sortBy = "popularity.desc",
  firstAirDateYear = "",
  minimumRating = 0,
): Promise<{
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}> => {
  try {
    const extraParams: Record<string, string> = {
      "vote_count.gte": "10",
      ...(genreId ? { with_genres: `16,${genreId}` } : {}),
    };
    if (firstAirDateYear) extraParams.first_air_date_year = firstAirDateYear;
    if (minimumRating > 0)
      extraParams["vote_average.gte"] = String(minimumRating);
    const data = await discoverAnime(page, sortBy, extraParams);
    return {
      results: data.results,
      total_pages: data.total_pages,
      total_results: data.results.length,
    };
  } catch (e) {
    return { results: [], total_pages: 1, total_results: 0 };
  }
};

// Anime details: Fetch from TMDB TV details + enrich with Japanese studios & romaji title
export const getAnimeDetails = async (
  id: number | string,
): Promise<MediaDetails> => {
  const details = await getTVDetails(id);
  const studios = details.production_companies?.map((c) => c.name) || [];
  return {
    ...details,
    media_type: "anime",
    japanese_title: details.original_name,
    studios,
    episodes_count: details.number_of_episodes,
    airing_status: details.status,
  };
};

export { getSeasonDetails };
