import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

interface SiteRow {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name, e.g. "HardDrive"
  icon_url: string; // favicon filename in data/icons/
  category: string;
  url_internal: string;
  url_external: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SiteInput {
  id?: string;
  name: string;
  desc: string;
  icon: string;
  icon_url?: string;
  category: string;
  url_internal: string;
  url_external: string;
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
      icon_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 配置表
  _db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);

  // 热键表
  _db.exec(`
    CREATE TABLE IF NOT EXISTS shortcuts (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      site_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    )
  `);

  return _db;
}

// 热键操作
export interface ShortcutRow {
  id: string;
  key: string;
  site_id: string;
  created_at: string;
}

export function getAllShortcuts(): ShortcutRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM shortcuts ORDER BY created_at").all() as ShortcutRow[];
}

export function createShortcut(key: string, siteId: string): ShortcutRow {
  const db = getDb();
  const id = genId();
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T');
  db.prepare("INSERT INTO shortcuts (id, key, site_id, created_at) VALUES (?, ?, ?, ?)").run(id, key.toUpperCase(), siteId, now);
  return db.prepare("SELECT * FROM shortcuts WHERE id = ?").get(id) as ShortcutRow;
}

export function deleteShortcut(id: string): boolean {
  const db = getDb();
  return db.prepare("DELETE FROM shortcuts WHERE id = ?").run(id).changes > 0;
}

// 配置操作
export interface SiteConfig {
  site_name: string;
  site_description: string;
  footer_text: string;
  auto_detect_network: string;
  admin_password: string;
  admin_session: string;
}

const defaultConfig: SiteConfig = {
  site_name: "HomeDir",
  site_description: "快速访问内外网服务的导航中心",
  footer_text: "© 2026 Lxcloud · Powered by <a href=\"https://github.com/52Lxcloud/HomeDir\">HomeDir</a>",
  auto_detect_network: "false",
  admin_password: "",
  admin_session: "",
};

export function getConfig(): SiteConfig {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM config").all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    site_name: map.get("site_name") || defaultConfig.site_name,
    site_description: map.get("site_description") || defaultConfig.site_description,
    footer_text: map.get("footer_text") || defaultConfig.footer_text,
    auto_detect_network: map.get("auto_detect_network") ?? defaultConfig.auto_detect_network,
    admin_password: map.get("admin_password") || "",
    admin_session: map.get("admin_session") || "",
  };
}

export function updateConfig(updates: Record<string, string>): void {
  const db = getDb();
  const stmt = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
  const run = db.transaction((entries: [string, string][]) => {
    for (const [k, v] of entries) stmt.run(k, v);
  });
  run(Object.entries(updates) as [string, string][]);
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
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T');

  db.prepare(`
    INSERT INTO sites (id, name, desc, icon, icon_url, category, url_internal, url_external, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name,
    input.desc,
    input.icon,
    input.icon_url || '',
    input.category,
    input.url_internal,
    input.url_external,
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

  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T');
  db.prepare(`
    UPDATE sites SET
      name = ?, desc = ?, icon = ?, icon_url = ?, category = ?,
      url_internal = ?, url_external = ?,
      sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    input.name ?? existing.name,
    input.desc ?? existing.desc,
    input.icon ?? existing.icon,
    input.icon_url ?? existing.icon_url,
    input.category ?? existing.category,
    input.url_internal ?? existing.url_internal,
    input.url_external ?? existing.url_external,
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

// 分类操作
export function renameCategory(oldName: string, newName: string): number {
  const db = getDb();
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace(' ', 'T');
  const result = db.prepare("UPDATE sites SET category = ?, updated_at = ? WHERE category = ?").run(newName, now, oldName);
  return result.changes;
}

export function deleteCategory(name: string): number {
  const db = getDb();
  const result = db.prepare("DELETE FROM sites WHERE category = ?").run(name);
  return result.changes;
}

