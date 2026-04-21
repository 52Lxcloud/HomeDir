"use client";

import { useCallback, useEffect, useMemo } from "react";
import { getIcon } from "@/lib/icons";
import type { SiteData } from "@/lib/types";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function SearchDialog({
  sites,
  categories,
  isInternal,
  open,
  onOpenChange,
}: {
  sites: SiteData[];
  categories: string[];
  isInternal: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const grouped = useMemo(() => {
    const map: Record<string, SiteData[]> = {};
    for (const cat of categories) {
      const items = sites.filter((s) => s.category === cat);
      if (items.length > 0) map[cat] = items;
    }
    return map;
  }, [sites, categories]);

  const handleSelect = useCallback(
    (site: SiteData) => {
      const url = isInternal ? site.url.internal : site.url.external;
      window.open(url, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    },
    [isInternal, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="搜索服务…" />
      <CommandList className="scrollbar-auto-hide">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground/60">
            <Search className="size-8 stroke-[1.5]" />
            <span className="text-sm">没有找到相关服务</span>
          </div>
        </CommandEmpty>
        {Object.entries(grouped).map(([cat, items]) => (
          <CommandGroup key={cat} heading={cat}>
            {items.map((site) => {
              const Icon = getIcon(site.icon);
              const url = isInternal ? site.url.internal : site.url.external;
              let hostname: string;
              try { hostname = new URL(url).hostname; } catch { hostname = url; }
              return (
                <CommandItem
                  key={site.id}
                  value={`${site.name} ${site.desc} ${site.tags?.join(" ") ?? ""}`}
                  onSelect={() => handleSelect(site)}
                  className="gap-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/80">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{site.name}</div>
                    <div className="truncate text-xs text-muted-foreground/60">{hostname}</div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
