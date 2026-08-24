import type {
  Genre,
  MediaDetails,
  MediaItem,
  PersonDetails,
  Season,
} from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_API_KEY = "4e44d9029b1270a757cddc766a1bcb63";

// Get API Key from environment or use default public demo key
export const getTmdbApiKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_TMDB_API_KEY;
  if (envKey && envKey !== "MY_TMDB_API_KEY" && envKey.trim() !== "") {
    return envKey;
  }
  return DEFAULT_API_KEY;
};

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (
  path: string | null | undefined,
  size: "w300" | "w500" | "w780" | "w1280" | "original" = "w500",
): string => {
  if (!path) {
    return "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1280&auto=format&fit=crop&q=80";
    // return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "original",
): string => {
  if (!path) {
    return "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1280&auto=format&fit=crop&q=80";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Common TMDB Genre Map
export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: "Action", icon: "Flame" },
  { id: 12, name: "Adventure", icon: "Compass" },
  { id: 16, name: "Animation", icon: "Sparkles" },
  { id: 35, name: "Comedy", icon: "Laugh" },
  { id: 80, name: "Crime", icon: "ShieldAlert" },
  { id: 99, name: "Documentary", icon: "FileVideo" },
  { id: 18, name: "Drama", icon: "Mask" },
  { id: 10751, name: "Family", icon: "Users" },
  { id: 14, name: "Fantasy", icon: "Wand2" },
  { id: 36, name: "History", icon: "Hourglass" },
  { id: 27, name: "Horror", icon: "Skull" },
  { id: 10402, name: "Music", icon: "Music" },
  { id: 9648, name: "Mystery", icon: "Search" },
  { id: 10749, name: "Romance", icon: "Heart" },
  { id: 878, name: "Science Fiction", icon: "Rocket" },
  { id: 10770, name: "TV Movie", icon: "Tv" },
  { id: 53, name: "Thriller", icon: "Zap" },
  { id: 10752, name: "War", icon: "Swords" },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: "Action & Adventure", icon: "Flame" },
  { id: 16, name: "Animation", icon: "Sparkles" },
  { id: 35, name: "Comedy", icon: "Laugh" },
  { id: 80, name: "Crime", icon: "ShieldAlert" },
  { id: 99, name: "Documentary", icon: "FileVideo" },
  { id: 18, name: "Drama", icon: "Mask" },
  { id: 10751, name: "Family", icon: "Users" },
  { id: 10762, name: "Kids", icon: "Baby" },
  { id: 9648, name: "Mystery", icon: "Search" },
  { id: 10763, name: "News", icon: "Newspaper" },
  { id: 10764, name: "Reality", icon: "Radio" },
  { id: 10765, name: "Sci-Fi & Fantasy", icon: "Rocket" },
  { id: 10766, name: "Soap", icon: "Tv" },
  { id: 10767, name: "Talk", icon: "Mic" },
  { id: 10768, name: "War & Politics", icon: "Swords" },
];

export const WESTERN_GENRE_ID = 37;

