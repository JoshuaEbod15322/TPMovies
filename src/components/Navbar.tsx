import React, { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import ptLogo from "../assets/PTlogo.png";
export type NavTab =
  | "home"
  | "movies"
  | "tv"
  | "anime"
  | "genres"
  | "western"
  | "search";

interface NavbarProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { id: NavTab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "movies", label: "Movies" },
    { id: "tv", label: "TV Series" },
    { id: "anime", label: "Anime" },
    { id: "western", label: "Western" },
    { id: "genres", label: "Genres" },
  ];

  const handleNavClick = (tab: NavTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-md shadow-2xl border-b border-white/5 py-3"
          : "bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick("home")}
          className="flex min-w-0 items-center gap-2 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <img src={ptLogo} alt="PTMovies Logo" className="w-7 h-7 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-3xl font-black tracking-tighter text-red-600 flex items-center">
              TP<span className="text-white">Movies</span>
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "text-white border-b-2 border-red-600 font-bold"
                    : "hover:text-white text-neutral-400"
                }`}
              >
                {/* {link.icon} */}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Search Action & Mobile Hamburger */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            id="nav-quick-search-btn"
            onClick={() => handleNavClick("search")}
            aria-label="Open Search"
            className="flex w-9 h-9 sm:w-64 md:w-70 items-center justify-center sm:justify-between gap-2.5 bg-white/5 hover:bg-white/10 px-2 sm:px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline text-neutral-400 group-hover:text-neutral-200">
                Search titles...
              </span>
            </div>
            <kbd className="hidden lg:inline text-[10px] bg-neutral-900 text-neutral-500 px-1.5 py-0.5 rounded border border-white/10">
              /
            </kbd>
          </button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            className="md:hidden p-2 rounded-full bg-white/5 text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden bg-[#050505]/98 border-b border-white/10 px-4 pt-3 pb-6 shadow-2xl backdrop-blur-xl animate-fade-in"
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full px-4 py-3 rounded-xl text-left text-xs uppercase tracking-widest font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-red-600 text-white font-bold"
                      : "text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  {/* {link.icon} */}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
