import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "clinic-growth-launch-plan-progress";

interface StoredProgress {
  completedStepIds: string[];
  currentStepId: string | null;
}

function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedStepIds: [], currentStepId: null };
    const parsed = JSON.parse(raw) as StoredProgress;
    return {
      completedStepIds: Array.isArray(parsed.completedStepIds) ? parsed.completedStepIds : [],
      currentStepId: typeof parsed.currentStepId === "string" ? parsed.currentStepId : null,
    };
  } catch {
    return { completedStepIds: [], currentStepId: null };
  }
}

function saveProgress(data: StoredProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export interface LaunchPlanProgressContextValue {
  completedStepIds: string[];
  currentStepId: string | null;
  markCompleted: (id: string) => void;
  setCurrent: (id: string | null) => void;
}

const LaunchPlanProgressContext = createContext<LaunchPlanProgressContextValue | null>(null);

export function LaunchPlanProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StoredProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markCompleted = useCallback((id: string) => {
    setProgress((prev) => {
      if (prev.completedStepIds.includes(id)) return prev;
      return {
        ...prev,
        completedStepIds: [...prev.completedStepIds, id],
      };
    });
  }, []);

  const setCurrent = useCallback((id: string | null) => {
    setProgress((prev) => ({ ...prev, currentStepId: id }));
  }, []);

  const value: LaunchPlanProgressContextValue = {
    completedStepIds: progress.completedStepIds,
    currentStepId: progress.currentStepId,
    markCompleted,
    setCurrent,
  };

  return (
    <LaunchPlanProgressContext.Provider value={value}>
      {children}
    </LaunchPlanProgressContext.Provider>
  );
}

export function useLaunchPlanProgress(): LaunchPlanProgressContextValue {
  const ctx = useContext(LaunchPlanProgressContext);
  if (!ctx) {
    return {
      completedStepIds: [],
      currentStepId: null,
      markCompleted: () => {},
      setCurrent: () => {},
    };
  }
  return ctx;
}
