"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Globe, Server } from "lucide-react";

export function NetworkToggle({
  defaultInternal,
  onToggle,
}: {
  defaultInternal: boolean;
  onToggle: (isInternal: boolean) => void;
}) {
  const [isInternal, setIsInternal] = useState(defaultInternal);
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next = !isInternal;
    setIsInternal(next);
    document.cookie = `network-mode=${next ? "internal" : "external"};path=/;max-age=${60 * 60 * 24 * 365}`;
    toast(next ? "已切换到内网模式" : "已切换到外网模式", {
      icon: next ? <Server className="size-4" /> : <Globe className="size-4" />,
    });
    startTransition(() => onToggle(next));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={toggle}
    >
      {isInternal ? <Server className="size-3.5" /> : <Globe className="size-3.5" />}
    </Button>
  );
}
