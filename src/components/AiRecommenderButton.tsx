import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AiRecommenderButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AiRecommenderButton: React.FC<AiRecommenderButtonProps> = ({
  onClick,
  isOpen,
}) => {
  return (
    <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40">
      <motion.button
        id="ai-recommender-circle-btn"
        aria-label="Ask AI for movie recommendations"
        onClick={onClick}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`relative p-3.5 sm:p-4 rounded-full bg-[#111115]/95 hover:bg-[#18181f] border text-white shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 group flex items-center justify-center ${
          isOpen
            ? "border-red-500 ring-2 ring-red-500/40 shadow-red-950/50"
            : "border-white/15 hover:border-red-500/80 shadow-black/80"
        }`}
      >
        {/* Subtle pulsating outer glow ring */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-red-600/30 to-amber-500/20 blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none animate-pulse" />

        {/* Inner SVG decorative ring */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="transparent"
            strokeDasharray="4 3"
            className="text-red-500/40 group-hover:text-red-500/80 transition-colors duration-200"
          />
        </svg>

        {/* Sparkles / AI Icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 group-hover:text-red-400 group-hover:rotate-12 transition-all duration-300" />
        </div>

        {/* Small "AI" indicator badge */}
        <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.2 bg-red-600 text-white font-black text-[9px] tracking-wider rounded-full shadow-md border border-black/60 uppercase">
          AI
        </span>

        {/* Tooltip on hover (hidden on small touch screens, visible on md+) */}
        <span className="hidden md:group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#131318]/95 border border-white/10 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md items-center gap-1.5 pointer-events-none transition-all duration-150">
          <span>Ask AI Movies</span>
        </span>
      </motion.button>
    </div>
  );
};
