import "server-only";
import { getAllSites, seedIfEmpty } from "@/lib/db";
import type { SiteData } from "@/lib/types";

export function getSites(): { sites: SiteData[]; categories: string[] } {
  seedIfEmpty();
  const rows = getAllSites();

  const sites: SiteData[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    desc: r.desc,
    icon: r.icon,
    category: r.category,
    url: { internal: r.url_internal, external: r.url_external },
    tags: JSON.parse(r.tags),
    sort_order: r.sort_order,
  }));

  const categories = Array.from(new Set(sites.map((s) => s.category))).sort();

  return { sites, categories };
}