// Fallback catalog in case of rate limits or offline
const FALLBACK_HERO: MediaItem = {
  id: 693134,
  title: "Dune: Part Two",
  name: "Dune: Part Two",
  overview:
    "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520b2q.jpg",
  vote_average: 8.3,
  vote_count: 5400,
  release_date: "2024-02-27",
  media_type: "movie",
  genre_ids: [878, 12],
  runtime: 166,
  tagline: "Long live the fighters.",
};

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
): Promise<T> {
  const apiKey = getTmdbApiKey();
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("language", "en-US");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Fetch error for ${endpoint}:`, err);
    throw err;
  }
}

// 1. Trending
export const getTrending = async (
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "day",
): Promise<MediaItem[]> => {
  try {
    const data = await tmdbFetch<{ results: MediaItem[] }>(
      `/trending/${mediaType}/${timeWindow}`,
    );
    return data.results.map((item) => ({
      ...item,
      media_type:
        item.media_type ||
        (mediaType === "all" ? (item.title ? "movie" : "tv") : mediaType),
    }));
  } catch (e) {
    return [FALLBACK_HERO];
  }
};

// 2. Popular Movies
export const getPopularMovies = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const data = await tmdbFetch<{ results: MediaItem[]; total_pages: number }>(
      `/movie/popular`,
      { page },
    );
    return {
      results: data.results.map((i) => ({ ...i, media_type: "movie" })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [FALLBACK_HERO], total_pages: 1 };
  }
};

// 3. Popular TV
export const getPopularTV = async (
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const data = await tmdbFetch<{ results: MediaItem[]; total_pages: number }>(
      `/tv/popular`,
      { page },
    );
    return {
      results: data.results.map((i) => ({ ...i, media_type: "tv" })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

// 4. Top Rated
export const getTopRated = async (
  mediaType: "movie" | "tv" = "movie",
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const data = await tmdbFetch<{ results: MediaItem[]; total_pages: number }>(
      `/${mediaType}/top_rated`,
      { page },
    );
    return {
      results: data.results.map((i) => ({ ...i, media_type: mediaType })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

// 5. Recently Released / Now Playing
export const getRecentlyReleased = async (
  mediaType: "movie" | "tv" = "movie",
  page = 1,
): Promise<{ results: MediaItem[]; total_pages: number }> => {
  try {
    const endpoint =
      mediaType === "movie" ? "/movie/now_playing" : "/tv/on_the_air";
    const data = await tmdbFetch<{ results: MediaItem[]; total_pages: number }>(
      endpoint,
      { page },
    );
    return {
      results: data.results.map((i) => ({ ...i, media_type: mediaType })),
      total_pages: data.total_pages || 1,
    };
  } catch (e) {
    return { results: [], total_pages: 1 };
  }
};

// 6. Discover Movies with filter & sort
export const discoverMovies = async (options: {
  page?: number;
  with_genres?: string | number;
  sort_by?: string;
  primary_release_year?: number | string;
  "vote_average.gte"?: number;
}): Promise<{
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}> => {
  try {
    const data = await tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/discover/movie", {
      page: options.page || 1,
      with_genres: options.with_genres || "",
      sort_by: options.sort_by || "popularity.desc",
      primary_release_year: options.primary_release_year || "",
      "vote_average.gte": options["vote_average.gte"] || "",
      include_adult: false,
    });
    return {
      results: data.results.map((i) => ({ ...i, media_type: "movie" })),
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (e) {
    return { results: [], total_pages: 1, total_results: 0 };
  }
};

// 7. Discover TV with filter & sort
export const discoverTV = async (options: {
  page?: number;
  with_genres?: string | number;
  sort_by?: string;
  first_air_date_year?: number | string;
  "vote_average.gte"?: number;
}): Promise<{
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}> => {
  try {
    const data = await tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/discover/tv", {
      page: options.page || 1,
      with_genres: options.with_genres || "",
      sort_by: options.sort_by || "popularity.desc",
      first_air_date_year: options.first_air_date_year || "",
      "vote_average.gte": options["vote_average.gte"] || "",
      include_adult: false,
    });
    return {
      results: data.results.map((i) => ({ ...i, media_type: "tv" })),
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (e) {
    return { results: [], total_pages: 1, total_results: 0 };
  }
};

// 8. Search Multi
export const searchMulti = async (
  query: string,
  page = 1,
): Promise<{
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}> => {
  if (!query.trim()) return { results: [], total_pages: 0, total_results: 0 };
  try {
    const data = await tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>("/search/multi", { query, page, include_adult: false });
    const valid = data.results.filter(
      (item) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        (item.poster_path || item.backdrop_path),
    );
    return {
      results: valid,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (e) {
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// 9. Search Specific (Movie / TV)
export const searchByType = async (
  type: "movie" | "tv",
  query: string,
  page = 1,
): Promise<{
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}> => {
  if (!query.trim()) return { results: [], total_pages: 0, total_results: 0 };
  try {
    const data = await tmdbFetch<{
      results: MediaItem[];
      total_pages: number;
      total_results: number;
    }>(`/search/${type}`, { query, page, include_adult: false });
    return {
      results: data.results.map((i) => ({ ...i, media_type: type })),
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (e) {
    return { results: [], total_pages: 0, total_results: 0 };
  }
};

// 10. Get Movie Details (with credits, videos, similar)
export const getMovieDetails = async (
  id: number | string,
): Promise<MediaDetails> => {
  const data = await tmdbFetch<MediaDetails>(`/movie/${id}`, {
    append_to_response: "credits,videos,similar,recommendations",
  });
  return { ...data, media_type: "movie" };
};

// 11. Get TV Details (with credits, videos, similar)
export const getTVDetails = async (
  id: number | string,
): Promise<MediaDetails> => {
  const data = await tmdbFetch<MediaDetails>(`/tv/${id}`, {
    append_to_response: "credits,videos,similar,recommendations",
  });
  return { ...data, media_type: "tv" };
};

// 12. Get Season Details (with episodes)
export const getSeasonDetails = async (
  tvId: number | string,
  seasonNumber: number,
): Promise<Season> => {
  return await tmdbFetch<Season>(`/tv/${tvId}/season/${seasonNumber}`);
};

// 13. Get Person / Cast Details (with combined credits)
export const getPersonDetails = async (
  personId: number | string,
): Promise<PersonDetails> => {
  return await tmdbFetch<PersonDetails>(`/person/${personId}`, {
    append_to_response: "combined_credits,external_ids",
  });
};
