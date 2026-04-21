"use client";

import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "system", icon: Monitor, label: "System" },
    { key: "dark", icon: Moon, label: "Dark" },
  ] as const;

  const handleSwitch = (key: string) => {
    if (key === theme) return;

    // 不支持 View Transitions 或用户开启了减少动画
    if (
      !(document as any).startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(key);
      return;
    }

    // 标记正在切换主题，CSS 动画只在此时生效
    document.documentElement.dataset.themeSwitching = "";

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(key);
      });
    });

    transition.finished.then(() => {
      delete document.documentElement.dataset.themeSwitching;
    });
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border bg-muted/40 p-1">
      {items.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => handleSwitch(key)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors duration-200 ${
            mounted && theme === key
              ? "bg-foreground/10 text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          }`}
          title={label}
          aria-pressed={mounted && theme === key}
        >
          <Icon className="size-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
