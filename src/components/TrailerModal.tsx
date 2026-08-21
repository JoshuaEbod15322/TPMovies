import React from "react";
import { X, Film } from "lucide-react";
import type { VideoTrailer } from "../types";

interface TrailerModalProps {
  trailer: VideoTrailer | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  trailer,
  isOpen,
  onClose,
  title,
}) => {
  if (!isOpen || !trailer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black  ">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-600" />
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              {title} - Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trailer modal"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={`${title} Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
