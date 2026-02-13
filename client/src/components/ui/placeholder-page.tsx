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
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-page-title">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Coming Soon</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
