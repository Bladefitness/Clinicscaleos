import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CommandShortcut } from "@/components/ui/command";
import {
  LayoutDashboard,
  Search,
  Target,
  Sparkles,
  Map,
  MessageSquare,
} from "lucide-react";

const RECENT_KEY = "clinic-growth-recent-pages";
const MAX_RECENT = 4;

const commands = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard, shortcut: "⌘1" },
  { id: "research-portal", label: "Research Portal", href: "/research-portal", icon: Search },
  { id: "offer-lab", label: "Offer Lab", href: "/offer-lab", icon: Target, shortcut: "⌘2" },
  { id: "creative-factory", label: "Creative Factory", href: "/creative-factory", icon: Sparkles, shortcut: "⌘3" },
  { id: "campaign-hq", label: "Campaign HQ", href: "/campaign-hq", icon: Map, shortcut: "⌘4" },
  { id: "ad-coach", label: "Ad Coach", href: "/ad-coach", icon: MessageSquare, shortcut: "⌘5" },
];

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushRecent(href: string) {
  const recent = getRecent().filter((h) => h !== href);
  recent.unshift(href);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [location, setLocation] = useLocation();

  const handleSelect = useCallback((href: string) => {
    setLocation(href);
    pushRecent(href);
    setRecent(getRecent());
    setOpen(false);
  }, [setLocation]);

  useEffect(() => {
    setRecent(getRecent());
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const recentHrefs = recent.filter((h) => h !== location);
  const recentCommands = recentHrefs
    .map((href) => commands.find((c) => c.href === href))
    .filter(Boolean) as typeof commands;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules or type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {recentCommands.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => handleSelect(cmd.href)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {cmd.label}
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Go to">
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={cmd.label}
                onSelect={() => handleSelect(cmd.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {cmd.label}
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
