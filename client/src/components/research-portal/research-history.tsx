import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResearchSession } from "@shared/schema";

interface ResearchHistoryProps {
  onSelect: (session: ResearchSession) => void;
}

export function ResearchHistory({ onSelect }: ResearchHistoryProps) {
  const { data: sessions, isLoading } = useQuery<ResearchSession[]>({
    queryKey: ["/api/research/sessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/research/sessions?limit=10");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/sessions"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        No research sessions yet. Run your first search above.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" /> Recent Research
      </h3>
      {sessions.map((session) => (
        <Card key={session.id} className="p-3 flex items-center justify-between gap-3 hover:bg-accent/50 transition-colors">
          <button
            className="flex-1 text-left flex items-center gap-3"
            onClick={() => onSelect(session)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.query}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {session.clinicType && <span className="text-xs text-muted-foreground">{session.clinicType}</span>}
                <Badge variant={session.status === "complete" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                  {session.status}
                </Badge>
                <Badge variant={session.source === "web_search" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                  {session.source === "web_search" ? "Web" : "AI"}
                </Badge>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(session.id);
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </Card>
      ))}
    </div>
  );
}
