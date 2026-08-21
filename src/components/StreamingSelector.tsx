import React from "react";
import { Server } from "lucide-react";
import { getProvidersList } from "../services/streamingSources";

interface StreamingSelectorProps {
  selectedProviderId: string;
  onSelectProvider: (providerId: string) => void;
}

export const StreamingSelector: React.FC<StreamingSelectorProps> = ({
  selectedProviderId,
  onSelectProvider,
}) => {
  const providers = getProvidersList();

  return (
    <div>
      {/* Header */}
      {/* <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-red-600" />
          <span className="text-sm font-bold text-white tracking-tight">
            Streaming Server Source:
          </span>
        </div>
        <span className="text-[11px] text-neutral-400">
          Experiencing issues? Try switching servers below.
        </span>
      </div> */}

      <div>
        {/* Provider Buttons Bar */}
        <div className="w-full bg-[#0d0d0d] border border-white/10 rounded-2xl p-3 sm:px-5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Left Section: Server Icon & Label + Joined Server Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400 select-none">
              <Server className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>SERVER</span>
            </div>

            {/* Inline Server Pills Container with Horizontal Scroll for Mobile */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {providers.map((p) => {
                const isSelected = selectedProviderId === p.id;
                return (
                  <button
                    key={p.id}
                    id={`provider-btn-${p.id}`}
                    onClick={() => onSelectProvider(p.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                      isSelected
                        ? "bg-red-600 text-white font-bold shadow-lg shadow-red-600/20"
                        : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <span>{p.name}</span>

                    {p.quality && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-black text-white"
                            : "bg-red-600/20 text-red-400 border border-red-600/30"
                        }`}
                      >
                        {p.quality}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Helper Note */}
          <span className="text-[11px] sm:text-xs text-neutral-400 italic select-none self-center md:self-auto">
            Experiencing issues? Try switching servers.
          </span>
        </div>
      </div>
    </div>
  );
};
