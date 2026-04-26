import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSites } from "@/lib/sites";
import { getAllShortcuts } from "@/lib/db";
import { AdminPanel } from "@/components/admin-panel";
import { isAuthenticated, hasPassword } from "@/lib/auth";
import { logoutAction } from "./login/actions";

export const metadata: Metadata = {
  title: "管理",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasPassword() || !(await isAuthenticated())) redirect("/dash/login");

  const { sites, categories, config } = getSites();
  const shortcuts = getAllShortcuts().map((s) => ({ id: s.id, key: s.key, site_id: s.site_id }));

  // 过滤敏感字段，只传展示用的配置给客户端
  const safeConfig = {
    site_name: config.site_name,
    site_description: config.site_description,
    footer_text: config.footer_text,
    auto_detect_network: config.auto_detect_network,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="flex-1 text-sm font-semibold">站点管理</h1>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            <LogOut className="size-3.5" />
          </Button>
        </form>
      </div>

      <AdminPanel sites={sites} categories={categories} config={safeConfig} shortcuts={shortcuts} />
    </div>
  );
}
