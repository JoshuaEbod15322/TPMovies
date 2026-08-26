import React, { useState, useEffect } from "react";
import {
  Play,
  Calendar,
  Clock,
  List,
  LayoutGrid,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { Episode, Season } from "../types";
import { getImageUrl } from "../services/tmdb";
import { getSeasonDetails } from "../services/tmdb";
import { formatRuntime } from "../utils/helpers";
import { Pagination } from "./Pagination";

interface EpisodeListProps {
  mediaId: number;
  totalSeasons?: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (
    season: number,
    episode: number,
    episodeTitle?: string,
  ) => void;
  mediaType?: "tv" | "anime";
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  mediaId,
  totalSeasons = [],
  currentSeason,
  currentEpisode,
  onSelectEpisode,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason || 1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
  const [episodePage, setEpisodePage] = useState(1);
  const [, setError] = useState<string | null>(null);
  const episodesPerPage = 12;

  // Sync selected season with prop
  useEffect(() => {
    if (currentSeason) {
      setSelectedSeason(currentSeason);
    }
    setEpisodePage(1);
  }, [currentSeason]);

  // Fetch season episodes
  useEffect(() => {
    let isMounted = true;
    const fetchEpisodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSeasonDetails(mediaId, selectedSeason);
        if (isMounted) {
          setSeasonData(data);
        }
      } catch (e) {
        if (isMounted) {
          setError("Could not load episodes for this season.");
          // Generate fallback list of episodes if totalSeasons provides count
          const seasonMeta = totalSeasons.find(
            (s) => s.season_number === selectedSeason,
          );
          const count = seasonMeta?.episode_count || 12;
          const fallbackEpisodes: Episode[] = Array.from({ length: count }).map(
            (_, idx) => ({
              id: idx + 1,
              episode_number: idx + 1,
              season_number: selectedSeason,
              name: `Episode ${idx + 1}`,
              overview: "Select to stream this episode via external sources.",
              still_path: null,
              air_date: "",
              vote_average: 0,
            }),
          );
          setSeasonData({
            id: selectedSeason,
            season_number: selectedSeason,
            name: `Season ${selectedSeason}`,
            overview: "",
            poster_path: null,
            episode_count: count,
            air_date: "",
            episodes: fallbackEpisodes,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEpisodes();
    return () => {
      isMounted = false;
    };
  }, [mediaId, selectedSeason, totalSeasons]);

  useEffect(() => {
    setEpisodePage(1);
  }, [selectedSeason]);

  // Filter valid seasons (exclude Season 0 specials unless requested)
  const validSeasons = totalSeasons.filter((s) => s.season_number > 0);
  const availableSeasons =
    validSeasons.length > 0
      ? validSeasons
      : [
          {
            id: 1,
            season_number: 1,
            name: "Season 1",
            episode_count: 12,
            air_date: "",
            poster_path: null,
            overview: "",
          },
        ];

  const episodes = seasonData?.episodes || [];
  const totalEpisodePages = Math.ceil(episodes.length / episodesPerPage);
  const visibleEpisodes = episodes.slice(
    (episodePage - 1) * episodesPerPage,
    episodePage * episodesPerPage,
  );

  return (
    <div className="flex flex-col gap-5 w-full bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
      {/* Top Header: Season Picker & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSeasonMenuOpen((isOpen) => !isOpen)}
              aria-expanded={isSeasonMenuOpen}
              aria-controls="mobile-season-list"
              className="flex items-center justify-between gap-2 w-full max-w-[260px] bg-[#0d0d0d] hover:bg-neutral-900 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm group"
            >
              <span className="truncate">
                {availableSeasons.find(
                  (s) => s.season_number === selectedSeason,
                )?.name || `Season ${selectedSeason}`}
              </span>

              <ChevronDown
                className={`w-4 h-4 shrink-0 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                  isSeasonMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSeasonMenuOpen && (
              <div
                id="mobile-season-list"
                className="absolute scrollbar-none left-0 top-full z-30 mt-2 w-29 max-h-64 overflow-y-auto p-2 rounded-xl bg-[#0d0d0d] border border-white/10 shadow-2xl"
              >
                {availableSeasons.map((s) => (
                  <button
                    key={s.season_number}
                    type="button"
                    onClick={() => {
                      setSelectedSeason(s.season_number);
                      setIsSeasonMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 font-bold rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      selectedSeason === s.season_number
                        ? "bg-red-600 text-white font-bold "
                        : "text-neutral-200 hover:bg-neutral-900 "
                    }`}
                  >
                    {s.name || `Season ${s.season_number}`}{" "}
                    {/* {s.episode_count ? `(${s.episode_count} episodes)` : ""} */}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-red-600 text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-red-600 text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-neutral-900 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Episodes View */}
      {!loading && episodes.length === 0 && (
        <div className="p-8 text-center text-neutral-400">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-white">
            No episodes found for this season.
          </p>
        </div>
      )}

      {!loading && episodes.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEpisodes.map((ep) => {
            const isPlaying =
              selectedSeason === currentSeason &&
              ep.episode_number === currentEpisode;
            return (
              <div
                key={ep.id || ep.episode_number}
                id={`episode-card-${ep.episode_number}`}
                onClick={() =>
                  onSelectEpisode(selectedSeason, ep.episode_number, ep.name)
                }
                className={`group relative rounded-xl border p-3 flex flex-col gap-2.5 transition-all cursor-pointer overflow-hidden ${
                  isPlaying
                    ? "bg-red-600/15 border-red-600 ring-2 ring-red-600/30"
                    : "bg-black/60 hover:bg-neutral-900/90 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src={getImageUrl(ep.still_path, "w500")}
                    alt={ep.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isPlaying
                          ? "bg-red-600 text-white scale-105"
                          : "bg-black/70 text-white group-hover:bg-red-600 group-hover:text-white"
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Ep number chip */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-bold rounded bg-black/70 text-red-500 backdrop-blur-sm border border-white/10">
                    EPISODE {ep.episode_number}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold line-clamp-1 ${
                        isPlaying
                          ? "text-red-500"
                          : "text-white group-hover:text-red-500"
                      }`}
                    >
                      {ep.episode_number}.{" "}
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h4>
                  </div>
                  {ep.overview && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {ep.overview}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
                    {ep.air_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-600" />
                        {ep.air_date}
                      </span>
                    )}
                    {ep.runtime ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        {formatRuntime(ep.runtime)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && episodes.length > 0 && viewMode === "list" && (
        <div className="flex flex-col divide-y divide-white/5">
          {visibleEpisodes.map((ep) => {
            const isPlaying =
              selectedSeason === currentSeason &&
              ep.episode_number === currentEpisode;
            return (
              <div
                key={ep.id || ep.episode_number}
                onClick={() =>
                  onSelectEpisode(selectedSeason, ep.episode_number, ep.name)
                }
                className={`py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isPlaying
                    ? "bg-red-600/15 text-red-400"
                    : "hover:bg-white/5 text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold w-12 text-neutral-500 flex-shrink-0">
                    EP {ep.episode_number}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-white">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </span>
                    {ep.air_date && (
                      <span className="text-xs text-neutral-500">
                        {ep.air_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPlaying
                        ? "bg-red-600 text-white"
                        : "bg-white/5 text-neutral-300 group-hover:bg-red-600 group-hover:text-white"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPlaying ? "Playing" : "Watch"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && episodes.length > 0 && (
        <Pagination
          currentPage={episodePage}
          totalPages={totalEpisodePages}
          onPageChange={setEpisodePage}
          isLoading={loading}
        />
      )}
    </div>
  );
};
