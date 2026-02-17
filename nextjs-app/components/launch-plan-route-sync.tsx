"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLaunchPlanProgress } from "@/context/launch-plan-progress-context";

const PATH_TO_STEP_ID: Record<string, string> = {
  "/": "intro",
  "/offer-lab": "offer",
  "/creative-factory": "creatives",
  "/campaign-hq": "campaign",
  "/ad-coach": "coach",
  "/iteration-lab": "iterate",
};

/** Syncs current route to Launch Plan "You are here" */
export function LaunchPlanRouteSync() {
  const pathname = usePathname();
  const { setCurrent } = useLaunchPlanProgress();

  useEffect(() => {
    const stepId = PATH_TO_STEP_ID[pathname] ?? null;
    setCurrent(stepId);
  }, [pathname, setCurrent]);

  return null;
}
