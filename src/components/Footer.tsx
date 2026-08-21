import React from "react";
import { ShieldCheck } from "lucide-react";
import type { NavTab } from "./Navbar";
import ptLogo from "../assets/PTlogo.png";

interface FooterProps {
  onNavigate: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/5 pt-12 pb-8 mt-16 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
        {/* Brand & Nav */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex flex-col gap-2">
            <div
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img src={ptLogo} alt="PTMovies Logo" className="w-6 h-6" />
              <span className="text-lg font-black tracking-ti ght text-red-600">
                TP<span className="text-white">Movies</span>
              </span>
            </div>
            <p className="text-neutral-500 text-xs max-w-sm">
              Discover and stream movies, TV shows, and anime with full
              high-definition players, and casting support. No account needed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            <button
              onClick={() => onNavigate("home")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("movies")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Movies
            </button>
            <button
              onClick={() => onNavigate("tv")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              TV Series
            </button>
            <button
              onClick={() => onNavigate("anime")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Anime
            </button>
            <button
              onClick={() => onNavigate("genres")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Genres
            </button>
            <button
              onClick={() => onNavigate("western")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Western
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Disclaimer & TMDB Notice */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-neutral-500 leading-relaxed">
          <div className="flex items-center gap-2 text-[12px]">
            <ShieldCheck className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span>
              Disclaimer: TPMovies does not host, upload, or store any media
              files on its servers. All video streams are embedded from
              third-party services (VidSrc, VidLink, Videasy).
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 text-[12px]">
            <span>joshuaebod.202300287@gmail.com</span>
          </div>
        </div>

        <div className="text-center text-[12px] text-neutral-600 pt-4">
          © {new Date().getFullYear()} TPMovies
        </div>
      </div>
    </footer>
  );
};
