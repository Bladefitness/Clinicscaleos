"use client";

import { Link } from "wouter";
import { ChevronDown, ChevronRight, Target, Sparkles, Map, MessageSquare, RefreshCw, MapPin, CheckCircle2, Check } from "lucide-react";
import type { LaunchPlanStep } from "@/lib/launch-plan-steps";
import { useLaunchPlanProgress } from "@/context/launch-plan-progress-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, typeof Target> = {
  M1: Target,
  M2: Sparkles,
  M3: Map,
  M4: MessageSquare,
  M5: RefreshCw,
};

interface FlowchartNodeProps {
  step: LaunchPlanStep | (LaunchPlanStep & { href: ""; queryOrHash: undefined });
  expandedId: string | null;
  onToggle: (id: string) => void;
  status?: "pending" | "current" | "completed";
  isIntro?: boolean;
  depth?: number;
}

function getStepStatus(
  stepId: string,
  completedStepIds: string[],
  currentStepId: string | null
): "pending" | "current" | "completed" {
  if (completedStepIds.includes(stepId)) return "completed";
  if (currentStepId === stepId) return "current";
  return "pending";
}

export function FlowchartNode({
  step,
  expandedId,
  onToggle,
  status: statusProp,
  isIntro,
  depth = 0,
}: FlowchartNodeProps) {
  const { completedStepIds, currentStepId, markCompleted } = useLaunchPlanProgress();
  const status = statusProp ?? getStepStatus(step.id, completedStepIds, currentStepId);
  const hasChildren = "children" in step && step.children && step.children.length > 0;
  const isExpanded = expandedId === step.id;
  const Icon = step.module ? MODULE_ICONS[step.module] : MapPin;
  const linkHref = step.href ? `${step.href}${step.queryOrHash || ""}` : null;

  return (
    <div className={cn("flex flex-col", depth > 0 && "ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4")}>
      <button
        type="button"
        onClick={() => onToggle(step.id)}
        className={cn(
          "flex items-center gap-3 w-full text-left rounded-lg p-3 transition-colors",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50",
          isExpanded && "bg-slate-100 dark:bg-slate-800/50",
          status === "current" && "ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10",
          status === "completed" && "opacity-90",
          status === "pending" && currentStepId && "opacity-75"
        )}
        aria-expanded={isExpanded}
        aria-controls={isIntro ? "intro-content" : `step-content-${step.id}`}
        data-testid={`flowchart-node-${step.id}`}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isIntro && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
            step.module === "M1" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
            step.module === "M2" && "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
            step.module === "M3" && "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
            step.module === "M4" && "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            step.module === "M5" && "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          )}
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-slate-100">{step.title}</span>
            {step.module && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                {step.module}
              </span>
            )}
            {status === "current" && (
              <span className="text-xs font-medium text-primary">You are here</span>
            )}
          </div>
        </div>
        {hasChildren && (
          <span className="text-slate-400">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
        {!hasChildren && (
          <span className="text-slate-400">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>

      {isExpanded && (
        <div
          id={isIntro ? "intro-content" : `step-content-${step.id}`}
          className="mt-2 mb-4 pl-11 pr-2 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
          role="region"
          aria-label={`Details for ${step.title}`}
        >
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{step.shortWhat}</p>
          {step.whyBullets && step.whyBullets.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Why this matters
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {step.whyBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-medium">Next:</span> {step.nextStep}
          </p>
          <div className="flex flex-wrap gap-2">
            {linkHref && (
              <Link href={linkHref}>
                <Button size="sm" className="btn-primary-glow gap-2" data-testid={`flowchart-do-step-${step.id}`}>
                  Do this step
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
            {status !== "completed" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => markCompleted(step.id)}
                data-testid={`flowchart-mark-done-${step.id}`}
              >
                <Check className="h-3 w-3" />
                Mark done
              </Button>
            )}
          </div>
        </div>
      )}

      {isExpanded && hasChildren && (step as LaunchPlanStep).children && (
        <div className="space-y-1 mt-1">
          {(step as LaunchPlanStep).children!.map((child) => (
            <FlowchartNode
              key={child.id}
              step={child}
              expandedId={expandedId}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
