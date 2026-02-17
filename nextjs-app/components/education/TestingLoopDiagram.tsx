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
          "hover:bg-[#162040]",
          "border border-[rgba(56,189,248,0.1)]"
        )}
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        <span className="font-medium text-white">Understand the system: How clinic ads work</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 p-4 rounded-lg bg-[#162040] border border-[rgba(56,189,248,0.08)]">
          <p className="text-sm text-slate-400 mb-4">
            The same loop powers Campaign HQ and Iteration Lab: test, measure, decide, then iterate. You don't guess — you learn from data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4" role="img" aria-label="Testing loop: Test creatives, Measure, Kill losers Scale winners, Iterate">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 min-w-[100px] sm:min-w-[120px] p-3 rounded-lg bg-[#111d35] border border-[rgba(56,189,248,0.1)] shadow-[0_0_10px_rgba(56,189,248,0.04)]">
                  <s.icon className="h-5 w-5 text-[#38bdf8]" />
                  <span className="text-xs font-semibold text-white text-center">{s.label}</span>
                  <span className="text-[10px] text-slate-500 text-center">{s.short}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-xs text-slate-500">(loop back to Test with new creatives)</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
