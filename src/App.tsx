import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import type { NavTab } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import { Home } from "./pages/Home";
import { Movies } from "./pages/Movies";
import { TVSeries } from "./pages/TVSeries";
import { Anime } from "./pages/Anime";
import { Genres } from "./pages/Genres";
import { Western } from "./pages/Western";
import { Search } from "./pages/Search";
import { Details } from "./pages/Details";
import { Watch } from "./pages/Watch";
import type { MediaItem } from "./types";

const getMediaType = (item: MediaItem): "movie" | "tv" | "anime" =>
  item.media_type || (item.title ? "movie" : "tv");

function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [watchTarget, setWatchTarget] = useState<{
    item: MediaItem;
    season?: number;
    episode?: number;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (
        (event.key === "/" ||
          ((event.metaKey || event.ctrlKey) && event.key === "k")) &&
        !isTyping
      ) {
        event.preventDefault();
        setCurrentTab("search");
        setSelectedMedia(null);
        setWatchTarget(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (event.key === "Escape") {
        if (watchTarget) setWatchTarget(null);
        else if (selectedMedia) setSelectedMedia(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia, watchTarget]);

  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
    setSelectedMedia(null);
    setWatchTarget(null);
  };

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setWatchTarget(null);
  };

  const handleWatchMedia = (item: MediaItem, season = 1, episode = 1) => {
    setWatchTarget({ item, season, episode });
    setSelectedMedia(null);
  };

  const handleBack = () => {
    if (watchTarget) {
      setWatchTarget(null);
      return;
    }
    setSelectedMedia(null);
  };

  let content;
  if (watchTarget) {
    content = (
      <Watch
        mediaItem={watchTarget.item}
        initialSeason={watchTarget.season}
        initialEpisode={watchTarget.episode}
        onBack={handleBack}
        onSelectMedia={handleSelectMedia}
      />
    );
  } else if (selectedMedia) {
    content = (
      <Details
        mediaId={selectedMedia.id}
        mediaType={getMediaType(selectedMedia)}
        onBack={handleBack}
        onWatch={handleWatchMedia}
        onSelectMedia={handleSelectMedia}
      />
    );
  } else {
    switch (currentTab) {
      case "movies":
        content = <Movies onSelectMedia={handleSelectMedia} />;
        break;
      case "tv":
        content = <TVSeries onSelectMedia={handleSelectMedia} />;
        break;
      case "anime":
        content = <Anime onSelectMedia={handleSelectMedia} />;
        break;
      case "genres":
        content = <Genres onSelectMedia={handleSelectMedia} />;
        break;
      case "western":
        content = <Western onSelectMedia={handleSelectMedia} />;
        break;
      case "search":
        content = <Search onSelectMedia={handleSelectMedia} />;
        break;
      case "home":
      default:
        content = (
          <Home
            onSelectMedia={handleSelectMedia}
            onWatchMedia={handleWatchMedia}
            onNavigateTab={handleNavigate}
          />
        );
        break;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      <main className="flex-1">{content}</main>
      <Footer onNavigate={handleNavigate} />
      <BackToTop />
    </div>
  );
}

export default App;
