import { Terminal, Send } from "lucide-react";
import { GithubIcon } from "@/components/icons/github";
import { version } from "@/../package.json";

export function AdminAbout() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6 text-center">
        <Terminal className="mx-auto mb-4 size-8" />
        <div className="mb-1 text-2xl font-bold">HomeDir</div>
        <div className="text-sm text-muted-foreground">v{version}</div>
        <div className="mt-3 text-xs text-muted-foreground">
          自托管导航面板，快速访问内外网服务
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        {[
          { label: "框架", value: "Next.js + React" },
          { label: "UI", value: "Tailwind CSS" },
          { label: "数据库", value: "SQLite" },
        ].map(({ label, value }, i, arr) => (
          <div
            key={label}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              i !== arr.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-2.5 text-sm font-medium">Contact</div>
        <a href="https://t.me/Lx_hub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 border-t px-4 py-2.5 text-sm transition-colors hover:bg-muted/50">
          <Send className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Telegram</span>
          <span className="ml-auto text-xs text-muted-foreground/60">@Lx_hub</span>
        </a>
        <a href="https://github.com/52Lxcloud" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 border-t px-4 py-2.5 text-sm transition-colors hover:bg-muted/50">
          <GithubIcon className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">GitHub</span>
          <span className="ml-auto text-xs text-muted-foreground/60">@52Lxcloud</span>
        </a>
      </div>
    </div>
  );
}
