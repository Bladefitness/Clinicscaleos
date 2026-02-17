"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import {
  MessageSquare, Send, Loader2, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, BarChart3, ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LAUNCH_PLAN_STEPS } from "@/lib/launch-plan-steps";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  followUpQuestions?: string[];
}

function AlertBadge({ level }: { level: string }) {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400",
    yellow: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[level as keyof typeof colors] || colors.green}`}>{level.toUpperCase()}</span>;
}

function TrendIcon({ direction }: { direction: string }) {
  if (direction === "up") return <ArrowUpRight className="w-3.5 h-3.5 text-[#38bdf8]" />;
  if (direction === "down") return <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

export default function AdCoach() {
  useEffect(() => {
    document.title = "Ad Coach | Clinic Growth OS";
  }, []);

  const [activeTab, setActiveTab] = useState<"pulse" | "weekly" | "chat">("pulse");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! I'm your AI Ad Coach. I can help you analyze campaign performance, optimize your ad spend, suggest creative improvements, or answer any advertising questions. What would you like to know?", followUpQuestions: ["How are my campaigns performing?", "What's a good CPL for a med spa?", "How do I improve my CTR?"] },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showWeeklyDetails, setShowWeeklyDetails] = useState(false);

  // Deep link from Launch Plan flowchart: /ad-coach?tab=pulse|weekly|chat
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "pulse" || tabParam === "weekly" || tabParam === "chat") setActiveTab(tabParam);
  }, []);

  const { toast } = useToast();
  const { data: pulseData, isLoading: pulseLoading } = useQuery({ queryKey: ["/api/metrics/daily-pulse"] });
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({ queryKey: ["/api/metrics/weekly-brief"] });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/coach/chat", { message, clinicContext: "", campaignData: "" });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response, followUpQuestions: data.follow_up_questions }]);
    },
    onError: (err: Error, message: string) => {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble processing that. Could you try rephrasing?" }]);
      toast({
        title: "Chat failed",
        description: err?.message || "Check your connection and Anthropic API key.",
        variant: "destructive",
        action: (
          <ToastAction altText="Retry" onClick={() => chatMutation.mutate(message)}>
            Retry
          </ToastAction>
        ),
      });
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim() || chatMutation.isPending) return;
    const msg = chatInput.trim();
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    chatMutation.mutate(msg);
  };

  const handleFollowUp = (q: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    chatMutation.mutate(q);
  };

  const tabs = [
    { id: "pulse" as const, label: "Daily Pulse" },
    { id: "weekly" as const, label: "Weekly Brief" },
    { id: "chat" as const, label: "Ask Coach" },
  ];

  const pulse = pulseData as any;
  const weekly = weeklyData as any;

  return (
    <div className="flex-1 pt-8 pb-6 px-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#162040] text-[#38bdf8] text-xs font-medium mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            Module 4: AI Ad Coach
          </span>
          <h1 className="text-2xl font-bold text-white gradient-text" data-testid="text-ad-coach-title">Ad Coach</h1>
          <p className="text-slate-400 text-sm mt-1">Your AI-powered campaign strategist. Daily insights, weekly briefs, and 24/7 coaching.</p>
          <p className="text-xs text-slate-400 mt-2 italic">Why? {LAUNCH_PLAN_STEPS.find((s) => s.id === "coach")?.whyBullets[0]}</p>
        </div>

        <div className="flex items-center gap-1 mb-6 bg-[#162040] p-1 rounded-md w-fit flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id ? "bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)]" : ""}`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "pulse" && pulseLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#38bdf8] animate-spin" />
          </div>
        )}

        {activeTab === "pulse" && !pulseLoading && pulse && (
          <div className="space-y-6">
            <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-white">Today's Pulse</h2>
                <AlertBadge level={pulse.alert_level} />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4" data-testid="text-pulse-summary">{pulse.summary}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{pulse.spend_today}</p>
                  <p className="text-xs text-slate-400">Spend Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{pulse.leads_today}</p>
                  <p className="text-xs text-slate-400">Leads Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{pulse.avg_cpl}</p>
                  <p className="text-xs text-slate-400">Avg CPL</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                <h3 className="text-sm font-semibold text-[#38bdf8] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Winners
                </h3>
                <div className="space-y-3">
                  {(pulse.winners || []).map((w: any, i: number) => (
                    <div key={i} className="border-b border-[rgba(56,189,248,0.1)] last:border-0 pb-3 last:pb-0">
                      <p className="text-sm font-medium text-white">{w.name}</p>
                      <p className="text-xs text-[#38bdf8] font-mono">{w.metric}</p>
                      <p className="text-xs text-slate-400 mt-1">{w.insight}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> Losers
                </h3>
                <div className="space-y-3">
                  {(pulse.losers || []).map((l: any, i: number) => (
                    <div key={i} className="border-b border-[rgba(56,189,248,0.1)] last:border-0 pb-3 last:pb-0">
                      <p className="text-sm font-medium text-white">{l.name}</p>
                      <p className="text-xs text-red-400 font-mono">{l.metric}</p>
                      <p className="text-xs text-slate-400 mt-1">{l.insight}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <h3 className="text-sm font-semibold text-white mb-3">Action Items</h3>
              <div className="space-y-2">
                {(pulse.actions || []).map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-[#162040]">
                    <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="text-[10px] mt-0.5 flex-shrink-0">
                      {a.priority}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-white">{a.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "weekly" && weeklyLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#38bdf8] animate-spin" />
          </div>
        )}

        {activeTab === "weekly" && !weeklyLoading && weekly && (
          <div className="space-y-6">
            <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <h2 className="text-lg font-bold text-white mb-3">Weekly Strategy Brief</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4" data-testid="text-weekly-summary">{weekly.executive_summary}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{weekly.total_spend}</p>
                  <p className="text-xs text-slate-400">Total Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{weekly.total_leads}</p>
                  <p className="text-xs text-slate-400">Total Leads</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{weekly.avg_cpl}</p>
                  <p className="text-xs text-slate-400">Avg CPL</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                <h3 className="text-sm font-semibold text-[#38bdf8] mb-2">Best Performing</h3>
                <p className="text-sm font-medium text-white">{weekly.best_performing?.name}</p>
                <p className="text-xs text-[#38bdf8] font-mono">{weekly.best_performing?.cpl} CPL | {weekly.best_performing?.leads} leads</p>
                <p className="text-xs text-slate-400 mt-1">{weekly.best_performing?.insight}</p>
              </Card>
              <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Worst Performing</h3>
                <p className="text-sm font-medium text-white">{weekly.worst_performing?.name}</p>
                <p className="text-xs text-red-400 font-mono">{weekly.worst_performing?.cpl} CPL | {weekly.worst_performing?.leads} leads</p>
                <p className="text-xs text-slate-400 mt-1">{weekly.worst_performing?.insight}</p>
              </Card>
            </div>

            <Card className="p-6 bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]">
              <button onClick={() => setShowWeeklyDetails(!showWeeklyDetails)} className="w-full flex items-center justify-between" data-testid="button-toggle-weekly-details">
                <h3 className="text-sm font-semibold text-white">Trends & Recommendations</h3>
                {showWeeklyDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showWeeklyDetails && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trends</p>
                    <div className="space-y-2">
                      {(weekly.trends || []).map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <TrendIcon direction={t.direction} />
                          <span className="text-sm text-white">{t.metric}:</span>
                          <span className="text-xs text-slate-400">{t.insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommendations</p>
                    <div className="space-y-2">
                      {(weekly.recommendations || []).map((r: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-[#162040]">
                          <Badge variant={r.priority === "high" ? "destructive" : "secondary"} className="text-[10px] mt-0.5 flex-shrink-0">{r.priority}</Badge>
                          <div>
                            <p className="text-sm font-medium text-white">{r.action}</p>
                            <p className="text-xs text-slate-400">{r.expected_impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-[#162040] rounded-md">
                    <p className="text-xs font-semibold text-[#38bdf8] mb-1">Next Week Plan</p>
                    <p className="text-sm text-white">{weekly.next_week_plan}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "chat" && (
          <Card className="flex flex-col bg-[#111d35] shadow-[0_0_15px_rgba(56,189,248,0.04)] rounded-xl border-[rgba(56,189,248,0.1)]" style={{ height: "calc(100vh - 250px)", minHeight: "400px" }}>
            <div className="flex-1 overflow-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`rounded-md px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#c8a04a] text-white"
                          : "bg-[#162040] text-white"
                      }`}
                      data-testid={`chat-message-${i}`}
                    >
                      {msg.content}
                    </div>
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.followUpQuestions.map((q, qi) => (
                          <button
                            key={qi}
                            onClick={() => handleFollowUp(q)}
                            className="text-xs px-3 py-1.5 rounded-full border border-[rgba(56,189,248,0.1)] text-slate-400 hover:text-white hover:border-[#38bdf8] transition-colors"
                            data-testid={`button-followup-${i}-${qi}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-[#162040] rounded-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#38bdf8]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-[rgba(56,189,248,0.1)] p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask your Ad Coach anything..."
                  className="flex-1"
                  data-testid="input-coach-chat"
                />
                <Button
                  onClick={handleSend}
                  disabled={!chatInput.trim() || chatMutation.isPending}
                  size="icon"
                  className="btn-gold text-white"
                  data-testid="button-send-chat"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
