"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Target, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "clinic-growth-onboarding-seen";

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(ONBOARDING_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleGetStarted = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
    setOpen(false);
    router.push("/offer-lab");
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-[#111d35] rounded-2xl border-[rgba(56,189,248,0.15)]" onPointerDownOutside={handleDismiss}>
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl bg-[rgba(56,189,248,0.08)] flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-[#38bdf8]" />
          </div>
          <DialogTitle className="text-xl text-white">Welcome to Clinic Growth OS</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-slate-400">
            Your end-to-end system for healthcare advertising. Build offers, create ads, and scale campaigns — all in one place.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-lg bg-[rgba(56,189,248,0.08)] flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <p className="font-medium text-white">Offer Lab</p>
              <p className="text-slate-400">Score and optimize your offer with AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-lg bg-[rgba(56,189,248,0.08)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <p className="font-medium text-white">Creative Factory</p>
              <p className="text-slate-400">Generate scroll-stopping ad creatives</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss} className="flex-1 border-[rgba(56,189,248,0.1)] text-slate-300 hover:bg-[#162040]">
            Explore on my own
          </Button>
          <Button onClick={handleGetStarted} className="btn-primary-glow flex-1 gap-2 btn-gold">
            Get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
