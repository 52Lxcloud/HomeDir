export interface SiteData {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  url: { internal: string; external: string };
  tags: string[];
  sort_order: number;
}
