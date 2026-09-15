import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Film,
  Star,
  Play,
  Info,
  RotateCcw,
  Compass,
  AlertCircle,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AiChatMessage, MediaItem } from "../types";
import { fetchAiMovieRecommendations } from "../services/aiMovieRecommender";
import { getImageUrl } from "../services/tmdb";

interface AiMovieRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia?: (item: MediaItem) => void;
}

const QUICK_PROMPTS = [
  {
    label: "Mind-Bending Sci-Fi",
    prompt:
      "Mind-bending sci-fi movies like Interstellar, Inception, or Arrival with deep existential themes",
  },
  {
    label: "Crazy Plot Twists",
    prompt:
      "Psychological thriller movies with shocking plot twists that you never see coming",
  },
  {
    label: "Feel-Good Action",
    prompt:
      "Fun, high-energy 90s and 2000s action comedies with great banter and pacing",
  },
  {
    label: "Cyberpunk & Dystopia",
    prompt:
      "Atmospheric neo-noir and cyberpunk movies with stunning visual worldbuilding",
  },
  {
    label: "Hidden Gem Thrillers",
    prompt:
      "Underrated crime and suspense thriller movies from the past 10 years that flew under the radar",
  },
  {
    label: "Heart-Pounding Horror",
    prompt:
      "Genuinely terrifying supernatural and psychological horror movies with tense atmosphere",
  },
];

const INITIAL_MESSAGE: AiChatMessage = {
  id: "init-1",
  role: "assistant",
  content:
    "Hello! I am MovieAI, Ask me for movie, TV series, or anime recommendations based on your mood, favorite titles, actors, characters, or eras.",
  suggestedFollowups: [
    "Recommend movies like Inception",
    "Best dark psychological thrillers",
    "Fun feel-good adventure movies",
  ],
  timestamp: Date.now(),
};

export const AiMovieRecommenderModal: React.FC<
  AiMovieRecommenderModalProps
