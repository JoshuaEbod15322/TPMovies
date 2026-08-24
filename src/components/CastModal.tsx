import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Film,
  Tv,
  Star,
  Calendar,
  MapPin,
  Search,
  Clapperboard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MediaItem, PersonDetails, PersonCredit } from "../types";
import { getImageUrl, getPersonDetails } from "../services/tmdb";
import { formatRating, formatYear } from "../utils/helpers";

interface CastModalProps {
  personId: number | null;
  initialName?: string;
  initialProfilePath?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

type FilterTab = "all" | "movie" | "tv";

export const CastModal: React.FC<CastModalProps> = ({
  personId,
  initialName,
  initialProfilePath,
  isOpen,
  onClose,
  onSelectMedia,
}) => {
  const [details, setDetails] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [failedPosterKeys, setFailedPosterKeys] = useState<Set<string>>(
    new Set(),
  );

  // Fetch person data when modal opens with a valid personId
  useEffect(() => {
    if (!isOpen || !personId) {
      setDetails(null);
      setImageError(false);
      setIsBioExpanded(false);
      setSearchQuery("");
      setActiveTab("all");
      setFailedPosterKeys(new Set());
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setImageError(false);
    setFailedPosterKeys(new Set());

    getPersonDetails(personId)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load cast details:", err);
          setError("Could not load cast member filmography.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, personId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const displayName = details?.name || initialName || "Cast Member";
  const cleanName = displayName.trim();
  const firstLetter =
    cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() : "?";
  const profilePath = details?.profile_path || initialProfilePath;
  const showImage = Boolean(profilePath) && !imageError;

  // Calculate Age from birthday
  const getAge = (birthday: string, deathday?: string | null) => {
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Combine and deduplicate filmography (cast + director/crew items)
  const filmography = useMemo(() => {
    if (!details?.combined_credits) return [];

    const castList = details.combined_credits.cast || [];
    const crewList = (details.combined_credits.crew || []).filter(
      (item) =>
        item.job === "Director" ||
        item.job === "Executive Producer" ||
        item.department === "Directing",
    );

    // Map by unique key (media_type + id) to avoid duplicates
    const itemMap = new Map<string, PersonCredit>();

    castList.forEach((item) => {
      const key = `${item.media_type || "movie"}-${item.id}`;
      itemMap.set(key, item);
    });

    crewList.forEach((item) => {
      const key = `${item.media_type || "movie"}-${item.id}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, item);
      }
    });

    let list = Array.from(itemMap.values());

    // Filter by Tab (all, movie, tv)
    if (activeTab === "movie") {
      list = list.filter((i) => i.media_type === "movie");
    } else if (activeTab === "tv") {
      list = list.filter((i) => i.media_type === "tv");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const title = (item.title || item.name || "").toLowerCase();
        const character = (item.character || item.job || "").toLowerCase();
        return title.includes(q) || character.includes(q);
      });
    }

    // Keep the default filmography order by popularity.
    list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return list;
  }, [details, activeTab, searchQuery]);

  // Counts for tabs
  const movieCount = useMemo(() => {
    return (
      details?.combined_credits?.cast?.filter((i) => i.media_type === "movie")
        .length || 0
    );
  }, [details]);

  const tvCount = useMemo(() => {
    return (
      details?.combined_credits?.cast?.filter((i) => i.media_type === "tv")
        .length || 0
    );
  }, [details]);

  const totalCount = movieCount + tvCount;

  const handleMediaClick = (item: PersonCredit) => {
    onSelectMedia({
      ...item,
      media_type: (item.media_type as "movie" | "tv") || "movie",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            id="cast-details-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 240,
              mass: 0.8,
            }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0c0e] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 border-b border-white/10 bg-[#08080a]/95 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
                  <Clapperboard className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{displayName}</span>
                  </h2>
                </div>
              </div>

              <motion.button
                id="close-cast-modal-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label="Close cast modal"
                className="p-2 rounded-xl bg-white/5 hover:bg-red-600/20 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
              {/* Cast Profile Section */}
              <div className="flex flex-col md:flex-row gap-5 sm:gap-7 items-center md:items-start bg-[#121216]/70 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                {/* Profile Picture / Letter Avatar */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#18181f] border border-white/15 shadow-xl flex-shrink-0 flex items-center justify-center">
                  {showImage ? (
                    <img
                      src={getImageUrl(profilePath, "w500")}
                      alt={displayName}
                      loading="lazy"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Initial Letter Fallback */
                    <div className="w-full h-full flex items-center justify-center bg-[#1c1c24] select-none">
                      <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">
                        {firstLetter}
                      </span>
                    </div>
                  )}
                </div>

                {/* Person Information & Bio */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {displayName}
                    </h3>
                    {details?.also_known_as &&
                      details.also_known_as.length > 0 && (
                        <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xl">
                          Also known as:{" "}
                          {details.also_known_as.slice(0, 3).join(", ")}
                        </p>
                      )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    {details?.birthday && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span>
                          {details.birthday}
                          {details.deathday
                            ? ` — ${details.deathday}`
                            : ` (Age ${getAge(details.birthday, details.deathday)})`}
                        </span>
                      </span>
                    )}

                    {details?.place_of_birth && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate max-w-xs">
                          {details.place_of_birth}
                        </span>
                      </span>
                    )}

                    {details?.popularity !== undefined &&
                      details.popularity > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-amber-400" />
                          <span>
                            Popularity: {details.popularity.toFixed(1)}
                          </span>
                        </span>
                      )}
                  </div>

                  {/* Biography */}
                  {details?.biography ? (
                    <div className="pt-2 text-left">
                      <p
                        className={`text-xs sm:text-sm text-neutral-300 leading-relaxed ${
                          !isBioExpanded ? "line-clamp-3" : ""
                        }`}
                      >
                        {details.biography}
                      </p>
                      {details.biography.length > 220 && (
                        <button
                          onClick={() => setIsBioExpanded(!isBioExpanded)}
                          className="mt-1 text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isBioExpanded ? (
                            <>
                              Show less <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : loading ? (
                    <div className="space-y-2 pt-2 animate-pulse">
                      <div className="h-3.5 bg-white/10 rounded w-full" />
                      <div className="h-3.5 bg-white/10 rounded w-4/5" />
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic pt-1">
                      No biography available for this artist.
                    </p>
                  )}
                </div>
              </div>

              {/* Filmography Section Header & Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-extrabold text-white">
                      Filmography
                    </h4>
                  </div>

                  {/* Search and Sort controls */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* In-modal Search input */}
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search titles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#16161c] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Pills (All / Movies / TV Series) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === "all"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-[#15151a] text-neutral-400 hover:text-white border border-white/5"
                    }`}
                  >
                    <span>All ({totalCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("movie")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === "movie"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-[#15151a] text-neutral-400 hover:text-white border border-white/5"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Movies ({movieCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tv")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === "tv"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-[#15151a] text-neutral-400 hover:text-white border border-white/5"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Series ({tvCount})</span>
                  </button>
                </div>

                {/* Filmography Media Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-[#141419] rounded-2xl overflow-hidden border border-white/5 flex flex-col"
                      >
                        <div className="aspect-[2/3] bg-neutral-800" />
                        <div className="p-3 space-y-2">
                          <div className="h-3.5 bg-neutral-700 rounded w-3/4" />
                          <div className="h-2.5 bg-neutral-800 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="py-12 text-center text-neutral-400 bg-[#121216]/50 rounded-2xl border border-white/5">
                    <p className="text-sm">{error}</p>
                  </div>
                ) : filmography.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 bg-[#121216]/50 rounded-2xl border border-white/5">
                    <p className="text-sm">
                      No titles found for this selection.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 pt-2">
                    {filmography.map((item) => {
                      const title = item.title || item.name || "Untitled";
                      const posterKey = `${item.media_type || "movie"}-${item.id}`;
                      const fallbackLetter =
                        title.trim().charAt(0).toUpperCase() || "?";
                      const releaseDate =
                        item.release_date || item.first_air_date;
                      const year = formatYear(releaseDate);
                      const rating = formatRating(item.vote_average);
                      const isMovie = item.media_type === "movie";
                      const showPoster =
                        Boolean(item.poster_path) &&
                        !failedPosterKeys.has(posterKey);

                      return (
                        <motion.div
                          key={`${item.media_type}-${item.id}-${item.credit_id || item.character || ""}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 26,
                            mass: 0.6,
                          }}
                          onClick={() => handleMediaClick(item)}
                          className="group relative flex flex-col bg-[#131318] hover:bg-[#181820] border border-white/10 hover:border-red-500/40 rounded-2xl overflow-hidden shadow-lg transition-colors duration-300 cursor-pointer"
                        >
                          {/* Poster Container */}
                          <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                            {showPoster ? (
                              <img
                                src={getImageUrl(item.poster_path, "w300")}
                                alt={title}
                                loading="lazy"
                                onError={() =>
                                  setFailedPosterKeys((previous) => {
                                    const next = new Set(previous);
                                    next.add(posterKey);
                                    return next;
                                  })
                                }
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950 via-[#171717] to-black"
                                aria-label={`${title} poster placeholder`}
                              >
                                <span className="text-6xl sm:text-7xl font-black text-red-500/80 drop-shadow-lg">
                                  {fallbackLetter}
                                </span>
                              </div>
                            )}

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                              {/* Media Type Badge */}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/80 text-neutral-300 border border-white/10 backdrop-blur-md flex items-center gap-1">
                                {isMovie ? (
                                  <Film className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Tv className="w-3 h-3 text-blue-400" />
                                )}
                                {isMovie ? "Movie" : "Series"}
                              </span>

                              {/* Rating */}
                              {item.vote_average > 0 && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-400 border border-white/10">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span>{rating}</span>
                                </span>
                              )}
                            </div>

                            {/* Year Pill Bottom Left */}
                            {year && (
                              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/80 backdrop-blur-md text-neutral-300">
                                {year}
                              </span>
                            )}
                          </div>

                          {/* Info Footer */}
                          <div className="p-3 flex flex-col flex-1 justify-between gap-1">
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                {title}
                              </h5>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
