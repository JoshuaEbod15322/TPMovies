import { lazy, Suspense, useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import type { NavTab } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
// import { AiRecommenderButton } from "./components/AiRecommenderButton";
import { AiMovieRecommenderModal } from "./components/AiMovieRecommenderModal";
import type { MediaItem } from "./types";

const Home = lazy(() =>
  import("./pages/Home").then(({ Home }) => ({ default: Home })),
);
const Movies = lazy(() =>
  import("./pages/Movies").then(({ Movies }) => ({ default: Movies })),
);
const TVSeries = lazy(() =>
  import("./pages/TVSeries").then(({ TVSeries }) => ({ default: TVSeries })),
);
const Anime = lazy(() =>
  import("./pages/Anime").then(({ Anime }) => ({ default: Anime })),
);
const Genres = lazy(() =>
  import("./pages/Genres").then(({ Genres }) => ({ default: Genres })),
);
const Western = lazy(() =>
  import("./pages/Western").then(({ Western }) => ({ default: Western })),
);
const Search = lazy(() =>
  import("./pages/Search").then(({ Search }) => ({ default: Search })),
);
const Details = lazy(() =>
  import("./pages/Details").then(({ Details }) => ({ default: Details })),
);
const Watch = lazy(() =>
  import("./pages/Watch").then(({ Watch }) => ({ default: Watch })),
);

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
      returnRoute: Exclude<AppRoute, { kind: "watch" }>;
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
      ? {
          kind: "watch",
          mediaType,
          id,
          returnRoute: { kind: "browse", tab: "home" },
        }
      : { kind: "details", mediaType, id };
  }

  return { kind: "browse", tab: "home" };
};

function App() {
  const [route, setRoute] = useState<AppRoute>(readRoute);
  const [isAiRecommenderOpen, setIsAiRecommenderOpen] = useState(false);

  const currentTab = route.kind === "browse" ? route.tab : "home";

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextRoute: AppRoute, replace = false) => {
    const path =
      nextRoute.kind === "browse"
        ? browsePaths[nextRoute.tab]
        : nextRoute.kind === "details"
          ? `/${nextRoute.mediaType}/${nextRoute.id}`
          : `/watch/${nextRoute.mediaType}/${nextRoute.id}`;
    window.history[replace ? "replaceState" : "pushState"](null, "", path);
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

  const handleWatchMedia = (
    item: MediaItem,
    season = 1,
    episode = 1,
    returnRoute: Exclude<AppRoute, { kind: "watch" }> = {
      kind: "browse",
      tab: "home",
    },
  ) => {
    navigate({
      kind: "watch",
      mediaType: getMediaType(item),
      id: item.id,
      season,
      episode,
      returnRoute,
    });
  };

  const handleBack = () => {
    if (route.kind === "watch") {
      navigate(route.returnRoute, true);
      return;
    }

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
        onWatch={(item, season, episode) =>
          handleWatchMedia(item, season, episode, route)
        }
        onSelectMedia={handleSelectMedia}
      />
    );
  } else {
    switch (route.tab) {
      case "movies":
        content = (
          <Movies
            onSelectMedia={handleSelectMedia}
            onWatchMedia={(item) =>
              handleWatchMedia(item, 1, 1, { kind: "browse", tab: "movies" })
            }
          />
        );
        break;
      case "tv":
        content = (
          <TVSeries
            onSelectMedia={handleSelectMedia}
            onWatchMedia={(item) =>
              handleWatchMedia(item, 1, 1, { kind: "browse", tab: "tv" })
            }
          />
        );
        break;
      case "anime":
        content = (
          <Anime
            onSelectMedia={handleSelectMedia}
            onWatchMedia={(item) =>
              handleWatchMedia(item, 1, 1, { kind: "browse", tab: "anime" })
            }
          />
        );
        break;
      case "genres":
        content = <Genres onSelectMedia={handleSelectMedia} />;
        break;
      case "western":
        content = (
          <Western
            onSelectMedia={handleSelectMedia}
            onWatchMedia={(item) =>
              handleWatchMedia(item, 1, 1, { kind: "browse", tab: "western" })
            }
          />
        );
        break;
      case "search":
        content = <Search onSelectMedia={handleSelectMedia} />;
        break;
      case "home":
      default:
        content = (
          <Home
            onSelectMedia={handleSelectMedia}
            onWatchMedia={(item, season, episode) =>
              handleWatchMedia(item, season, episode, {
                kind: "browse",
                tab: "home",
              })
            }
            onNavigateTab={handleNavigate}
          />
        );
        break;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
      <main className="flex-1">
        <Suspense
          fallback={<div className="min-h-[50vh]" aria-label="Loading page" />}
        >
          {content}
        </Suspense>
      </main>
      <Footer onNavigate={handleNavigate} />
      <BackToTop />
      {/* <AiRecommenderButton
        isOpen={isAiRecommenderOpen}
        onClick={() => setIsAiRecommenderOpen((isOpen) => !isOpen)}
      /> */}
      <AiMovieRecommenderModal
        isOpen={isAiRecommenderOpen}
        onClose={() => setIsAiRecommenderOpen(false)}
        onSelectMedia={handleSelectMedia}
        onWatchMedia={(item) =>
          handleWatchMedia(item, 1, 1, { kind: "browse", tab: "home" })
        }
      />
    </div>
  );
}

export default App;
