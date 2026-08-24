import React from "react";
import { History, Play, Trash2, X } from "lucide-react";
import type { ContinueWatchingItem } from "../types";
import { getImageUrl } from "../services/tmdb";
import {
  clearAllContinueWatching,
  removeFromContinueWatching,
} from "../services/continueWatching";
import { formatRelativeTime } from "../utils/helpers";

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
  onSelect: (item: ContinueWatchingItem) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  onSelect,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-8 px-4 sm:px-8 max-w-7xl mx-auto w-full pl-0 sm:pl-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-red-600" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Continue Watching
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-semibold">
            {items.length}
          </span>
        </div>

        <button
          onClick={() => clearAllContinueWatching()}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
          title="Clear all continue watching history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const isTvOrAnime =
            item.mediaType === "tv" || item.mediaType === "anime";
          const subText = isTvOrAnime
            ? `S${item.season || 1} : E${item.episode || 1}${item.episodeTitle ? ` - ${item.episodeTitle}` : ""}`
            : "Movie";

          return (
            <div
              key={`continue-${item.mediaType}-${item.id}-${item.season || 1}-${item.episode || 1}`}
              id={`continue-item-${item.id}`}
              className="flex-shrink-0 w-64 sm:w-72 bg-[#0d0d0d] border border-white/10 hover:border-red-600/50 rounded-xl overflow-hidden group relative flex flex-col shadow-lg transition-all duration-300"
            >
              {/* Backdrop / Poster Banner */}
              <div
                className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <img
                  src={getImageUrl(
                    item.backdropPath || item.posterPath,
                    "w500",
                  )}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Vignette & Play Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromContinueWatching(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white backdrop-blur-sm transition-colors cursor-pointer"
                  title="Remove from Continue Watching"
                  aria-label="Remove from Continue Watching"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Media Type Tag */}
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-black/80 text-white border border-white/10 backdrop-blur-md">
                    {item.mediaType}
                  </span>
                </div>
              </div>

              {/* Info Details */}
              <div className="p-3 flex flex-col flex-1 justify-between gap-1">
                <div>
                  <h3
                    className="text-sm font-semibold text-white group-hover:text-red-500 transition-colors line-clamp-1 cursor-pointer"
                    onClick={() => onSelect(item)}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {subText}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-neutral-500">
                  <span>{formatRelativeTime(item.updatedAt)}</span>
                  <button
                    onClick={() => onSelect(item)}
                    className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Resume</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
