import React, { useEffect } from "react";
import { X, Flame, Star, Clapperboard, Film, Tv } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MediaItem } from "../types";
import { getImageUrl } from "../services/tmdb";

export type Top10Category =
  | "trending_today"
  | "recently_released"
  | "top_rated"
  | "trending_movies"
  | "trending_tv";

export interface Top10CategoryConfig {
  id: Top10Category;
  label: string;
  headerTitle: string;
  icon: React.ReactNode;
}

export const TOP_10_CATEGORIES: Top10CategoryConfig[] = [
  {
    id: "trending_today",
    label: "Trending Today",
    headerTitle: "TRENDING TODAY",
    icon: <Flame className="w-4 h-4" />,
  },
  {
    id: "recently_released",
    label: "Recently Released",
    headerTitle: "RECENTLY RELEASED",
    icon: <Clapperboard className="w-4 h-4" />,
  },
  {
    id: "top_rated",
    label: "Top Rated",
    headerTitle: "TOP RATED",
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: "trending_movies",
    label: "Trending Movies This Week",
    headerTitle: "TRENDING MOVIES THIS WEEK",
    icon: <Film className="w-4 h-4" />,
  },
  {
    id: "trending_tv",
    label: "Trending TV Series This Week",
    headerTitle: "TRENDING TV SERIES THIS WEEK",
    icon: <Tv className="w-4 h-4" />,
  },
];

interface Top10ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: Top10Category;
  onCategoryChange: (category: Top10Category) => void;
  categoryItems: Record<Top10Category, MediaItem[]>;
  onSelectMedia: (item: MediaItem) => void;
}

// Shared easing curve, used everywhere so the whole modal feels consistent
const EASE = [0.22, 1, 0.36, 1] as const;

export const Top10Modal: React.FC<Top10ModalProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
  categoryItems,
  onSelectMedia,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const currentConfig =
    TOP_10_CATEGORIES.find((c) => c.id === activeCategory) ||
    TOP_10_CATEGORIES[0];
  const items = (categoryItems?.[activeCategory] || []).slice(0, 10);

  const handleCardClick = (item: MediaItem) => {
    onSelectMedia(item);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-0 bg-black/85"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            id="top-10-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 260,
              mass: 0.9,
              opacity: { duration: 0.25, ease: EASE },
            }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0c0c] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5 bg-[#080808]/90">
              <div className="flex items-center gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeCategory}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="text-lg sm:text-2xl font-black tracking-tight"
                  >
                    <span className="text-red-600 font-extrabold mr-2">
                      TOP 10
                    </span>
                    <span className="text-white font-extrabold">
                      {currentConfig.headerTitle}
                    </span>
                  </motion.h2>
                </AnimatePresence>
              </div>
              <motion.button
                id="close-top-10-modal-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.25, ease: EASE }}
                onClick={onClose}
                aria-label="Close Top 10"
                className="p-2 rounded-xl bg-white/5 hover:bg-red-600/20 text-neutral-400 hover:text-white transition-colors duration-300 cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </div>

            {/* Category Navigation Pills */}
            <div className="px-5 py-3 sm:px-8 bg-[#0a0a0a] overflow-x-auto scrollbar-none flex items-center gap-2">
              {TOP_10_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    id={`top10-tab-${cat.id}`}
                    layout
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="top10-pill-bg"
                        transition={{
                          type: "spring",
                          damping: 28,
                          stiffness: 300,
                        }}
                        className="absolute inset-0 bg-red-600 rounded-xl"
                      />
                    )}
                    {!isActive && (
                      <span className="absolute inset-0 bg-[#141414] rounded-xl border border-white/5 transition-colors duration-300" />
                    )}
                    <span className="relative flex items-center gap-2">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* 10 Items Grid (2 Columns, 5 Rows) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {items.length === 0 ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="py-16 text-center text-neutral-500"
                  >
                    <p>Loading Top 10 rankings...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeCategory}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={{
                      hidden: {},
                      show: {
                        transition: { staggerChildren: 0.035 },
                      },
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
                  >
                    {items.map((item, index) => {
                      const rank = index + 1;
                      const title = item.title || item.name || "Untitled";
                      const releaseDate =
                        item.release_date || item.first_air_date;
                      const year = releaseDate
                        ? new Date(releaseDate).getFullYear()
                        : null;
                      const rating = item.vote_average
                        ? item.vote_average.toFixed(1)
                        : "0.0";

                      return (
                        <motion.div
                          key={`${item.media_type || "media"}-${item.id}-${rank}`}
                          id={`top10-item-${rank}`}
                          variants={{
                            hidden: { opacity: 0, y: 14 },
                            show: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.4, ease: EASE },
                            },
                          }}
                          whileHover={{ scale: 1.015, y: -3 }}
                          whileTap={{ scale: 0.985 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          onClick={() => handleCardClick(item)}
                          className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#111111]/80 hover:bg-[#181818] border border-white/5 hover:border-red-600/30 transition-colors duration-300 cursor-pointer overflow-hidden shadow-md"
                        >
                          {/* Poster */}
                          <div className="relative w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 shadow-lg ring-1 ring-white/10">
                            <img
                              src={getImageUrl(item.poster_path, "w300")}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                          </div>

                          {/* Metadata & Overview */}
                          <div className="flex flex-col justify-center min-w-0 pr-12 sm:pr-14 relative z-10">
                            <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-red-400 transition-colors duration-300 line-clamp-1">
                              {title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 mb-1.5 font-medium">
                              <span className="flex items-center gap-1 font-bold text-amber-400">
                                ★ {rating}
                              </span>
                              {year && <span>{year}</span>}
                            </div>

                            <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                              {item.overview ||
                                "No synopsis available for this title."}
                            </p>
                          </div>

                          {/* Stylized Huge Rank Number on the Right (Watermark) */}
                          <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-5xl sm:text-7xl lg:text-8xl font-black italic select-none pointer-events-none text-white/10 group-hover:text-red-600/20 transition-colors duration-300">
                            {rank}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
