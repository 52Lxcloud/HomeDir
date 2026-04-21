"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <AlertCircle className="size-8 text-destructive" />
      <div className="text-center">
        <h2 className="text-sm font-semibold">出错了</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {error.message || "发生了意外错误"}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        重试
      </Button>
    </div>
  );
}
