"use client";

import { RefreshCw, BarChart3, TrendingDown, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "test", label: "Test creatives", short: "Launch multiple ad sets", icon: Sparkles },
  { id: "measure", label: "Measure", short: "CPL, CTR, leads", icon: BarChart3 },
  { id: "kill-scale", label: "Kill losers / Scale winners", short: "Pause underperformers, duplicate winners", icon: TrendingDown },
  { id: "iterate", label: "Iterate", short: "New variations, re-test", icon: RefreshCw },
];

export function TestingLoopDiagram() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex items-center gap-2 w-full text-left rounded-lg p-3 transition-colors",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50",
          "border border-slate-200 dark:border-slate-800"
        )}
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        <span className="font-medium text-slate-900 dark:text-slate-100">Understand the system: How clinic ads work</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            The same loop powers Campaign HQ and Iteration Lab: test, measure, decide, then iterate. You don’t guess — you learn from data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4" role="img" aria-label="Testing loop: Test creatives, Measure, Kill losers Scale winners, Iterate">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px] p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <s.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 text-center">{s.label}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center">{s.short}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 hidden sm:inline" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">(loop back to Test with new creatives)</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
