"use client";

import { useState, useMemo, useEffect } from "react";
import type { SiteData } from "@/lib/types";
type SafeConfig = { site_name: string; site_description: string; footer_text: string; auto_detect_network: string };
import { AdminOverview } from "@/components/admin/overview";
import { AdminSites } from "@/components/admin/sites";
import { AdminCategories } from "@/components/admin/categories";
import { AdminSettings } from "@/components/admin/settings";
import { AdminShortcuts } from "@/components/admin/shortcuts";
import type { ShortcutData } from "@/components/admin/shortcuts";
import { AdminAbout } from "@/components/admin/about";
import { BarChart3, LayoutGrid, Layers, Settings, Keyboard, Info } from "lucide-react";

type Tab = "overview" | "sites" | "categories" | "shortcuts" | "settings" | "about";
const validTabs: Tab[] = ["overview", "sites", "categories", "shortcuts", "settings", "about"];

const tabs = [
  { key: "overview" as const, label: "概览", icon: BarChart3 },
  { key: "sites" as const, label: "站点", icon: LayoutGrid },
  { key: "categories" as const, label: "分类", icon: Layers },
  { key: "shortcuts" as const, label: "热键", icon: Keyboard },
  { key: "settings" as const, label: "配置", icon: Settings },
  { key: "about" as const, label: "关于", icon: Info },
];

export function AdminPanel({
  sites,
  categories,
  config,
  shortcuts,
}: {
  sites: SiteData[];
  categories: string[];
  config: SafeConfig;
  shortcuts: ShortcutData[];
}) {
  const [tab, setTabState] = useState<Tab>("overview");
  const [mounted, setMounted] = useState(false);

  const setTab = (t: Tab) => {
    setTabState(t);
    window.location.hash = t;
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (validTabs.includes(hash as Tab)) setTabState(hash as Tab);
    setMounted(true);

    const onHash = () => {
      const h = window.location.hash.slice(1);
      if (validTabs.includes(h as Tab)) setTabState(h as Tab);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const categoryCount = useMemo(() => {
    return new Set(sites.map((s) => s.category)).size;
  }, [sites]);

  if (!mounted) {
    return (
      <div className="mb-6 flex animate-pulse items-center gap-1 rounded-lg border bg-muted/30 p-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Tab 导航 */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border bg-muted/30 p-1">
        {tabs.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TabIcon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <AdminOverview sites={sites} categoryCount={categoryCount} onNavigate={(t) => setTab(t as Tab)} />
      )}
      {tab === "sites" && (
        <AdminSites sites={sites} categories={categories} />
      )}
      {tab === "categories" && (
        <AdminCategories sites={sites} />
      )}
      {tab === "shortcuts" && (
        <AdminShortcuts shortcuts={shortcuts} sites={sites} />
      )}
      {tab === "settings" && (
        <AdminSettings config={config} />
      )}
      {tab === "about" && (
        <AdminAbout />
      )}
    </>
  );
}
