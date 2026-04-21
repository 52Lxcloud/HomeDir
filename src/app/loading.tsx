export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* 标题骨架 */}
      <header className="mb-8 flex items-center gap-2.5">
        <div className="size-7 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </header>

      {/* 工具栏骨架 */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
      </div>

      {/* 分类标签骨架 */}
      <div className="mb-6 flex justify-center">
        <div className="h-9 w-64 animate-pulse rounded-2xl bg-muted" />
      </div>

      {/* 站点网格骨架 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted sm:h-[72px]" />
        ))}
      </div>
    </div>
  );
}
