import type { StreamingProvider } from "../types";

export const streamingProviders: Record<string, StreamingProvider> = {
  vidsrc: {
    id: "vidsrc",
    name: "VidSrc",
    badge: "Popular",
    description:
      "High-speed multi-server streaming with HD/4K quality & subtitles.",
    quality: "4K",
    speed: "Ultra",
    isPopular: true,
    getMovieUrl: (id: number | string) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id: number | string, season: number, episode: number) =>
      `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  vidlink: {
    id: "vidlink",
    name: "VidLink",
    badge: "Fast",
    description:
      "Minimal ads, ultra-fast buffering, multi-language audio & captions.",
    quality: "1080p",
    speed: "Ultra",
    isPopular: true,
    getMovieUrl: (id: number | string) => `https://vidlink.pro/movie/${id}`,
    getTvUrl: (id: number | string, season: number, episode: number) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}`,
  },
  videasy: {
    id: "videasy",
    name: "Videasy",
    badge: "HD Player",
    description: "Clean responsive interface with adaptive bitrate streaming.",
    quality: "1080p",
    speed: "Fast",
    isPopular: true,
    getMovieUrl: (id: number | string) =>
      `https://player.videasy.net/movie/${id}`,
    getTvUrl: (id: number | string, season: number, episode: number) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}`,
  },
  // vidsrcme: {
  //   id: "vidsrcme",
  //   name: "VidSrc.me (Mirror)",
  //   badge: "Backup",
  //   description: "Alternative VidSrc cluster with high uptime.",
  //   quality: "1080p",
  //   speed: "Normal",
  //   getMovieUrl: (id: number | string) =>
  //     `https://vidsrc.me/embed/movie?tmdb=${id}`,
  //   getTvUrl: (id: number | string, season: number, episode: number) =>
  //     `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  // },
  // autoembed: {
  //   id: "autoembed",
  //   name: "AutoEmbed",
  //   badge: "Multi-Source",
  //   description: "Aggregates multiple streaming sources automatically.",
  //   quality: "1080p",
  //   speed: "Fast",
  //   getMovieUrl: (id: number | string) =>
  //     `https://autoembed.co/movie/tmdb/${id}`,
  //   getTvUrl: (id: number | string, season: number, episode: number) =>
  //     `https://autoembed.co/tv/tmdb/${id}/${season}/${episode}`,
  // },
  // vidsrcicu: {
  //   id: "vidsrcicu",
  //   name: "VidSrc.icu",
  //   badge: "Mirror",
  //   description: "Reliable secondary mirror with fast playback initialization.",
  //   quality: "1080p",
  //   speed: "Fast",
  //   getMovieUrl: (id: number | string) =>
  //     `https://vidsrc.icu/embed/movie/${id}`,
  //   getTvUrl: (id: number | string, season: number, episode: number) =>
  //     `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`,
  // },
  // twoembed: {
  //   id: "twoembed",
  //   name: "2Embed",
  //   badge: "Legacy",
  //   description: "Wide coverage of classic and international titles.",
  //   quality: "1080p",
  //   speed: "Normal",
  //   getMovieUrl: (id: number | string) => `https://www.2embed.cc/embed/${id}`,
  //   getTvUrl: (id: number | string, season: number, episode: number) =>
  //     `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  // },
};

export const DEFAULT_PROVIDER_ID = "vidsrc";

export const getStreamingUrl = (
  providerId: string,
  mediaType: "movie" | "tv" | "anime",
  tmdbId: number | string,
  season: number = 1,
  episode: number = 1,
): string => {
  const provider =
    streamingProviders[providerId] || streamingProviders[DEFAULT_PROVIDER_ID];

  if (mediaType === "movie") {
    return provider.getMovieUrl(tmdbId);
  } else {
    return provider.getTvUrl(tmdbId, season, episode);
  }
};

export const getProvidersList = (): StreamingProvider[] => {
  return Object.values(streamingProviders);
};
