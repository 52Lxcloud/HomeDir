import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface SiteRow {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name, e.g. "HardDrive"
  category: string;
  url_internal: string;
  url_external: string;
  tags: string; // JSON array string
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteInput {
  id?: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  url_internal: string;
  url_external: string;
  tags?: string[];
  sort_order?: number;
}

const DB_PATH = path.join(process.cwd(), "data", "sites.db");

let _db: InstanceType<typeof Database> | null = null;

function getDb() {
  if (_db) return _db;

  // 确保 data 目录存在
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // 创建表
  _db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      desc TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'Globe',
      category TEXT NOT NULL DEFAULT '未分类',
      url_internal TEXT NOT NULL DEFAULT '',
      url_external TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return _db;
}

// 生成短 ID
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getAllSites(): SiteRow[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM sites ORDER BY category, sort_order, name").all() as SiteRow[];

  return rows;
}

export function createSite(input: SiteInput): SiteRow {
  const db = getDb();
  const id = input.id || genId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sites (id, name, desc, icon, category, url_internal, url_external, tags, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name,
    input.desc,
    input.icon,
    input.category,
    input.url_internal,
    input.url_external,
    JSON.stringify(input.tags || []),
    input.sort_order ?? 0,
    now,
    now
  );

  const row = db.prepare("SELECT * FROM sites WHERE id = ?").get(id) as SiteRow;

  return row;
}

export function updateSite(id: string, input: Partial<SiteInput>): SiteRow | null {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM sites WHERE id = ?").get(id) as SiteRow | undefined;
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE sites SET
      name = ?, desc = ?, icon = ?, category = ?,
      url_internal = ?, url_external = ?, tags = ?,
      sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    input.name ?? existing.name,
    input.desc ?? existing.desc,
    input.icon ?? existing.icon,
    input.category ?? existing.category,
    input.url_internal ?? existing.url_internal,
    input.url_external ?? existing.url_external,
    input.tags ? JSON.stringify(input.tags) : existing.tags,
    input.sort_order ?? existing.sort_order,
    now,
    id
  );

  const row = db.prepare("SELECT * FROM sites WHERE id = ?").get(id) as SiteRow;

  return row;
}

export function deleteSite(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM sites WHERE id = ?").run(id);

  return result.changes > 0;
}

// 种子数据：将现有 sites.ts 数据导入数据库
export function seedIfEmpty() {
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) as c FROM sites").get() as { c: number }).c;

  if (count === 0) {
    const seeds: SiteInput[] = [
      { id: "nas", name: "Synology NAS", desc: "文件管理与存储中心", icon: "HardDrive", category: "基础设施", url_internal: "http://192.168.1.5:5000", url_external: "https://nas.lxcloud.com", tags: ["存储", "文件", "nas"], sort_order: 0 },
      { id: "emby", name: "Emby", desc: "私人多媒体服务器", icon: "Film", category: "娱乐", url_internal: "http://192.168.1.5:8096", url_external: "https://media.lxcloud.com", tags: ["视频", "电影", "串流"], sort_order: 0 },
      { id: "transmission", name: "Transmission", desc: "下载管理工具", icon: "Server", category: "工具", url_internal: "http://192.168.1.5:6969", url_external: "https://download.lxcloud.com", tags: ["下载", "bt", "种子"], sort_order: 0 },
      { id: "postgres", name: "PostgreSQL", desc: "数据库管理", icon: "Database", category: "基础设施", url_internal: "http://192.168.1.5:5432", url_external: "https://db.lxcloud.com", tags: ["数据库", "sql", "pg"], sort_order: 0 },
      { id: "settings", name: "系统设置", desc: "路由器和系统配置", icon: "Settings", category: "管理", url_internal: "http://192.168.1.1", url_external: "https://admin.lxcloud.com", tags: ["配置", "管理", "系统"], sort_order: 0 },
      { id: "docs", name: "文档中心", desc: "项目文档和笔记", icon: "FileText", category: "资源", url_internal: "http://192.168.1.5:3000/docs", url_external: "https://docs.lxcloud.com", tags: ["文档", "wiki", "知识"], sort_order: 0 },
    ];

    const stmt = db.prepare(`
      INSERT INTO sites (id, name, desc, icon, category, url_internal, url_external, tags, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const insertAll = db.transaction((items: SiteInput[]) => {
      for (const s of items) {
        stmt.run(s.id, s.name, s.desc, s.icon, s.category, s.url_internal, s.url_external, JSON.stringify(s.tags || []), s.sort_order ?? 0);
      }
    });

    insertAll(seeds);
  }
}
