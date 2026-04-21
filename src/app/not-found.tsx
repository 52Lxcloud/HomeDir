import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="size-8 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-sm font-semibold">页面不存在</h2>
        <p className="mt-1 text-xs text-muted-foreground">找不到请求的页面</p>
      </div>
      <a
        href="/"
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        返回首页
      </a>
    </div>
  );
}
