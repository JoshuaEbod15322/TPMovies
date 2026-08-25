import React from "react";
import { ChevronRight } from "lucide-react";
import type { MediaItem } from "../types";
import { MediaCard } from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  icon?: React.ReactNode;
  onSelectMedia: (item: MediaItem) => void;
  onViewAll?: () => void;
  onOpenTop10?: () => void;
  isLoading?: boolean;
  limit?: number;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  title,
  items,
  icon,
  onSelectMedia,
  onViewAll,
  isLoading = false,
  limit = 20,
}) => {
  if (!isLoading && (!items || items.length === 0)) {
    return null;
  }

  // Enforce 3 rows x 5 columns (15 items) per section
  const displayItems = items.slice(0, limit);

  return (
    <section className="relative px-4 sm:px-8 max-w-7xl mx-auto w-full pl-4 sm:pl-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-red-600">{icon}</div>}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {onViewAll && (
            <button
              id={`view-all-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              onClick={onViewAll}
              className="text-xs uppercase tracking-widest font-semibold text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Rows x 5 Columns Grid */}
      <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {displayItems.map((item) => (
          <MediaCard
            key={`${item.media_type || "media"}-${item.id}`}
            item={item}
            onSelect={onSelectMedia}
          />
        ))}
      </div>
    </section>
  );
};
