import type {
  AiMovieRecommendationItem,
  AiRecommendationResponse,
} from "../types";
import { searchByType } from "./tmdb";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export interface GetAiRecommendationsParams {
  prompt: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function fetchAiMovieRecommendations({
  prompt,
  conversationHistory = [],
}: GetAiRecommendationsParams): Promise<AiRecommendationResponse> {
  const res = await fetch("/api/ai/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      conversationHistory,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error || `Server responded with status ${res.status}`,
    );
  }

  const data: AiRecommendationResponse = await res.json();

  // If recommendations were returned, enrich them with TMDB data in parallel
  if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    const enrichedRecommendations: AiMovieRecommendationItem[] =
      await Promise.all(
        data.recommendations.map(async (rec) => {
          try {
            // Search TMDB for the matching media type and full item metadata
            // Older fallback responses may omit mediaType; movie is the safe default.
            const searchType =
              rec.mediaType === "series" || rec.mediaType === "anime"
                ? "tv"
                : "movie";
            const searchResult = await searchByType(searchType, rec.title);
            if (searchResult.results && searchResult.results.length > 0) {
              const requestedTitle = normalizeTitle(rec.title);
              const matchedMedia = [...searchResult.results]
                .map((media) => {
                  const mediaTitle = normalizeTitle(
                    media.title || media.name || "",
                  );
                  const releaseDate =
                    media.release_date || media.first_air_date;
                  const exactTitle = mediaTitle === requestedTitle;
                  const matchingYear = Boolean(
                    rec.year && releaseDate?.startsWith(rec.year),
                  );
                  const titleSimilarity =
                    mediaTitle.includes(requestedTitle) ||
                    requestedTitle.includes(mediaTitle);

                  return {
                    media,
                    score:
                      (exactTitle ? 100 : 0) +
                      (matchingYear ? 50 : 0) +
                      (titleSimilarity ? 20 : 0) +
                      (media.poster_path ? 5 : 0) +
                      (media.popularity || 0) / 1000,
                  };
                })
                .sort((first, second) => second.score - first.score)[0];

              if (!matchedMedia || matchedMedia.score < 20) {
                return { ...rec, tmdbMedia: null };
              }

              return {
                ...rec,
                tmdbMedia: matchedMedia.media,
              };
            }
          } catch (e) {
            console.warn(`TMDB enrichment failed for "${rec.title}":`, e);
          }

          return {
            ...rec,
            tmdbMedia: null,
          };
        }),
      );

    return {
      ...data,
      recommendations: enrichedRecommendations,
    };
  }

  return data;
}