> = ({ isOpen, onClose, onSelectMedia, onWatchMedia }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([INITIAL_MESSAGE]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputQuery).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputQuery("");

    const userMessage: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => m.id !== "init-1")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetchAiMovieRecommendations({
        prompt: query,
        conversationHistory: history,
      });

      const assistantMessage: AiChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.message,
        isMovieRelated: response.isMovieRelated,
        recommendations: response.recommendations,
        suggestedFollowups: response.suggestedFollowups,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Failed to get movie recommendations:", err);
      const message = err instanceof Error ? err.message : null;
      setError(
        message ||
          "Unable to reach MovieAI right now. Please check your connection or retry.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  };

  const handleOpenDetails = (item: MediaItem) => {
    onSelectMedia(item);
    onClose();
  };

  const handleStartWatch = (item: MediaItem) => {
    if (onWatchMedia) {
      onWatchMedia(item);
    } else {
      onSelectMedia(item);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop blur & overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl h-[90vh] max-h-[780px] bg-[#0c0c10] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100 z-10"
        >
          {/* Header */}
          <div className="relative px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-[#121217]/95 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-red-950/40">
                <div className="w-full h-full bg-[#0c0c10] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Movie Recommendations
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close modal (Esc)"
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
            {/* Quick Prompt Starters (show when only initial message exists) */}
            {messages.length === 1 && (
              <div className="my-2 p-3.5 sm:p-4 rounded-xl bg-[#13131a]/80 border border-white/5">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-red-400" /> Quick
                  Discovery Prompts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-left px-3 py-2 rounded-lg bg-[#181824] hover:bg-[#202030] border border-white/5 hover:border-red-500/40 text-xs text-neutral-300 hover:text-white transition-all duration-150 flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-medium truncate mr-2">
                        {item.label}
                      </span>
                      <Flame className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Thread */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.role === "user" ? (
                  // User Message Bubble
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-red-600 px-4 py-2.5 text-sm text-white shadow-md shadow-red-950/30">
                    <p className="leading-relaxed break-words">{msg.content}</p>
                  </div>
                ) : (
                  // Assistant Message
                  <div className="w-full space-y-3">
                    {/* MovieAI Message Bubble */}
                    <div className="flex gap-2.5 sm:gap-3 items-start max-w-[95%] sm:max-w-[90%]">
                      <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-[#15151d] border border-white/5 px-4 py-3 text-sm text-neutral-200 shadow-lg">
                        {/* Off-topic alert notice if user asked non-movie query */}
                        {msg.isMovieRelated === false && (
                          <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1.5 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>
                              Notice: Movie recommendations are limited to
                              movies, TV series, and anime.
                            </span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>
                    </div>

                    {/* Movie Recommendations Grid */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="pl-9 sm:pl-10 space-y-2.5">
                        {/* <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-red-500" />{" "}
                          Recommended Picks ({msg.recommendations.length})
                        </div> */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {msg.recommendations.map((rec, rIdx) => {
                            const media = rec.tmdbMedia;
                            const posterUrl = media?.poster_path
                              ? getImageUrl(media.poster_path, "w300")
                              : null;
                            const rating = media?.vote_average
                              ? media.vote_average.toFixed(1)
                              : null;

                            return (
                              <div
                                key={rIdx}
                                className="group relative bg-[#13131b] hover:bg-[#181824] border border-white/10 hover:border-red-500/50 rounded-xl p-3 flex gap-3 transition-all duration-200 shadow-md flex-col justify-between"
                              >
                                <div className="flex gap-3 items-start">
                                  {/* Movie Poster */}
                                  <div className="relative w-18 h-26 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/5">
                                    {posterUrl ? (
                                      <img
                                        src={posterUrl}
                                        alt={rec.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-400">
                                        <Film className="w-5 h-5 text-neutral-600 mb-1" />
                                        <span className="text-[9px] line-clamp-2">
                                          {rec.title}
                                        </span>
                                      </div>
                                    )}

                                    {/* Rating badge */}
                                    {rating && (
                                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-xs rounded text-[10px] font-bold text-amber-400 flex items-center gap-0.5 border border-white/10">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span>{rating}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Content info */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-baseline justify-between gap-1">
                                        {media ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenDetails(media)
                                            }
                                            className="text-left text-sm font-bold text-white hover:text-red-400 focus:text-red-400 transition-colors line-clamp-1 cursor-pointer"
                                            title={`View details for ${rec.title}`}
                                          >
                                            {rec.title}
                                          </button>
                                        ) : (
                                          <h3 className="text-sm font-bold text-white line-clamp-1">
                                            {rec.title}
                                          </h3>
                                        )}
                                        {rec.year && (
                                          <span className="text-[11px] text-neutral-400 font-medium shrink-0">
                                            {rec.year}
                                          </span>
                                        )}
                                      </div>

                                      {/* Match Vibe Badge */}
                                      {/* {rec.matchVibe && (
                                        <span className="inline-block px-1.5 py-0.5 mt-1 bg-red-950/50 border border-red-500/30 text-red-300 text-[10px] font-medium rounded">
                                          {rec.matchVibe}
                                        </span>
                                      )} */}

                                      {/* Genre */}
                                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                                        {rec.genre}
                                      </p>

                                      {/* Why recommended */}
                                      <p className="text-[11px] text-neutral-300 mt-1.5  leading-relaxed">
                                        {rec.whyRecommended}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                                  {media ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDetails(media)}
                                        className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <Info className="w-3.5 h-3.5 text-neutral-400" />
                                        <span>Details</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStartWatch(media)}
                                        className="flex-1 py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-sm shadow-red-950 transition-colors cursor-pointer"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Watch</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Construct a fallback MediaItem for searching/details
                                        const mockItem: MediaItem = {
                                          id: Math.floor(
                                            Math.random() * 1000000,
                                          ),
                                          title: rec.title,
                                          overview: rec.whyRecommended,
                                          poster_path: null,
                                          backdrop_path: null,
                                          vote_average: 7.5,
                                          release_date: rec.year
                                            ? `${rec.year}-01-01`
                                            : "",
                                          media_type:
                                            rec.mediaType === "series"
                                              ? "tv"
                                              : rec.mediaType || "movie",
                                        };
                                        handleOpenDetails(mockItem);
                                      }}
                                      className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <span>Find in App</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Prompts */}
                    {msg.suggestedFollowups &&
                      msg.suggestedFollowups.length > 0 && (
                        <div className="pl-9 sm:pl-10 pt-1 flex flex-wrap gap-1.5">
                          {msg.suggestedFollowups.map((followup, fIdx) => (
                            <button
                              key={fIdx}
                              type="button"
                              onClick={() => handleSendMessage(followup)}
                              className="px-2.5 py-1 rounded-full text-xs bg-[#191924] hover:bg-[#232332] text-neutral-300 hover:text-white border border-white/5 hover:border-red-500/40 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-red-400" />
                              <span>{followup}</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#15151d] border border-white/5 px-4 py-3 text-sm text-neutral-300 shadow-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Analyzing the matching movies...</span>
                  </div>
                  <div className="w-48 h-2 bg-neutral-800 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="px-2.5 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-[#0e0e13] border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask for movie, series, or anime recommendations..."
                  disabled={isLoading}
                  className="w-full py-2.5 sm:py-3 pl-4 pr-10 rounded-xl bg-[#171720] border border-white/10 hover:border-white/20 focus:border-red-500 text-sm text-white placeholder-neutral-500 focus:outline-none transition-all"
                />

                {inputQuery && (
                  <button
                    type="button"
                    onClick={() => setInputQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  inputQuery.trim() && !isLoading
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/50"
                    : "bg-[#181822] text-neutral-500 cursor-not-allowed border border-white/5"
                }`}
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
