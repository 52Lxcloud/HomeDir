import { Terminal } from "lucide-react";
import { getSites } from "@/lib/sites";
import { getNetworkMode } from "@/lib/network";
import { HomePage } from "@/components/home-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 60;

export default async function Page() {
  const { sites, categories } = getSites();
  const isInternal = await getNetworkMode();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* 标题 — Server Component，0 JS */}
      <header className="mb-8 flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-foreground">
          <Terminal className="size-3.5 text-background" />
        </div>
        <span className="text-sm font-semibold tracking-tight">{SITE_NAME}</span>
      </header>

      {/* 交互区域 — Client Component */}
      <div className="flex-1">
        <HomePage sites={sites} categories={categories} defaultInternal={isInternal} />
      </div>

      {/* 底部主题切换 */}
      <footer className="mt-12 flex justify-center pb-4">
        <ThemeToggle />
      </footer>
    </div>
  );
}
