"use client";

import { useState, useCallback, useRef } from "react";
import type { SiteData } from "@/lib/types";
import { getIcon, getIconUrl, commonIcons } from "@/lib/icons";
import {
  createSiteAction,
  updateSiteAction,
  deleteSiteAction,
  fetchFaviconAction,
  uploadIconAction,
} from "@/app/dash/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Save, AlertTriangle, ChevronRight, ImageDown, Upload, X } from "lucide-react";

interface SiteFormData {
  name: string;
  desc: string;
  icon: string;
  icon_url: string;
  category: string;
  url_internal: string;
  url_external: string;
  sort_order: number;
}

const emptyForm: SiteFormData = {
  name: "",
  desc: "",
  icon: "Globe",
  icon_url: "",
  category: "",
  url_internal: "",
  url_external: "",
  sort_order: 0,
};

export function AdminSites({
  sites,
  categories,
}: {
  sites: SiteData[];
  categories: string[];
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [form, setForm] = useState<SiteFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingIcon, setFetchingIcon] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const openCreate = () => {
    setEditingSite(null);
    setForm({ ...emptyForm, category: categories[0] || "" });
    setEditDialogOpen(true);
  };

  const openEdit = (site: SiteData) => {
    setEditingSite(site.id);
    setForm({
      name: site.name,
      desc: site.desc,
      icon: site.icon,
      icon_url: site.icon_url,
      category: site.category,
      url_internal: site.url.internal,
      url_external: site.url.external,
      sort_order: site.sort_order,
    });
    setEditDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const data = {
        name: form.name,
        desc: form.desc,
        icon: form.icon,
        icon_url: form.icon_url,
        category: form.category,
        url_internal: form.url_internal,
        url_external: form.url_external,
        sort_order: form.sort_order,
      };

      const result = editingSite
        ? await updateSiteAction(editingSite, data)
        : await createSiteAction(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(editingSite ? "站点已更新" : "站点已创建");
      setEditDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }, [form, editingSite, setEditDialogOpen]);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const result = await deleteSiteAction(deletingId);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("站点已删除");
      }
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  }, [deletingId]);

  const updateField = (field: keyof SiteFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const deletingSiteName = sites.find((s) => s.id === deletingId)?.name;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{sites.length} 个站点</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          添加站点
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
          暂无站点，点击上方按钮添加
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(
            sites.reduce<Record<string, SiteData[]>>((acc, s) => {
              (acc[s.category] ??= []).push(s);
              return acc;
            }, {})
          ).map(([category, group]) => {
            const isOpen = !collapsed.has(category);
            return (
              <div key={category} className="overflow-hidden rounded-lg border">
                <button
                  type="button"
                  onClick={() => toggleGroup(category)}
                  className="flex w-full items-center gap-2 bg-muted/30 px-3.5 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="text-xs font-medium">{category}</span>
                  <span className="text-[10px] text-muted-foreground/50">{group.length}</span>
                </button>
                {isOpen && (
                  <div>
                    {group.map((site, i) => {
                      const Icon = getIcon(site.icon);
                      return (
                        <div
                          key={site.id}
                          className={`group flex items-center gap-3 px-3.5 py-2 transition-colors hover:bg-accent/20 ${
                            i !== group.length - 1 ? "border-b" : ""
                          }`}
                        >
                          {site.icon_url ? (
                            <img src={getIconUrl(site.icon_url)} alt="" className="size-4 shrink-0 rounded object-contain" />
                          ) : (
                            <Icon className="size-3.5 shrink-0 text-muted-foreground/60" />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-sm">{site.name}</span>
                            {site.desc && (
                              <span className="ml-2 text-[11px] text-muted-foreground/50">{site.desc}</span>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(site)}>
                              <Pencil className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-destructive/60 hover:text-destructive" onClick={() => confirmDelete(site.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 编辑/创建站点弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[calc(100%-3rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSite ? "编辑站点" : "添加站点"}</DialogTitle>
            <DialogDescription>
              {editingSite ? "修改站点信息" : "填写站点信息以添加到导航"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* 名称 + 图标 */}
            <div className="flex items-center gap-2">
              {form.icon_url ? (
                <button
                  type="button"
                  onClick={() => updateField("icon_url", "")}
                  className="group relative size-8 shrink-0 overflow-hidden rounded-lg border"
                  title="点击移除自定义图标"
                >
                  <img src={getIconUrl(form.icon_url)} alt="" className="size-full object-contain p-1" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="size-3 text-white" />
                  </div>
                </button>
              ) : (
              <Select value={form.icon} onValueChange={(v) => updateField("icon", v)}>
                <SelectTrigger className="size-8 shrink-0 items-center justify-center gap-0 p-0 [&>svg:last-child]:hidden">
                  {(() => { const Ic = getIcon(form.icon); return <Ic className="size-4" />; })()}
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" className="max-h-52 w-auto min-w-0">
                  <div className="grid grid-cols-6 gap-0.5 p-1">
                    {commonIcons.map((name) => {
                      const Ic = getIcon(name);
                      return (
                        <SelectItem key={name} value={name} className="flex size-8 items-center justify-center rounded-md p-0 pr-0 pl-0 data-[state=checked]:bg-accent [&>span:first-child]:hidden">
                          <Ic className="size-4" />
                        </SelectItem>
                      );
                    })}
                  </div>
                </SelectContent>
              </Select>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingIcon(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const result = await uploadIconAction(fd);
                    if (result.success) {
                      updateField("icon_url", result.data!);
                      toast.success("图标上传成功");
                    } else {
                      toast.error(result.error);
                    }
                  } finally {
                    setUploadingIcon(false);
                    e.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                disabled={uploadingIcon}
                onClick={() => fileInputRef.current?.click()}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-40"
                title="上传图标"
              >
                {uploadingIcon ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              </button>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="站点名称"
                className="h-8 flex-1"
              />
            </div>

            {/* 描述 */}
            <div>
              <Input
                value={form.desc}
                onChange={(e) => updateField("desc", e.target.value)}
                placeholder="简短描述（可选）"
                className="h-8"
              />
            </div>

            {/* 分类 */}
            <div>
              <Label className="mb-2 block text-[11px] text-muted-foreground">分类</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateField("category", cat)}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      form.category === cat
                        ? "border-foreground/20 bg-foreground text-background"
                        : "border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateField("category", "")}
                  className={`rounded-md border border-dashed px-2.5 py-1 text-xs transition-colors ${
                    !categories.includes(form.category)
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border text-muted-foreground/50 hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  +自定义
                </button>
              </div>
              {!categories.includes(form.category) && (
                <Input
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="输入新分类名"
                  className="mt-2 h-7 text-xs"
                  autoFocus
                />
              )}
            </div>

            {/* 地址 */}
            <div className="rounded-lg border bg-muted/20 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-medium text-muted-foreground">访问地址 <span className="text-muted-foreground/40">至少填一个</span></div>
                <button
                  type="button"
                  disabled={fetchingIcon || (!form.url_internal && !form.url_external)}
                  onClick={async () => {
                    const url = form.url_external || form.url_internal;
                    if (!url) return;
                    setFetchingIcon(true);
                    try {
                      const result = await fetchFaviconAction(url);
                      if (result.success) {
                        updateField("icon_url", result.data!);
                        toast.success("图标获取成功");
                      } else {
                        toast.error(result.error);
                      }
                    } finally {
                      setFetchingIcon(false);
                    }
                  }}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
                >
                  {fetchingIcon ? <Loader2 className="size-3 animate-spin" /> : <ImageDown className="size-3" />}
                  获取图标
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center text-[10px] text-muted-foreground">内</span>
                  <Input
                    value={form.url_internal}
                    onChange={(e) => updateField("url_internal", e.target.value)}
                    placeholder="http://192.168.1.x:port"
                    className="h-7 flex-1 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center text-[10px] text-muted-foreground">外</span>
                  <Input
                    value={form.url_external}
                    onChange={(e) => updateField("url_external", e.target.value)}
                    placeholder="https://service.example.com"
                    className="h-7 flex-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-[11px] text-muted-foreground">排序</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)}
                className="h-7 w-16 text-xs"
              />
              <span className="text-[10px] text-muted-foreground/40">越小越靠前</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" size="sm" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.name || !form.category}
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {editingSite ? "保存" : "创建"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除站点确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              确认删除
            </DialogTitle>
            <DialogDescription>
              确定要删除「{deletingSiteName}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
