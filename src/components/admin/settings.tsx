"use client";

import { useState, useCallback } from "react";
import { updateConfigAction } from "@/app/dash/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

export function AdminSettings({ config }: { config: { site_name: string; site_description: string; footer_text: string; auto_detect_network: string } }) {
  const [form, setForm] = useState({
    site_name: config.site_name,
    site_description: config.site_description,
    footer_text: config.footer_text,
    auto_detect_network: config.auto_detect_network,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!form.site_name.trim()) { toast.error("站点名称不能为空"); return; }
    if (!form.site_description.trim()) { toast.error("站点描述不能为空"); return; }
    setSaving(true);
    try {
      const { auto_detect_network: _, ...basicConfig } = form;
      const result = await updateConfigAction(basicConfig);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("配置已保存");
    } finally { setSaving(false); }
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 text-sm font-medium">基本设置</div>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="cfg_name">站点名称</Label>
            <Input
              id="cfg_name"
              value={form.site_name}
              onChange={(e) => setForm((p) => ({ ...p, site_name: e.target.value }))}
              required
            />
            <p className="text-[11px] text-muted-foreground">页面标题</p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cfg_desc">站点描述</Label>
            <Input
              id="cfg_desc"
              value={form.site_description}
              onChange={(e) => setForm((p) => ({ ...p, site_description: e.target.value }))}
              required
            />
            <p className="text-[11px] text-muted-foreground">SEO描述</p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cfg_footer">页脚文字</Label>
            <Input
              id="cfg_footer"
              value={form.footer_text}
              onChange={(e) => setForm((p) => ({ ...p, footer_text: e.target.value }))}
            />
            <p className="text-[11px] text-muted-foreground">支持 HTML，留空则不显示</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            保存配置
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 text-sm font-medium">功能配置</div>
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label>自动探测网络</Label>
              <p className="text-[11px] text-muted-foreground">自动检测内外网并切换访问地址</p>
            </div>
            <Switch
              checked={form.auto_detect_network === "true"}
              onCheckedChange={async (v) => {
                const val = v ? "true" : "false";
                setForm((p) => ({ ...p, auto_detect_network: val }));
                const result = await updateConfigAction({ auto_detect_network: val });
                if (result.success) toast.success(v ? "已开启自动探测" : "已关闭自动探测");
                else toast.error(result.error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
