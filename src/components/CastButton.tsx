// import React, { useState, useEffect } from "react";
// import { Cast, Tv, X, CheckCircle2, Info } from "lucide-react";

// interface CastButtonProps {
//   mediaTitle: string;
//   streamUrl?: string;
// }

// export const CastButton: React.FC<CastButtonProps> = ({
//   mediaTitle,
//   streamUrl,
// }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [, setCastSupported] = useState<boolean>(true);
//   const [castState, setCastState] = useState<
//     "idle" | "searching" | "connected" | "unsupported"
//   >("idle");

//   useEffect(() => {
//     // Check for Remote Playback API or Presentation API or Google Cast
//     const hasRemote = "RemotePlayback" in window;
//     const hasPresentation = "presentation" in navigator;
//     const hasAirPlay =
//       (window as any).WebKitPlaybackTargetAvailabilityEvent !== undefined;
//     const hasChromeCast = (window as any).chrome && (window as any).chrome.cast;

//     if (!hasRemote && !hasPresentation && !hasAirPlay && !hasChromeCast) {
//       setCastSupported(true); // Still allow opening casting dialog with guide & browser cast instructions
//     }
//   }, []);

//   const handleInitiateCast = async () => {
//     setIsModalOpen(true);
//     setCastState("searching");

//     try {
//       // 1. Try Presentation Request if supported
//       if ("PresentationRequest" in window) {
//         try {
//           const presentationRequest = new (window as any).PresentationRequest([
//             streamUrl || window.location.href,
//           ]);
//           presentationRequest
//             .start()
//             .then(() => {
//               setCastState("connected");
//             })
//             .catch((err: any) => {
//               // User cancelled or no device picked
//               console.log("Presentation request dismissed:", err);
//               setCastState("idle");
//             });
//           return;
//         } catch (e) {
//           // Continue to fallback
//         }
//       }

//       // 2. Try Chrome Cast API if initialized
//       if (
//         (window as any).chrome &&
//         (window as any).chrome.cast &&
//         (window as any).chrome.cast.isAvailable
//       ) {
//         (window as any).chrome.cast.requestSession(
//           () => setCastState("connected"),
//           () => setCastState("idle"),
//         );
//         return;
//       }

//       // Simulation/idle state after searching
//       setTimeout(() => {
//         setCastState("idle");
//       }, 1500);
//     } catch (e) {
//       setCastState("idle");
//     }
//   };

//   return (
//     <>
//       <button
//         id="cast-device-btn"
//         onClick={handleInitiateCast}
//         aria-label="Cast to TV or Device"
//         className="px-3.5 py-1.5 rounded-lg bg-[#0d0d0d] hover:bg-neutral-900 text-neutral-200 hover:text-red-400 border border-white/10 flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
//         title="Cast to Smart TV / Chromecast / AirPlay"
//       >
//         <Cast className="w-4 h-4 text-red-600" />
//         <span>Cast</span>
//       </button>

//       {/* Cast Modal / Device Picker Dialog */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
//           <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-6">
//             {/* Header */}
//             <div className="flex items-center justify-between pb-4 border-b border-white/10">
//               <div className="flex items-center gap-2.5">
//                 <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
//                   <Tv className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-base font-bold text-white">
//                     Cast to Device
//                   </h3>
//                   <p className="text-xs text-neutral-400">
//                     Stream on TV, Chromecast, or AirPlay
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Currently Playing Info */}
//             <div className="my-4 p-3 rounded-xl bg-black border border-white/5 flex items-center justify-between">
//               <div className="flex flex-col">
//                 <span className="text-[11px] text-neutral-500 font-medium uppercase">
//                   Now Playing
//                 </span>
//                 <span className="text-sm font-semibold text-white line-clamp-1">
//                   {mediaTitle}
//                 </span>
//               </div>
//               <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-600/20 text-red-400 border border-red-500/30">
//                 Ready
//               </span>
//             </div>

//             {/* Status & Options */}
//             <div className="flex flex-col gap-3 my-4">
//               <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/5 flex items-start gap-3">
//                 <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//                 <div className="text-xs text-neutral-300 space-y-1.5">
//                   <p className="font-semibold text-white">
//                     How to Cast from this Player:
//                   </p>
//                   <ol className="list-decimal list-inside space-y-1 text-neutral-400">
//                     <li>
//                       <strong>Browser Cast Menu:</strong> In Chrome/Edge/Brave,
//                       click the browser menu (⋮) →{" "}
//                       <span className="text-red-400 font-medium">Cast...</span>{" "}
//                       to beam this tab or video directly to your Smart TV or
//                       Chromecast.
//                     </li>
//                     <li>
//                       <strong>Player Native Controls:</strong> Many streaming
//                       servers (such as VidLink & Videasy) include a built-in
//                       AirPlay / Cast button directly inside the video controls
//                       bar.
//                     </li>
//                     <li>
//                       <strong>Apple AirPlay:</strong> On Safari / iOS / macOS,
//                       tap the AirPlay icon on the video or Control Center.
//                     </li>
//                   </ol>
//                 </div>
//               </div>

//               {castState === "connected" && (
//                 <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs">
//                   <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
//                   <span>Casting session active. Media is being mirrored.</span>
//                 </div>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer border border-white/10"
//               >
//                 Got It
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };
