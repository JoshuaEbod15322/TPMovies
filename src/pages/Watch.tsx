import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Users } from "lucide-react";
import type { CastMember, MediaDetails, MediaItem } from "../types";
import { VideoPlayer } from "../components/VideoPlayer";
import { StreamingSelector } from "../components/StreamingSelector";
import { EpisodeList } from "../components/EpisodeList";
import { MediaRow } from "../components/MediaRow";
import { CastModal } from "../components/CastModal";
import { getMovieDetails, getTVDetails } from "../services/tmdb";
import { getImageUrl } from "../services/tmdb";
import { getAnimeDetails } from "../services/animeApi";
import { saveProgress } from "../services/continueWatching";
import { DEFAULT_PROVIDER_ID } from "../services/streamingSources";

interface WatchProps {
  mediaItem: MediaItem;
  initialSeason?: number;
  initialEpisode?: number;
  onBack: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

const WatchCastCard: React.FC<{ actor: CastMember; onClick: () => void }> = ({
  actor,
  onClick,
}) => {
  const cleanName = actor.name.trim();
  const firstLetter = cleanName.charAt(0).toUpperCase() || "?";
  const [imageError, setImageError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 w-28 sm:w-32 flex flex-col items-center text-center gap-2 group cursor-pointer select-none focus:outline-none"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#16161a] border border-white/10 group-hover:border-red-500/50 shadow-md flex items-center justify-center transition-all duration-300">
        {actor.profile_path && !imageError ? (
          <img
            src={getImageUrl(actor.profile_path, "w300")}
            alt={cleanName}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-3xl sm:text-4xl font-black text-white">
            {firstLetter}
          </span>
        )}
      </div>
      <div className="w-full px-1">
        <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
          {cleanName || "Unknown"}
        </h4>
        <p className="text-[11px] text-neutral-400 truncate">
          {actor.character}
        </p>
      </div>
    </button>
  );
};

export const Watch: React.FC<WatchProps> = ({
  mediaItem,
  initialSeason = 1,
  initialEpisode = 1,
  onBack,
  onSelectMedia,
}) => {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [selectedProvider, setSelectedProvider] =
    useState<string>(DEFAULT_PROVIDER_ID);
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [, setLoading] = useState(true);
  const [selectedCast, setSelectedCast] = useState<CastMember | null>(null);

  const mediaType = mediaItem.media_type || (mediaItem.title ? "movie" : "tv");
  const isTvOrAnime = mediaType === "tv" || mediaType === "anime";

  // Fetch full details for episodes and recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchFullData = async () => {
      setLoading(true);
      try {
        let data: MediaDetails;
        if (mediaType === "movie") {
          data = await getMovieDetails(mediaItem.id);
        } else if (mediaType === "anime") {
          data = await getAnimeDetails(mediaItem.id);
        } else {
          data = await getTVDetails(mediaItem.id);
        }
        if (isMounted) {
          setDetails(data);
        }
      } catch (e) {
        console.error("Error loading media details for playback:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFullData();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [mediaItem.id, mediaType]);

  // Record playback progress in localStorage on mount / episode change
  useEffect(() => {
    if (!details && !mediaItem.title && !mediaItem.name) return;

    const source = details || mediaItem;
    const title =
      source.title ||
      source.name ||
      source.original_title ||
      source.original_name ||
      "Untitled";
    saveProgress({
      id: mediaItem.id,
      mediaType: mediaType,
      title: title,
      posterPath: source.poster_path,
      backdropPath: source.backdrop_path,
      season: isTvOrAnime ? season : undefined,
      episode: isTvOrAnime ? episode : undefined,
      rating: source.vote_average,
    });
  }, [details, mediaItem, season, episode, mediaType, isTvOrAnime]);

  const handleNextEpisode = () => {
    setEpisode((prev) => prev + 1);
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      setEpisode((prev) => prev - 1);
    }
  };

  const handleSelectEpisode = (s: number, ep: number) => {
    setSeason(s);
    setEpisode(ep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const title =
    details?.title ||
    details?.name ||
    details?.original_title ||
    details?.original_name ||
    mediaItem.title ||
    mediaItem.name ||
    mediaItem.original_title ||
    "Streaming";

  // Find total episodes in current season if known
  const currentSeasonMeta = details?.seasons?.find(
    (s) => s.season_number === season,
  );
  const totalEpisodesInSeason = currentSeasonMeta?.episode_count;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Breadcrumbs & Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 font-medium">
          <button
            onClick={onBack}
            className="hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
          {isTvOrAnime && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-red-400 font-bold">
                Season {season} Episode {episode}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Video Player Container */}
      <div className="w-full">
        <VideoPlayer
          mediaId={mediaItem.id}
          mediaType={mediaType}
          mediaTitle={title}
          season={season}
          episode={episode}
          totalEpisodesInSeason={totalEpisodesInSeason}
          selectedProviderId={selectedProvider}
          onProviderChange={setSelectedProvider}
          onNextEpisode={handleNextEpisode}
          onPrevEpisode={handlePrevEpisode}
        />
      </div>

      {/* Streaming Source Selector (VidSrc, VidLink, Videasy) */}
      <StreamingSelector
        selectedProviderId={selectedProvider}
        onSelectProvider={setSelectedProvider}
      />

      {/* Media Title & Description Card */}
      <div id="media-info-card">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-black text-red-600 tracking-tight leading-tight pt-2">
            {title}
          </h1>
          {mediaItem.japanese_title && mediaItem.japanese_title !== title && (
            <p className="text-xs sm:text-sm text-red-400 font-medium">
              {mediaItem.japanese_title}
            </p>
          )}
        </div>

        {(details?.overview || mediaItem.overview) && (
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-5xl">
            {details?.overview || mediaItem.overview}
          </p>
        )}

        {details?.credits?.cast && details.credits.cast.length > 0 && (
          <div className="flex flex-col gap-4 mt-15">
            <div className="flex items-center gap-2">
              <Users className="text-red-600" />
              <h2 className="text-xl sm:text-2xl font-bold ">Featured Cast</h2>
            </div>
            <div
              className="flex gap-4 overflow-x-auto scrollbar-none pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {details.credits.cast.slice(0, 16).map((actor) => (
                <WatchCastCard
                  key={actor.id}
                  actor={actor}
                  onClick={() => setSelectedCast(actor)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TV Series / Anime Season & Episode Guide */}
      {isTvOrAnime && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Episodes & Seasons
            </h2>
          </div>
          <EpisodeList
            mediaId={mediaItem.id}
            totalSeasons={details?.seasons || []}
            currentSeason={season}
            currentEpisode={episode}
            onSelectEpisode={handleSelectEpisode}
            mediaType={mediaType}
          />
        </div>
      )}

      {/* More Like This Row */}
      {((details?.recommendations?.results &&
        details.recommendations.results.length > 0) ||
        (details?.similar?.results && details.similar.results.length > 0)) && (
        <div className="recom mt-8 mx-[-15px]">
          <MediaRow
            title="You Might Also Like"
            items={(
              details?.recommendations?.results ||
              details?.similar?.results ||
              []
            ).slice(0, 12)}
            onSelectMedia={onSelectMedia}
          />
        </div>
      )}

      <CastModal
        isOpen={Boolean(selectedCast)}
        personId={selectedCast?.id || null}
        initialName={selectedCast?.name}
        initialProfilePath={selectedCast?.profile_path}
        onClose={() => setSelectedCast(null)}
        onSelectMedia={onSelectMedia}
      />
    </div>
  );
};
