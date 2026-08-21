import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Info,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { MediaItem } from "../types";
import { getBackdropUrl } from "../services/tmdb";
import { formatRating, formatRuntime, formatYear } from "../utils/helpers";

interface HeroProps {
  items: MediaItem[];
  onWatchNow: (item: MediaItem) => void;
  onViewDetails: (item: MediaItem) => void;
}

export const Hero: React.FC<HeroProps> = ({
  items,
  onWatchNow,
  onViewDetails,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  const changeSlide = useCallback(
    (newIndex: number) => {
      if (!items.length) return;

      let index = newIndex;

      if (index < 0) {
        index = items.length - 1;
      }

      if (index >= items.length) {
        index = 0;
      }

      setIsChanging(true);

      setTimeout(() => {
        setCurrentIndex(index);

        requestAnimationFrame(() => {
          setIsChanging(false);
        });
      }, 120);
    },
    [items.length],
  );

  // Next slide.
  const nextSlide = useCallback(() => {
    changeSlide(currentIndex + 1);
  }, [changeSlide, currentIndex]);

  // Previous slide.
  const prevSlide = useCallback(() => {
    changeSlide(currentIndex - 1);
  }, [changeSlide, currentIndex]);

  // autoplay

  useEffect(() => {
    if (items.length <= 1 || isHovered) {
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [items.length, isHovered]);

  // Keyboard navigation.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevSlide();
      }

      if (event.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  if (!items || items.length === 0) {
    return null;
  }

  const current = items[currentIndex] || items[0];

  const title =
    current.title ||
    current.name ||
    current.original_title ||
    current.original_name ||
    "Featured Title";

  const releaseDate = current.release_date || current.first_air_date;

  const year = formatYear(releaseDate);
  const rating = formatRating(current.vote_average);

  const isAnime =
    current.media_type === "anime" ||
    (current.original_language === "en" && current.genre_ids?.includes(16)) ||
    (current.genre_ids?.includes(16) && !current.title);

  const mediaLabel = isAnime
    ? "Anime"
    : current.media_type === "tv"
      ? "TV Series"
      : "Movie";

  const backdropUrl = getBackdropUrl(current.backdrop_path, "original");

  /* Show maximum 8 dots. */
  const visibleDots = Math.min(items.length, 8);

  return (
    <section
      className="app-hero relative w-full h-[85vh] min-h-[560px] max-h-[820px] overflow-hidden bg-[#050505] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Featured content carousel"
    >
      {/* BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">
        <img
          key={current.id}
          src={backdropUrl}
          className={`app-hero-image absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isChanging ? "opacity-0 " : "opacity-100 "
          }`}
        />

        {/* Left cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />

        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />

        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* CONTENT */}

      <div className="app-hero-content relative z-10 h-full max-w-7xl mx-auto px-2 sm:px-10 flex flex-col justify-end pb-14 sm:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* LEFT CONTENT*/}
          <div
            key={current.id}
            className={`app-hero-copy max-w-2xl flex flex-col gap-3.5 sm:gap-4 transition-all duration-500 ${
              isChanging
                ? "opacity-0 translate-x-0"
                : "opacity-100 translate-x-3"
            }`}
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold">
              {/* Media type */}

              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md bg-red-600 text-white">
                {mediaLabel === "Movie" ? (
                  <Film className="w-3.5 h-3.5" />
                ) : (
                  <Tv className="w-3.5 h-3.5" />
                )}

                {mediaLabel}
              </span>

              {/* Rating */}

              {rating !== "NR" && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white font-bold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {rating}
                </span>
              )}

              {/* Year */}

              {year && (
                <span className="flex items-center gap-1 text-neutral-200 rounded-full px-2.5 py-1 bg-white/10 border border-white/15 backdrop-blur-md">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {year}
                </span>
              )}

              {/* Runtime */}

              {current.runtime ? (
                <span className="flex items-center gap-1 text-neutral-300 rounded-full px-2.5 py-1 bg-white/5 border border-white/10 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {formatRuntime(current.runtime)}
                </span>
              ) : current.number_of_seasons ? (
                <span className="text-neutral-300 rounded-full px-2.5 py-1 bg-white/5 border border-white/10 backdrop-blur-md">
                  {current.number_of_seasons}{" "}
                  {current.number_of_seasons === 1 ? "Season" : "Seasons"}
                </span>
              ) : null}
            </div>

            {/* Title */}

            <h1 className="app-hero-title text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl line-clamp-2">
              {title}
            </h1>

            {/* Description */}

            <p className="app-hero-overview text-sm sm:text-base text-neutral-300 font-normal leading-relaxed line-clamp-3 max-w-xl drop-shadow">
              {current.overview ||
                "Explore the world of cinematic entertainment with high-definition streaming."}
            </p>

            {/* Buttons */}

            <div className="app-hero-actions flex items-center gap-3.5 pt-2">
              <button
                id="hero-watch-now-btn"
                onClick={() => onWatchNow(current)}
                className="px-7 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-red-600/40 hover:shadow-red-600/60 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />

                <span>Watch Now</span>
              </button>

              <button
                id="hero-more-info-btn"
                onClick={() => onViewDetails(current)}
                className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 border border-white/10 hover:border-white/25 backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Info className="w-4 h-4" />

                <span>More Info</span>
              </button>
            </div>
          </div>

          {/*CAROUSEL CONTROLS */}

          {items.length > 1 && (
            <div className="app-hero-carousel-controls flex items-center gap-3 self-start lg:self-end pb-2">
              {/* Previous */}

              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="group w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white/70 hover:text-white flex items-center justify-center border border-white/15 hover:border-white/30 backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 transition-transform" />
              </button>

              {/* Dots */}

              <div
                className="flex items-center gap-1.5 px-1"
                role="tablist"
                aria-label="Carousel slides"
              >
                {Array.from({ length: visibleDots }).map((_, idx) => {
                  const isLastDot = idx === visibleDots - 1 && items.length > 8;

                  const targetIndex = isLastDot ? items.length - 1 : idx;

                  const isActive =
                    currentIndex === targetIndex ||
                    (isLastDot && currentIndex >= 7);

                  return (
                    <button
                      key={idx}
                      onClick={() => changeSlide(targetIndex)}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to slide ${targetIndex + 1}`}
                      className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "w-7 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.55)]"
                          : "w-1.5 bg-neutral-600 hover:bg-neutral-400"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Next */}

              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="group w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white/70 hover:text-white flex items-center justify-center border border-white/15 hover:border-white/30 backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 transition-transform " />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
