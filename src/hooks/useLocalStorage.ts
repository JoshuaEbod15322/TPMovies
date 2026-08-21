import { useEffect, useState } from "react";
import { getContinueWatching } from "../services/continueWatching";
import type { ContinueWatchingItem } from "../types";

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    // Initial load
    setItems(getContinueWatching());

    const handleUpdate = () => {
      setItems(getContinueWatching());
    };

    window.addEventListener(
      "cinestream_continue_watching_updated",
      handleUpdate,
    );
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(
        "cinestream_continue_watching_updated",
        handleUpdate,
      );
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return items;
}
