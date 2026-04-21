"use client";

import { useState, useCallback } from "react";
import type { SiteData } from "@/lib/types";
import { getIcon, commonIcons } from "@/lib/icons";
import { createSiteAction, updateSiteAction, deleteSiteAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
} from "lucide-react";

interface SiteFormData {
  name: string;
  desc: string;
  icon: string;
  category: string;
  url_internal: string;
  url_external: string;
  tags: string;
  sort_order: number;
}

const emptyForm: SiteFormData = {
  name: "",
  desc: "",
  icon: "Globe",
  category: "",
  url_internal: "",
  url_external: "",
  tags: "",
  sort_order: 0,
};

export function AdminPanel({
  sites,
  categories,
}: {
  sites: SiteData[];
  categories: string[];
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<string | null>(null);
  const [form, setForm] = useState<SiteFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openCreate = () => {
    setEditingSite(null);
    setForm(emptyForm);
    setEditDialogOpen(true);
  };

  const openEdit = (site: SiteData) => {
    setEditingSite(site.id);
    setForm({
      name: site.name,
      desc: site.desc,
      icon: site.icon,
      category: site.category,
      url_internal: site.url.internal,
      url_external: site.url.external,
      tags: site.tags.join(", "),
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
        category: form.category,
        url_internal: form.url_internal,
        url_external: form.url_external,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sort_order: form.sort_order,
      };

      const result = editingSite
        ? await updateSiteAction(editingSite, data)
        : await createSiteAction(data);

      if (!result.success) {
        alert(result.error);
        return;
      }

      setEditDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }, [form, editingSite]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("确认删除该站点？")) return;
    setDeleting(id);
    try {
      const result = await deleteSiteAction(id);
      if (!result.success) alert(result.error);
    } finally {
      setDeleting(null);
    }
  }, []);

  const updateField = (field: keyof SiteFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* 头部操作 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            共 {sites.length} 个站点，{categories.length} 个分类
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          添加站点
        </Button>
      </div>

      {/* 列表 */}
      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            暂无站点，点击上方按钮添加
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="hidden sm:table-cell">分类</TableHead>
                <TableHead className="hidden md:table-cell">描述</TableHead>
                <TableHead className="hidden lg:table-cell">标签</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => {
                const Icon = getIcon(site.icon);
                return (
                  <TableRow key={site.id}>
                    <TableCell>
                      <Icon className="size-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="text-[10px]">
                        {site.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {site.desc}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1">
                        {site.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => openEdit(site)}>
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDelete(site.id)}
                          disabled={deleting === site.id}
                        >
                          {deleting === site.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 编辑/创建弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSite ? "编辑站点" : "添加站点"}</DialogTitle>
            <DialogDescription>
              {editingSite ? "修改站点信息" : "填写站点信息以添加到导航"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="例如: Synology NAS"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="desc">描述</Label>
              <Input
                id="desc"
                value={form.desc}
                onChange={(e) => updateField("desc", e.target.value)}
                placeholder="简短描述"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>图标</Label>
                <Select value={form.icon} onValueChange={(v) => updateField("icon", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {commonIcons.map((name) => {
                      const Ic = getIcon(name);
                      return (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <Ic className="size-3.5" />
                            <span className="text-xs">{name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">分类</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="例如: 基础设施"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="url_internal">内网地址</Label>
              <Input
                id="url_internal"
                value={form.url_internal}
                onChange={(e) => updateField("url_internal", e.target.value)}
                placeholder="http://192.168.1.x:port"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="url_external">外网地址</Label>
              <Input
                id="url_external"
                value={form.url_external}
                onChange={(e) => updateField("url_external", e.target.value)}
                placeholder="https://service.example.com"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <Label htmlFor="tags">标签 (逗号分隔)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  placeholder="存储, 文件, nas"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
              <X className="size-3.5" />
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
    </>
  );
}
