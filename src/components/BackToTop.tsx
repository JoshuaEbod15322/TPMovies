import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (scrollHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (scrollTop / scrollHeight) * 100),
        );
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="back-to-top-btn"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 p-3.5 rounded-full bg-[#111115]/90 hover:bg-red-600 border border-white/15 hover:border-red-500 text-white shadow-2xl backdrop-blur-md cursor-pointer transition-colors duration-200 group flex items-center justify-center"
        >
          {/* Circular progress stroke ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="21"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="24"
              cy="24"
              r="21"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={131.95}
              strokeDashoffset={131.95 - (scrollProgress / 100) * 131.95}
              strokeLinecap="round"
              className="text-red-500 group-hover:text-white transition-all duration-150"
            />
          </svg>

          {/* Up arrow icon */}
          <ArrowUp className="w-5 h-5 text-white/90 group-hover:text-white transition-transform duration-200 group-hover:-translate-y-0.5 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
