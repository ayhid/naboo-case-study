import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

interface UseViewModeOptions {
  storageKey: string;
  defaultMode: ViewMode;
}

const isViewMode = (value: string | null): value is ViewMode =>
  value === "grid" || value === "list";

export function useViewMode({ storageKey, defaultMode }: UseViewModeOptions) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    const storedValue = localStorage.getItem(storageKey);
    if (isViewMode(storedValue)) {
      setViewMode(storedValue);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, viewMode);
  }, [storageKey, viewMode]);

  return { viewMode, setViewMode };
}
