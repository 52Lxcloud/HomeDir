"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { SiteData, ShortcutConfig } from "@/lib/types";
import { getIcon, getIconUrl } from "@/lib/icons";
import { SearchDialog } from "@/components/search-dialog";
import { ShortcutHints } from "@/components/shortcut-hints";
import { NetworkToggle } from "@/components/network-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import NumberFlow from "@number-flow/react";

function getGreeting(hour: number) {
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-xs text-muted-foreground">
      {now ? (
        <>
          <div>{getGreeting(now.getHours())} 👋</div>
          <div className="flex items-center">
            <NumberFlow value={now.getHours()} format={{ minimumIntegerDigits: 2 }} />
            <span className="mx-px opacity-50">:</span>
            <NumberFlow value={now.getMinutes()} format={{ minimumIntegerDigits: 2 }} />
            <span className="mx-px opacity-50">:</span>
            <NumberFlow value={now.getSeconds()} format={{ minimumIntegerDigits: 2 }} />
          </div>
        </>
      ) : (
        <>
          <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/10" />
          <div className="mt-1 h-4 w-14 animate-pulse rounded bg-muted-foreground/10" />
        </>
      )}
    </div>
  );
}

const ALL = "all";

function CategoryTabs({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateIndicator = useCallback(() => {
    const indicator = indicatorRef.current;
    const activeTab = tabRefs.current.get(active);
    if (!indicator || !activeTab) return;

    indicator.style.width = `${activeTab.offsetWidth}px`;
    indicator.style.height = `${activeTab.offsetHeight}px`;
    indicator.style.left = `${activeTab.offsetLeft}px`;
    indicator.style.top = `${activeTab.offsetTop}px`;
  }, [active]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) updateIndicator();
  }, [mounted, updateIndicator]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const tabs = [ALL, ...categories];

  return (
    <div className="mb-6 flex justify-center">
      <nav
        className="relative inline-flex flex-wrap gap-1 rounded-2xl border bg-muted/40 p-1"
      >
        {/* 滑动指示器：挂载后才显示 */}
        {mounted && (
          <div
            ref={indicatorRef}
            className="pointer-events-none absolute rounded-lg bg-foreground transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
        )}

        {tabs.map((cat) => (
          <button
            key={cat}
            ref={(el) => {
              if (el) tabRefs.current.set(cat, el);
            }}
            className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              active === cat
                ? mounted
                  ? "text-background"
                  : "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
            onClick={() => onSelect(cat)}
          >
            {cat === ALL ? "全部" : cat}
          </button>
        ))}
      </nav>
    </div>
  );
}

async function probeInternal(url: string, timeout = 2000): Promise<boolean> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    return true;
  } catch {
    // 快速失败（< 300ms）通常是 CORS/mixed-content，说明主机可达
    // 超时失败说明主机不可达
    return Date.now() - start < timeout - 200;
  }
}

async function detectNetwork(internalUrls: string[]): Promise<boolean> {
  if (internalUrls.length === 0) return false;
  // 取前 3 个内网地址并发探测，任一可达即为内网
  const targets = internalUrls.slice(0, 3);
  const results = await Promise.all(targets.map((url) => probeInternal(url)));
  return results.some(Boolean);
}

export function HomePage({
  sites,
  categories,
  shortcuts,
  autoDetectNetwork,
}: {
  sites: SiteData[];
  categories: string[];
  shortcuts: ShortcutConfig[];
  autoDetectNetwork: boolean;
}) {
  const [active, setActive] = useState(ALL);
  const [isInternal, setIsInternal] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 自动探测开启时检测内外网，手动切换后跳过
  useEffect(() => {
    if (!autoDetectNetwork || manualOverride) return;
    const urls = [...new Set(sites.map((s) => s.url.internal))].filter(Boolean);
    detectNetwork(urls).then(setIsInternal);
  }, [sites, manualOverride, autoDetectNetwork]);

  const handleToggle = useCallback((val: boolean) => {
    setManualOverride(true);
    setIsInternal(val);
  }, []);

  const filtered = useMemo(
    () => (active === ALL ? sites : sites.filter((s) => s.category === active)),
    [sites, active]
  );

  return (
    <>
      <SearchDialog sites={sites} categories={categories} isInternal={isInternal} open={searchOpen} onOpenChange={setSearchOpen} />
      <ShortcutHints sites={sites} isInternal={isInternal} onSearch={() => setSearchOpen(true)} shortcuts={shortcuts} />

      {/* 工具栏 */}
      <div className="mb-8 flex items-center justify-between">
        <Clock />
        <div className="flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-3.5" />
          </Button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <NetworkToggle isInternal={isInternal} onToggle={handleToggle} />
          <div className="mx-0.5 h-4 w-px bg-border" />
          <ThemeToggle />
        </div>
      </div>

      {/* 分类标签栏 */}
      <CategoryTabs
        categories={categories}
        active={active}
        onSelect={setActive}
      />

      {/* 站点网格 */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-dashed py-24">
          <span className="text-sm text-muted-foreground">
            暂无站点 ·{" "}
            <Link href="/dash" className="underline underline-offset-4 hover:text-foreground">
              去后台添加
            </Link>
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {filtered.map((site) => {
            const Icon = getIcon(site.icon);
            const url = (isInternal ? site.url.internal : site.url.external) || site.url.internal || site.url.external;
            return (
              <a
                key={site.id}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2.5 rounded-xl border bg-card p-3 shadow-sm transition-all hover:border-foreground/15 hover:bg-accent/50 hover:shadow-md sm:gap-3.5 sm:p-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors sm:size-10 sm:rounded-xl">
                  {site.icon_url ? (
                    <img src={getIconUrl(site.icon_url)} alt="" className="size-5 rounded-md object-contain sm:size-6" />
                  ) : (
                    <Icon className="size-3.5 sm:size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-xs font-medium sm:text-sm">{site.name}</span>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">{site.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
