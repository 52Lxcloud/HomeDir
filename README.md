# HomeDir

个人服务导航页。分类筛选、⌘K 搜索、内外网切换、后台管理。

## 技术栈

Next.js 16 / Tailwind CSS v4 / shadcn/ui / SQLite (better-sqlite3) / Lucide React

## 使用

```bash
pnpm install
pnpm dev
```

首次启动自动创建 `data/sites.db`。访问 `/admin` 管理站点。

## 部署

```bash
pnpm build
node .next/standalone/server.js
```

standalone 模式，挂载 `data/` 目录持久化数据库。

## License

MIT
