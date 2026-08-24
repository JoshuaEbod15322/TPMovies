import React, { useState } from "react";
import { Star, Play, Film, Tv } from "lucide-react";
import type { MediaItem } from "../types";
import { getImageUrl } from "../services/tmdb";
import { formatRating, formatYear } from "../utils/helpers";

interface MediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  priority?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onSelect,
  priority = false,
}) => {
  const title =
    item.title ||
    item.name ||
    item.original_title ||
    item.original_name ||
    "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const year = formatYear(releaseDate);
  const rating = formatRating(item.vote_average);
  const isAnime = item.media_type === "anime";
  const [imageFailed, setImageFailed] = useState(!item.poster_path);
  const fallbackLetter = title.trim().charAt(0).toUpperCase() || "?";
  const mediaType = isAnime
    ? "Anime"
    : item.media_type === "tv"
      ? "TV Series"
      : "Movie";

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative flex flex-col cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#0d0d0d] shadow-md ring-1 ring-white/10 group-hover:ring-red-600/60 group-hover:shadow-red-600/10 group-hover:shadow-2xl transition-all">
        {imageFailed ? (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950 via-[#171717] to-black"
            aria-label={`${title} poster placeholder`}
          >
            <span className="text-7xl sm:text-8xl font-black text-red-500/80 drop-shadow-lg">
              {fallbackLetter}
            </span>
          </div>
        ) : (
          <img
            src={getImageUrl(item.poster_path, "w500")}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Dark Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Media Type Badge */}
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded shadow backdrop-blur-md flex items-center gap-1 bg-black/80 text-neutral-300 border border-white/10">
            {isAnime ? (
              <Tv className="w-3 h-3 text-purple-400" />
            ) : item.media_type === "tv" ? (
              <Tv className="w-3 h-3 text-blue-400" />
            ) : (
              <Film className="w-3 h-3 text-red-500" />
            )}
            {mediaType}
          </span>

          {/* Rating Badge */}
          {rating !== "NR" && (
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-black/80 text-white backdrop-blur-md flex items-center gap-1 shadow ring-1 ring-white/10">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              {rating}
            </span>
          )}
        </div>

        {/* Bottom subtle progress/year on poster */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none text-xs text-neutral-300 opacity-90 drop-shadow">
          <span className="font-medium text-[11px]">{year}</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/80 border border-white/10">
            HD
          </span>
        </div>
      </div>

      {/* Info beneath poster */}
      <div className="mt-2.5 flex flex-col">
        <h3
          title={title}
          className="text-sm font-semibold text-neutral-200 group-hover:text-red-500 transition-colors line-clamp-1"
        >
          {title}
        </h3>
        {/* {item.japanese_title && item.japanese_title !== title && (
          <p className="text-[11px] text-neutral-500 line-clamp-1 font-sans">
            {item.japanese_title}
          </p>
        )} */}
      </div>
    </div>
  );
};
