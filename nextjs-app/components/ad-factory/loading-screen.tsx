"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { LOADING_STAGES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Users,
  Sparkles,
  TrendingUp,
  CheckCircle2,
};

interface LoadingScreenProps {
  progress: number;
  activeStage: number;
}

export function LoadingScreen({ progress, activeStage }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative mb-10">
        <div className="absolute inset-0 w-28 h-28 rounded-full bg-[#38bdf8]/30 animate-ping-slow" />
        <div className="relative w-28 h-28 rounded-full bg-[#38bdf8] flex items-center justify-center animate-pulse-scale shadow-lg shadow-[#38bdf8]/20">
          <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
        </div>
      </div>

      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold text-white">{Math.round(progress)}%</span>
          <span className="text-slate-300">Generating...</span>
        </div>
        <div className="h-2.5 bg-[rgba(56,189,248,0.1)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#38bdf8] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>

      <div className="w-full space-y-2">
        {LOADING_STAGES.map((stage, i) => {
          const Icon = iconMap[stage.icon] || Sparkles;
          const isDone = i < activeStage;
          const isActive = i === activeStage;
          const isPending = i > activeStage;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isDone
                  ? "bg-[rgba(56,189,248,0.08)] text-[#38bdf8]"
                  : isActive
                  ? "bg-[#162040] text-white"
                  : "opacity-40 text-slate-400"
              }`}
              style={{
                opacity: mounted ? undefined : 0,
                animation: mounted ? `fade-in-up 0.3s ease-out ${i * 0.1}s forwards` : undefined,
              }}
              data-testid={`stage-${i}`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#38bdf8] flex-shrink-0" />
              ) : (
                <Icon className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
