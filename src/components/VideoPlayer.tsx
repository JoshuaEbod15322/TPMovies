import React, { useState, useEffect } from "react";
import { SkipBack, SkipForward, AlertTriangle, HelpCircle } from "lucide-react";
import { getStreamingUrl } from "../services/streamingSources";

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: "movie" | "tv" | "anime";
  mediaTitle: string;
  season?: number;
  episode?: number;
  totalEpisodesInSeason?: number;
  selectedProviderId: string;
  onProviderChange?: (providerId: string) => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaId,
  mediaType,
  mediaTitle,
  season = 1,
  episode = 1,
  totalEpisodesInSeason,
  selectedProviderId,
  onNextEpisode,
  onPrevEpisode,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const embedUrl = getStreamingUrl(
    selectedProviderId,
    mediaType,
    mediaId,
    season,
    episode,
  );

  useEffect(() => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }, [mediaId, mediaType, season, episode, selectedProviderId]);

  const isTvOrAnime = mediaType === "tv" || mediaType === "anime";

  return (
    <div
      id="theater-mode-player"
      className="relative w-full max-w-none flex flex-col transition-all duration-300"
    >
      {/* Main Video Iframe Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden border-t border-x border-white/10 rounded-t-2xl shadow-2xl">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-black/95 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-red-600/20 border-t-red-600 animate-spin"></div>
            <p className="text-sm font-semibold text-neutral-200">
              Connecting to streaming server...
            </p>
            <span className="text-xs text-neutral-500 font-mono">
              {selectedProviderId.toUpperCase()} HIGH DEFINITION
            </span>
          </div>
        )}

        {/* Embedded Video Iframe */}
        <iframe
          key={iframeKey}
          id="streaming-iframe-player"
          src={embedUrl}
          title={`${mediaTitle} Video Stream`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Episode Navigation / Playback Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0d0d0d] border-x border-b border-white/10 rounded-b-2xl backdrop-blur-md">
        {/* Episode Previous / Next */}
        {isTvOrAnime ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevEpisode}
              disabled={episode <= 1}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                episode <= 1
                  ? "opacity-40 bg-neutral-900 border-white/5 text-neutral-500 cursor-not-allowed"
                  : "bg-white/5 hover:bg-red-600 hover:text-white border-white/10 text-white"
              }`}
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Previous Ep</span>
            </button>

            <span className="text-[10px] font-bold text-neutral-200 px-3 py-1.5 bg-black rounded-lg border border-white/10">
              Season {season} • Ep {episode}
            </span>

            <button
              onClick={onNextEpisode}
              disabled={Boolean(
                totalEpisodesInSeason && episode >= totalEpisodesInSeason,
              )}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                totalEpisodesInSeason && episode >= totalEpisodesInSeason
                  ? "opacity-40 bg-neutral-900 border-white/5 text-neutral-500 cursor-not-allowed"
                  : "bg-white/5 hover:bg-red-600 hover:text-white border-white/10 text-white"
              }`}
            >
              <span>Next Ep</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Live</span>
          </div>
        )}

        {/* Troubleshooting Switch Button */}
        <button
          onClick={() => setShowTroubleshoot(!showTroubleshoot)}
          className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Playback issues?</span>
        </button>
      </div>

      {/* Troubleshooting Banner */}
      {showTroubleshoot && (
        <div className="mt-3 p-4 rounded-xl bg-[#0a0a0a] border border-red-600/30 text-xs text-neutral-300 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Streaming Troubleshooting Guide</span>
          </div>
          <p className="text-neutral-300">
            If the video doesn&apos;t load, buffers slowly, or shows ads:
          </p>
          <ul className="list-disc list-inside space-y-1 text-neutral-400">
            <li>
              <strong>Browser:</strong> Switch to a{" "}
              <strong className="text-red-400">Brave</strong> browser for better
              compatibility.
            </li>
            <li>
              <strong>Switch Server:</strong> Try selecting different streaming
              sources below (e.g. <strong>VidLink</strong> or{" "}
              <strong>Videasy</strong>).
            </li>
            <li>
              <strong>Ad Blockers / Extensions:</strong> Ensure browser pop-up
              blockers do not interfere with external video players.
            </li>
            <li>
              <strong>Click Play:</strong> Some players require clicking the
              center play button to initiate the stream.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
