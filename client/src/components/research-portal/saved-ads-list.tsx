import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Tag, Loader2, Image as ImageIcon, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SavedAd } from "@shared/schema";

export function SavedAdsList() {
  const { data: ads, isLoading } = useQuery<SavedAd[]>({
    queryKey: ["/api/research/saved-ads"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/research/saved-ads");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/saved-ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/saved-ads"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, notes, tags }: { id: string; notes?: string; tags?: string[] }) => {
      const res = await apiRequest("PATCH", `/api/research/saved-ads/${id}`, { notes, tags });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research/saved-ads"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        No saved ads yet. Search the Ad Library and save ads you find interesting.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Saved Ads ({ads.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <SavedAdCard
            key={ad.id}
            ad={ad}
            onDelete={() => deleteMutation.mutate(ad.id)}
            onUpdateNotes={(notes) => updateMutation.mutate({ id: ad.id, notes })}
            onUpdateTags={(tags) => updateMutation.mutate({ id: ad.id, tags })}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function SavedAdCard({
  ad, onDelete, onUpdateNotes, onUpdateTags, isDeleting,
}: {
  ad: SavedAd;
  onDelete: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateTags: (tags: string[]) => void;
  isDeleting: boolean;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(ad.notes || "");
  const [tagInput, setTagInput] = useState("");

  return (
    <Card className="p-4 space-y-3">
      {ad.adCreativeUrl ? (
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <img src={ad.adCreativeUrl} alt="Ad creative" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <div>
        <p className="font-medium text-sm">{ad.advertiserName}</p>
        {ad.adTitle && <p className="text-sm">{ad.adTitle}</p>}
        {ad.adBody && <p className="text-xs text-muted-foreground line-clamp-3">{ad.adBody}</p>}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {ad.tags?.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            <Tag className="w-2.5 h-2.5 mr-1" />{tag}
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            className="h-6 text-xs w-20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                onUpdateTags([...(ad.tags || []), tagInput.trim()]);
                setTagInput("");
              }
            }}
          />
        </div>
      </div>

      {/* Notes */}
      {editingNotes ? (
        <div className="space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-xs" placeholder="Add notes..." />
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={() => { onUpdateNotes(notes); setEditingNotes(false); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setEditingNotes(true)}>
          <StickyNote className="w-3 h-3" /> {ad.notes ? ad.notes : "Add notes..."}
        </button>
      )}

      <Button variant="ghost" size="sm" onClick={onDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
        <Trash2 className="w-3 h-3 mr-1" /> Remove
      </Button>
    </Card>
  );
}
