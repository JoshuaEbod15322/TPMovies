import React, { useState, useEffect } from "react";
import {
  Play,
  Star,
  Calendar,
  Clock,
  ArrowLeft,
  Video,
  Users,
  AlertCircle,
} from "lucide-react";
import type { MediaDetails, MediaItem, VideoTrailer } from "../types";
import {
  getBackdropUrl,
  getImageUrl,
  getMovieDetails,
  getTVDetails,
} from "../services/tmdb";
import { getAnimeDetails } from "../services/animeApi";
import { MediaRow } from "../components/MediaRow";
import { TrailerModal } from "../components/TrailerModal";
import { DetailsSkeleton } from "../components/LoadingSkeleton";
import { formatRating, formatRuntime, formatYear } from "../utils/helpers";

interface DetailsProps {
  mediaId: number;
  mediaType: "movie" | "tv" | "anime";
  onBack: () => void;
  onWatch: (item: MediaItem, season?: number, episode?: number) => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const Details: React.FC<DetailsProps> = ({
  mediaId,
  mediaType,
  onBack,
  onWatch,
  onSelectMedia,
}) => {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let data: MediaDetails;
        if (mediaType === "movie") {
          data = await getMovieDetails(mediaId);
        } else if (mediaType === "anime") {
          data = await getAnimeDetails(mediaId);
        } else {
          data = await getTVDetails(mediaId);
        }

        if (isMounted) {
          setDetails(data);
          // Set first valid season
          if (data.seasons && data.seasons.length > 0) {
            const firstSeason =
              data.seasons.find((s) => s.season_number > 0) || data.seasons[0];
            setSelectedSeason(firstSeason.season_number);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load details for this title. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [mediaId, mediaType]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !details) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-2xl mx-auto flex flex-col items-center justify-center text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-white">Content Unavailable</h2>
        <p className="text-neutral-400 text-sm">
          {error || "Unable to load content details."}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  const title =
    details.title ||
    details.name ||
    details.original_title ||
    details.original_name ||
    "Details";
  const releaseDate = details.release_date || details.first_air_date;
  const year = formatYear(releaseDate);
  const rating = formatRating(details.vote_average);
  const isTvOrAnime = mediaType === "tv" || mediaType === "anime";

  // Find official trailer
  const trailer: VideoTrailer | null =
    details.videos?.results.find(
      (v) =>
        v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
    ) ||
    details.videos?.results[0] ||
    null;

  // Director or Creator
  const director = details.credits?.crew.find(
    (c) => c.job === "Director",
  )?.name;
  const creator = details.created_by?.map((c) => c.name).join(", ");

  return (
    <div className="min-h-screen pb-20 bg-[#050505] text-[#e5e5e5]">
      {/* Full-Screen Backdrop with Gradients */}
      <div className="app-details-hero relative w-full h-[65vh] min-h-[480px] max-h-[700px] overflow-hidden">
        <img
          src={getBackdropUrl(details.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover object-top filter brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent"></div>

        {/* Back navigation button */}
        <button
          onClick={onBack}
          aria-label="Back to Previous Page"
          className="absolute top-20 left-4 sm:left-8 z-20 px-3.5 py-2 rounded-xl bg-[#0d0d0d]/80 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="app-details-content max-w-7xl mx-auto px-4 sm:px-8 -mt-52 sm:-mt-64 relative z-10 flex flex-col gap-12">
        {/* Top Header Card */}
        <div className="app-details-layout grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column */}
          <div className="app-details-poster md:col-span-4 lg:col-span-3 flex flex-col gap-4">
            <div className="relative aspect-[2/3] w-full max-w-[280px] md:max-w-none mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-[#0d0d0d]">
              <img
                src={getImageUrl(details.poster_path, "w500")}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-yellow-400 text-xs font-bold border border-white/10 flex items-center gap-1 shadow">
                  <Star className="w-3.5 h-3.5 fill-yellow-500" />
                  {rating}
                </span>
              </div>
            </div>

            {/* Actions: Watch / Trailer */}
            <div className="app-details-actions flex flex-col gap-2.5 max-w-[280px] md:max-w-none mx-auto w-full">
              {!isTvOrAnime ? (
                <button
                  id="details-watch-movie-btn"
                  onClick={() => onWatch(details)}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch Movie Now</span>
                </button>
              ) : (
                <button
                  id="details-watch-series-btn"
                  onClick={() => onWatch(details, selectedSeason, 1)}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch Series Now</span>
                </button>
              )}

              {trailer && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#0d0d0d] hover:bg-neutral-900 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4 text-red-500" />
                  <span>Watch Official Trailer</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Overview Column */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-5 pt-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg uppercase tracking-wider font-extrabold bg-red-600 text-white">
                {mediaType === "anime"
                  ? "Anime"
                  : mediaType === "tv"
                    ? "TV Series"
                    : "Movie"}
              </span>

              {year && (
                <span className="flex items-center gap-1 text-neutral-300">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {year}
                </span>
              )}

              {details.runtime ? (
                <span className="flex items-center gap-1 text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {formatRuntime(details.runtime)}
                </span>
              ) : details.number_of_seasons ? (
                <span className="text-neutral-300">
                  {details.number_of_seasons} Seasons (
                  {details.number_of_episodes || 0} Episodes)
                </span>
              ) : null}
            </div>

            {/* Title */}
            <div>
              <h1 className="app-details-title text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              {details.japanese_title && details.japanese_title !== title && (
                <p className="text-base sm:text-lg text-red-400 font-semibold mt-1">
                  {details.japanese_title}
                </p>
              )}
              {details.tagline && (
                <p className="text-sm italic text-neutral-400 mt-2 font-serif">
                  &ldquo;{details.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap items-center gap-2">
              {details.genres?.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-lg bg-[#0d0d0d] border border-white/10 text-xs font-semibold text-neutral-200"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
                {details.overview || "No synopsis provided for this title."}
              </p>
            </div>

            {/* Key Personnel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
              {director && (
                <div>
                  <span className="text-neutral-500 font-semibold block uppercase">
                    Director
                  </span>
                  <span className="text-white font-medium">{director}</span>
                </div>
              )}
              {creator && (
                <div>
                  <span className="text-neutral-500 font-semibold block uppercase">
                    Created By
                  </span>
                  <span className="text-white font-medium">{creator}</span>
                </div>
              )}
              {details.original_language && (
                <div>
                  <span className="text-neutral-500 font-semibold block uppercase">
                    Original Language
                  </span>
                  <span className="text-white font-medium uppercase">
                    {details.original_language}
                  </span>
                </div>
              )}
              {details.production_companies &&
                details.production_companies.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-neutral-500 font-semibold block uppercase">
                      Studio / Production
                    </span>
                    <span className="text-white font-medium line-clamp-1">
                      {details.production_companies
                        .map((p) => p.name)
                        .join(", ")}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Cast Slider */}
        {details.credits?.cast && details.credits.cast.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Featured Cast
              </h2>
            </div>
            <div
              className="flex gap-4 overflow-x-auto scrollbar-none pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {details.credits.cast.slice(0, 14).map((actor) => (
                <div
                  key={actor.id}
                  className="flex-shrink-0 w-28 sm:w-32 flex flex-col items-center text-center gap-2"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-md">
                    <img
                      src={getImageUrl(actor.profile_path, "w300")}
                      alt={actor.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-white truncate">
                      {actor.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar / Recommended Content (3 Rows x 5 Columns) */}
        {((details.similar?.results && details.similar.results.length > 0) ||
          (details.recommendations?.results &&
            details.recommendations.results.length > 0)) && (
          <MediaRow
            title="More Like This"
            items={(
              details.recommendations?.results ||
              details.similar?.results ||
              []
            ).slice(0, 15)}
            onSelectMedia={onSelectMedia}
            limit={15}
          />
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        trailer={trailer}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={title}
      />
    </div>
  );
};
