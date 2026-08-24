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

type AppRoute =
  | { kind: "browse"; tab: NavTab }
  | { kind: "details"; mediaType: "movie" | "tv" | "anime"; id: number }
  | {
      kind: "watch";
      mediaType: "movie" | "tv" | "anime";
      id: number;
      season?: number;
      episode?: number;
    };

const browsePaths: Record<NavTab, string> = {
  home: "/",
  movies: "/movies",
  tv: "/tv",
  anime: "/anime",
  genres: "/genres",
  western: "/western",
  search: "/search",
};

const readRoute = (): AppRoute => {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const browseTab = (Object.keys(browsePaths) as NavTab[]).find(
    (tab) => browsePaths[tab].slice(1) === parts[0],
  );

  if (parts.length === 0 || browseTab) {
    return { kind: "browse", tab: browseTab || "home" };
  }

  const isWatch = parts[0] === "watch";
  const mediaType = (isWatch ? parts[1] : parts[0]) as "movie" | "tv" | "anime";
  const id = Number(isWatch ? parts[2] : parts[1]);

  if (["movie", "tv", "anime"].includes(mediaType) && Number.isInteger(id)) {
    return isWatch
      ? { kind: "watch", mediaType, id }
      : { kind: "details", mediaType, id };
  }

  return { kind: "browse", tab: "home" };
};

function App() {
  const [route, setRoute] = useState<AppRoute>(readRoute);

  const currentTab = route.kind === "browse" ? route.tab : "home";

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    const path =
      nextRoute.kind === "browse"
        ? browsePaths[nextRoute.tab]
        : nextRoute.kind === "details"
          ? `/${nextRoute.mediaType}/${nextRoute.id}`
          : `/watch/${nextRoute.mediaType}/${nextRoute.id}`;
    window.history.pushState(null, "", path);
    setRoute(nextRoute);
  };

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
        navigate({ kind: "browse", tab: "search" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      if (event.key === "Escape") {
        if (route.kind === "watch" || route.kind === "details") handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [route]);

  const handleNavigate = (tab: NavTab) => {
    navigate({ kind: "browse", tab });
  };

  const handleSelectMedia = (item: MediaItem) => {
    navigate({ kind: "details", mediaType: getMediaType(item), id: item.id });
  };

  const handleWatchMedia = (item: MediaItem, season = 1, episode = 1) => {
    navigate({
      kind: "watch",
      mediaType: getMediaType(item),
      id: item.id,
      season,
      episode,
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  let content;
  if (route.kind === "watch") {
    const watchItem: MediaItem = {
      id: route.id,
      media_type: route.mediaType,
      overview: "",
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
    };
    content = (
      <Watch
        mediaItem={watchItem}
        initialSeason={route.season}
        initialEpisode={route.episode}
        onBack={handleBack}
        onSelectMedia={handleSelectMedia}
      />
    );
  } else if (route.kind === "details") {
    content = (
      <Details
        mediaId={route.id}
        mediaType={route.mediaType}
        onBack={handleBack}
        onWatch={handleWatchMedia}
        onSelectMedia={handleSelectMedia}
      />
    );
  } else {
    switch (route.tab) {
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
