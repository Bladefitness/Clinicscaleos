"use client";

import { useState } from "react";
import { LAUNCH_PLAN_INTRO, LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";
import { FlowchartNode } from "./FlowchartNode";

export function LaunchPlanFlowchart() {
  const [expandedId, setExpandedId] = useState<string | null>("intro");

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="space-y-2"
      role="img"
      aria-label="Launch plan flowchart: map your offer, creatives, campaign, coach, and iteration steps"
    >
      <FlowchartNode
        step={LAUNCH_PLAN_INTRO}
        expandedId={expandedId}
        onToggle={handleToggle}
        isIntro
      />
      {LAUNCH_PLAN_STEPS.map((step) => (
        <FlowchartNode
          key={step.id}
          step={step}
          expandedId={expandedId}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
