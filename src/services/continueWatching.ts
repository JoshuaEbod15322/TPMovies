import type { ContinueWatchingItem } from "../types";

const STORAGE_KEY = "cinestream_continue_watching";

export const getContinueWatching = (): ContinueWatchingItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: ContinueWatchingItem[] = JSON.parse(raw);
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.error("Error reading continue watching from localStorage:", e);
    return [];
  }
};

export const saveProgress = (item: {
  id: number;
  mediaType: "movie" | "tv" | "anime";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  timestamp?: number;
  duration?: number;
  rating?: number;
}): void => {
  try {
    const current = getContinueWatching();
    // Filter out previous entry for same media/season/episode or same movie
    const filtered = current.filter((entry) => entry.id !== item.id);

    const newItem: ContinueWatchingItem = {
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      season: item.season,
      episode: item.episode,
      episodeTitle: item.episodeTitle,
      timestamp: item.timestamp || 0,
      duration: item.duration || 0,
      rating: item.rating,
      updatedAt: Date.now(),
    };

    // Store up to 20 recent items
    const updated = [newItem, ...filtered].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cinestream_continue_watching_updated"));
  } catch (e) {
    console.error("Error saving progress to localStorage:", e);
  }
};

export const removeFromContinueWatching = (id: number): void => {
  try {
    const current = getContinueWatching();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("cinestream_continue_watching_updated"));
  } catch (e) {
    console.error("Error removing item from continue watching:", e);
  }
};

export const clearAllContinueWatching = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("cinestream_continue_watching_updated"));
  } catch (e) {
    console.error("Error clearing continue watching:", e);
  }
};
