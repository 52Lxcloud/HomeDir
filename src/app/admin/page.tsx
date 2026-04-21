import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSites } from "@/lib/sites";
import { AdminPanel } from "@/components/admin-panel";

export const metadata: Metadata = {
  title: "站点管理",
  description: "管理导航站点",
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { sites, categories } = getSites();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <a href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </a>
        <h1 className="text-lg font-semibold">站点管理</h1>
      </div>

      <Separator className="mb-6" />

      <AdminPanel sites={sites} categories={categories} />
    </div>
  );
}
