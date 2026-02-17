"use client";

import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex-1 p-6 lg:p-10">
      <div className="max-w-2xl mx-auto mt-20">
        <Card className="p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#162040] flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-[#38bdf8]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="text-page-title">{title}</h2>
          <p className="text-slate-400 mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#162040] border border-[rgba(56,189,248,0.1)] text-sm text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
