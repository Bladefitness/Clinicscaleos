"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Video, Plus, Loader2, MessageSquare, Film, Mic } from "lucide-react";

type TimelineTrack = { id: string; type: string; clips: Array<{ id: string; start: number; end: number; url?: string; label?: string }> };
type TimelineState = { tracks: TimelineTrack[]; duration: number };

function VideoStudioPage() {
  useEffect(() => {
    document.title = "Video Studio | Clinic Growth OS";
  }, []);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["video-studio-projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/video-studio/projects");
      return res.json();
    },
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["video-studio-project", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const res = await apiRequest("GET", `/api/video-studio/projects/${selectedProjectId}`);
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/video-studio/projects", { name: "New project", type: "short_form" });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video-studio-projects"] });
      setSelectedProjectId(data.id);
      toast({ title: "Project created" });
    },
    onError: (e) => toast({ title: "Failed to create project", description: (e as Error).message, variant: "destructive" }),
  });

  const addVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const res = await apiRequest("POST", `/api/video-studio/projects/${selectedProjectId}/assets`, {
        kind: "video",
        fileBase64: base64,
        mimeType: file.type || "video/mp4",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-studio-project", selectedProjectId] });
      toast({ title: "Video added to timeline" });
    },
    onError: (e) => toast({ title: "Failed to add video", description: (e as Error).message, variant: "destructive" }),
  });

  const directorMutation = useMutation({
    mutationFn: async (userPrompt: string) => {
      const res = await apiRequest("POST", "/api/video-studio/director", {
        projectId: selectedProjectId,
        prompt: userPrompt,
        timeline: project?.timeline,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video-studio-project", selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ["video-studio-messages", selectedProjectId] });
      if (data.success) {
        toast({ title: data.message || "Done" });
      } else {
        toast({ title: data.message || "No action taken", variant: "destructive" });
      }
    },
    onError: (e) => toast({ title: "Director failed", description: (e as Error).message, variant: "destructive" }),
  });

  const timeline = (project?.timeline as TimelineState) || { tracks: [], duration: 0 };
  const tracks = timeline.tracks ?? [];
  const mainTrack = tracks.find((t) => t.id === "main") ?? tracks.find((t) => t.type === "video");
  const clips = mainTrack?.clips ?? [];
  const hasVideo = clips.length > 0;
  const firstVideoUrl = clips[0]?.url ?? mainTrack?.clips?.[0]?.url;

  const { data: messages = [] } = useQuery({
    queryKey: ["video-studio-messages", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const res = await apiRequest("GET", `/api/video-studio/projects/${selectedProjectId}/messages`);
      return res.json();
    },
    enabled: !!selectedProjectId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProjectId) addVideoMutation.mutate(file);
    e.target.value = "";
  };

  const handleDirectorSubmit = () => {
    if (!prompt.trim() || !selectedProjectId) return;
    directorMutation.mutate(prompt.trim());
    setPrompt("");
  };

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Breadcrumb
        className="border-b border-[rgba(56,189,248,0.1)] px-4 py-2"
        items={[{ label: "Dashboard", href: "/" }, { label: "Video Studio" }]}
      />

      <div className="flex flex-1 overflow-hidden gap-4 p-8">
        {/* Left: project list + assets */}
        <aside className="w-56 flex-shrink-0 flex flex-col gap-2 overflow-auto">
          <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
            <p className="text-xs font-medium text-slate-400 mb-2">Projects</p>
            {projectsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : (
              <ul className="space-y-1">
                {projects.map((p: { id: string; name: string }) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm ${selectedProjectId === p.id ? "bg-[rgba(56,189,248,0.08)] text-[#38bdf8]" : "hover:bg-[#162040]"}`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => createProject.mutate()}
              disabled={createProject.isPending}
            >
              {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              New project
            </Button>
          </Card>
          {selectedProjectId && (
            <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl p-6">
              <p className="text-xs font-medium text-slate-400 mb-2">Add video</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={addVideoMutation.isPending}
              >
                {addVideoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                Upload video
              </Button>
            </Card>
          )}
        </aside>

        {/* Center: timeline / preview */}
        <section className="flex-1 flex flex-col min-w-0 gap-2">
          <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl flex-1 flex flex-col min-h-0 p-6">
            <h2 className="text-sm font-semibold mb-2 text-white">Timeline</h2>
            {!selectedProjectId ? (
              <EmptyState
                icon={<Video className="w-8 h-8" />}
                title="No project selected"
                description="Create a project or select one from the list."
              />
            ) : projectLoading ? (
              <div className="flex items-center justify-center flex-1 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : !hasVideo ? (
              <EmptyState
                icon={<Film className="w-8 h-8" />}
                title="No video in timeline"
                description="Upload a video to get started. Then try: Remove dead air, Add captions."
              />
            ) : (
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                {firstVideoUrl && (
                  <div className="rounded-lg overflow-hidden bg-[#162040] border border-[rgba(56,189,248,0.1)] flex-shrink-0">
                    <video src={firstVideoUrl} controls className="w-full max-h-[280px]" />
                  </div>
                )}
                <div className="text-xs text-slate-400">
                  Duration: {timeline.duration?.toFixed(1) ?? 0}s · Tracks: {tracks.length}
                </div>
                <div className="space-y-2 overflow-auto">
                  {tracks.map((track) => (
                    <div key={track.id} className="text-sm">
                      <span className="font-medium text-slate-400">
                        {track.id === "main" ? "V1" : track.id.toUpperCase()}
                      </span>
                      <ul className="mt-1 space-y-1">
                        {(track.clips ?? []).map((c: { id: string; label?: string; start?: number; end: number; url?: string }) => (
                          <li key={c.id} className="flex items-center gap-2">
                            {track.type === "video" ? <Video className="h-4 w-4 text-slate-400 shrink-0" /> : <MessageSquare className="h-4 w-4 text-slate-400 shrink-0" />}
                            {c.label || c.id} ({(c.start ?? 0).toFixed(1)}–{c.end.toFixed(1)}s)
                          </li>
                        ))}
                        {(track.clips ?? []).length === 0 && track.type === "caption" && (
                          <li className="text-slate-400 italic">Caption data only</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Right: Director chat */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-2">
          <Card className="bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl flex-1 flex flex-col min-h-0 p-6">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4" />
              Director
            </h2>
            <p className="text-xs text-slate-400 mb-2">
              Try: &quot;Remove dead air&quot; or &quot;Add captions&quot;.
            </p>
            {messages.length > 0 && (
              <div className="flex-1 min-h-0 overflow-auto mb-3 space-y-2 max-h-[200px] rounded border border-[rgba(56,189,248,0.1)] p-2 bg-[#162040]">
                {messages.slice(-12).map((m: { id: string; role: string; content: string }) => (
                  <div key={m.id} className={`text-xs ${m.role === "user" ? "text-slate-400" : "text-white"}`}>
                    <span className="font-medium">{m.role === "user" ? "You" : "Director"}:</span> {m.content.slice(0, 200)}{m.content.length > 200 ? "…" : ""}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => directorMutation.mutate("Remove dead air and silence")}
                disabled={!selectedProjectId || !hasVideo || directorMutation.isPending}
              >
                <Mic className="h-4 w-4 mr-1" /> Remove dead air
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => directorMutation.mutate("Add captions")}
                disabled={!selectedProjectId || !hasVideo || directorMutation.isPending}
              >
                Add captions
              </Button>
            </div>
            <div className="flex gap-2 flex-1 min-h-0">
              <Input
                placeholder="e.g. Remove dead air"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDirectorSubmit()}
                disabled={!selectedProjectId || directorMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={() => handleDirectorSubmit()}
                disabled={!prompt.trim() || !selectedProjectId || directorMutation.isPending}
                className="btn-gold text-white"
              >
                {directorMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default VideoStudioPage;
