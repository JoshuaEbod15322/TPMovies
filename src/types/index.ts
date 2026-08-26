export type MediaType = "movie" | "tv" | "anime";

export interface Genre {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  origin_country?: string[];
  original_language?: string;
  popularity?: number;
  episode_run_time?: number[];

  // Anime specific
  japanese_title?: string;
  romaji_title?: string;
  studios?: string[];
  episodes_count?: number;
  airing_status?: string;
  anime_season?: string;
  anime_type?: "movie" | "series";
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episode_count: number;
  air_date: string;
  episodes?: Episode[];
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface MediaDetails extends MediaItem {
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoTrailer[];
  };
  similar?: {
    results: MediaItem[];
  };
  recommendations?: {
    results: MediaItem[];
  };
  seasons?: Season[];
  created_by?: { id: number; name: string; profile_path: string | null }[];
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  budget?: number;
  revenue?: number;
}

export interface ContinueWatchingItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  timestamp: number; // in seconds
  duration?: number;
  updatedAt: number; // Unix timestamp
  rating?: number;
}

export interface PersonCredit extends MediaItem {
  character?: string;
  job?: string;
  department?: string;
  credit_id?: string;
  episode_count?: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  gender?: number;
  also_known_as?: string[];
  homepage?: string | null;
  combined_credits?: {
    cast: PersonCredit[];
    crew: PersonCredit[];
  };
}

export interface StreamingProvider {
  id: string;
  name: string;
  badge?: string;
  description: string;
  quality: "1080p" | "4K" | "HD";
  speed: "Fast" | "Ultra" | "Normal";
  isPopular?: boolean;
  getMovieUrl: (tmdbId: number | string) => string;
  getTvUrl: (
    tmdbId: number | string,
    season: number,
    episode: number,
  ) => string;
}
