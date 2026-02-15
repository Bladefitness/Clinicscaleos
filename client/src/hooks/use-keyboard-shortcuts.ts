import { useEffect } from "react";
import { useLocation } from "wouter";

const MODULE_PATHS = ["/", "/offer-lab", "/creative-factory", "/campaign-hq", "/ad-coach", "/iteration-lab"];

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const num = e.key.match(/^[1-6]$/);
        if (num) {
          e.preventDefault();
          const idx = parseInt(num[0], 10) - 1;
          if (MODULE_PATHS[idx]) setLocation(MODULE_PATHS[idx]);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setLocation]);
}
