import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 从字符串名称获取 lucide 图标组件
export function getIcon(name: string): LucideIcon {
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return icon || LucideIcons.Globe;
}

// 常用图标列表，用于后台选择
export const commonIcons = [
  "Globe", "HardDrive", "Server", "Database", "Film", "Music",
  "FileText", "Settings", "Shield", "Cloud", "Monitor", "Cpu",
  "Wifi", "Router", "Lock", "Key", "Mail", "MessageSquare",
  "Camera", "Image", "Video", "Folder", "Archive", "Download",
  "Upload", "Terminal", "Code", "GitBranch", "Box", "Package",
  "Zap", "Activity", "BarChart", "PieChart", "Layers", "Layout",
  "Home", "Bookmark", "Star", "Heart", "Search", "Eye",
] as const;
