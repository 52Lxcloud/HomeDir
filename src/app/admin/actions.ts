"use server";

import { revalidatePath } from "next/cache";
import { createSite, updateSite, deleteSite } from "@/lib/db";

interface SiteFormInput {
  name: string;
  desc: string;
  icon: string;
  category: string;
  url_internal: string;
  url_external: string;
  tags: string[];
  sort_order: number;
}

type ActionResult = { success: true } | { success: false; error: string };

function validate(data: SiteFormInput): string | null {
  if (!data.name || data.name.trim().length === 0) return "名称不能为空";
  if (data.name.length > 100) return "名称不能超过 100 个字符";
  if (!data.category || data.category.trim().length === 0) return "分类不能为空";
  if (!data.url_internal && !data.url_external) return "至少填写一个地址";
  return null;
}

export async function createSiteAction(formData: SiteFormInput): Promise<ActionResult> {
  const error = validate(formData);
  if (error) return { success: false, error };

  try {
    createSite(formData);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("创建站点失败:", e);
    return { success: false, error: "创建站点失败" };
  }
}

export async function updateSiteAction(id: string, formData: SiteFormInput): Promise<ActionResult> {
  if (!id) return { success: false, error: "站点 ID 不能为空" };

  const error = validate(formData);
  if (error) return { success: false, error };

  try {
    const result = updateSite(id, formData);
    if (!result) return { success: false, error: "站点不存在" };
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("更新站点失败:", e);
    return { success: false, error: "更新站点失败" };
  }
}

export async function deleteSiteAction(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "站点 ID 不能为空" };

  try {
    const ok = deleteSite(id);
    if (!ok) return { success: false, error: "站点不存在" };
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("删除站点失败:", e);
    return { success: false, error: "删除站点失败" };
  }
}
