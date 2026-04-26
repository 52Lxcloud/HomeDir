import { Terminal } from "lucide-react";
import { GithubIcon } from "@/components/icons/github";
import { getSites } from "@/lib/sites";
import { HomePage } from "@/components/home-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { sites, categories, config, shortcuts } = getSites();

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pt-8 sm:px-6 lg:px-8">
      {/* 标题 — Server Component，0 JS */}
      <header className="mb-8 flex items-center gap-2.5">
        <Terminal className="size-5" />
        <span className="flex-1 text-sm font-semibold tracking-tight">{config.site_name}</span>
        <a href="https://github.com/52Lxcloud/HomeDir" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 transition-colors hover:text-muted-foreground">
          <GithubIcon className="size-4" />
        </a>
      </header>

      {/* 交互区域 — Client Component */}
      <div className="flex-1">
        <HomePage sites={sites} categories={categories} shortcuts={shortcuts} autoDetectNetwork={config.auto_detect_network === "true"} />
      </div>

      {/* 底部 */}
      <footer className="mt-auto flex flex-col items-center gap-4 pb-4 pt-8">
        {config.footer_text && (
          <p className="text-[11px] text-muted-foreground/60 [&_a]:no-underline [&_a]:hover:text-muted-foreground" dangerouslySetInnerHTML={{ __html: config.footer_text }} />
        )}
      </footer>
    </div>
  );
}
