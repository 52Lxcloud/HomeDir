"use client";

import { useState, useEffect, useMemo } from "react";
import type { SiteData, ShortcutConfig } from "@/lib/types";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

export function ShortcutHints({
  sites,
  isInternal,
  onSearch,
  shortcuts: shortcutConfigs,
}: {
  sites: SiteData[];
  isInternal: boolean;
  onSearch: () => void;
  shortcuts: ShortcutConfig[];
}) {
  const [show, setShow] = useState(false);

  const shortcuts = useMemo(() => {
    const getUrl = (s: SiteData) =>
      (isInternal ? s.url.internal : s.url.external) || s.url.internal || s.url.external;

    const list: { key: string; label: string; run: () => void }[] = [
      { key: "K", label: "搜索", run: onSearch },
    ];

    for (const sc of shortcutConfigs) {
      const site = sites.find((s) => s.id === sc.site_id);
      if (site) list.push({ key: sc.key, label: site.name, run: () => window.open(getUrl(site), "_blank") });
    }

    return list;
  }, [sites, isInternal, onSearch, shortcutConfigs]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === (isMac ? "Meta" : "Control")) return setShow(true);
      if (!(e.metaKey || e.ctrlKey)) return;
      const s = shortcuts.find((s) => s.key.toLowerCase() === e.key.toLowerCase());
      if (s && s.key !== "K") { e.preventDefault(); s.run(); setShow(false); }
    };
    const up = (e: KeyboardEvent) => { if (e.key === (isMac ? "Meta" : "Control")) setShow(false); };
    const blur = () => setShow(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [shortcuts]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150 backdrop-blur-xl backdrop-saturate-150">
      <div className="animate-in zoom-in-95 duration-200 w-96 rounded-3xl border bg-card/80 p-10 shadow-xl backdrop-blur-sm">
        <div className="mb-8 text-center text-xs font-medium tracking-widest text-muted-foreground/40 uppercase">Shortcuts</div>
        <div className="flex flex-col gap-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-muted/40">
              <span className="text-base">{s.label}</span>
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border bg-background text-xs font-medium text-muted-foreground shadow-sm">{MOD}</kbd>
                <kbd className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border bg-background text-xs font-medium text-muted-foreground shadow-sm">{s.key}</kbd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
