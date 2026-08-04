import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { getUserFromCookie } from "@/lib/auth";

const DEFAULT_CATEGORY = "Other";
const MAX_IMPORT_ITEMS = 10000;

interface NormalizedTask {
  url: string;
  category: string;
  order?: number;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  createdAt?: Date;
}

interface ImportDoc {
  url: string;
  category: string;
  order: number;
  previewImage: string;
  previewTitle: string;
  previewDescription: string;
  userId: string;
  createdAt?: Date;
}

const normalizeUrl = (raw: unknown): string => {
  let url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return "";
  if (!/^https?:\/\//i.test(url) && !/\s/.test(url) && url.includes(".")) {
    url = `https://${url}`;
  }
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
};

const duplicateKey = (url: string): string => url.toLowerCase().replace(/\/+$/, "");

const normalizeTasks = (payload: unknown): { tasks: NormalizedTask[]; invalid: number } => {
  let rawItems: unknown[] = [];
  if (payload && typeof payload === "object" && Array.isArray((payload as { tasks: unknown[] }).tasks)) {
    rawItems = (payload as { tasks: unknown[] }).tasks;
  } else if (Array.isArray(payload)) {
    rawItems = payload;
  } else {
    return { tasks: [], invalid: 0 };
  }

  const tasks: NormalizedTask[] = [];
  let invalid = 0;

  for (const item of rawItems) {
    if (typeof item === "string") {
      const url = normalizeUrl(item);
      if (!url) {
        invalid++;
        continue;
      }
      tasks.push({ url, category: DEFAULT_CATEGORY });
      continue;
    }

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const url = normalizeUrl(obj.url);
      if (!url) {
        invalid++;
        continue;
      }
      const category =
        typeof obj.category === "string" && obj.category.trim()
          ? obj.category.trim()
          : DEFAULT_CATEGORY;
      const order =
        typeof obj.order === "number" && Number.isFinite(obj.order) ? obj.order : undefined;

      const createdAt =
        typeof obj.createdAt === "string" && !Number.isNaN(Date.parse(obj.createdAt))
          ? new Date(obj.createdAt)
          : undefined;

      tasks.push({
        url,
        category,
        order,
        previewImage: typeof obj.previewImage === "string" ? obj.previewImage : undefined,
        previewTitle: typeof obj.previewTitle === "string" ? obj.previewTitle : undefined,
        previewDescription:
          typeof obj.previewDescription === "string" ? obj.previewDescription : undefined,
        createdAt,
      });
      continue;
    }

    invalid++;
  }

  return { tasks, invalid };
};

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dryRun = new URL(req.url).searchParams.get("dryRun") === "true";

    const body = await req.json().catch(() => null);
    const { tasks: rawTasks, invalid } = normalizeTasks(body);

    if (rawTasks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No links found in the file. Expected a Log Horizon export (.json) or a list of URLs (.txt).",
        },
        { status: 400 }
      );
    }

    if (rawTasks.length > MAX_IMPORT_ITEMS) {
      return NextResponse.json(
        { error: `File too large: max ${MAX_IMPORT_ITEMS} links per import.` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingTasks = await Task.find({ userId: user.userId }).select("url category order");
    const existingUrls = new Set(existingTasks.map((t) => duplicateKey(t.url || "")));

    const seen = new Set<string>();
    const newTasks: NormalizedTask[] = [];
    const duplicates: { url: string; category: string }[] = [];

    for (const t of rawTasks) {
      const key = duplicateKey(t.url);
      if (existingUrls.has(key) || seen.has(key)) {
        duplicates.push({ url: t.url, category: t.category });
        continue;
      }
      seen.add(key);
      newTasks.push(t);
    }

    const catMap = new Map<string, number>();
    newTasks.forEach((t) => catMap.set(t.category, (catMap.get(t.category) || 0) + 1));
    const byCategory = [...catMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const analysis = {
      total: rawTasks.length,
      invalid,
      newCount: newTasks.length,
      duplicateCount: duplicates.length,
      byCategory,
      duplicates: duplicates.slice(0, 25),
    };

    if (dryRun) {
      return NextResponse.json({ dryRun: true, analysis });
    }

    if (newTasks.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        duplicates: duplicates.length,
        invalid,
        analysis,
      });
    }

    const maxOrderByCategory = new Map<string, number>();
    existingTasks.forEach((t) => {
      const cur = maxOrderByCategory.get(t.category) ?? -1;
      if ((t.order ?? 0) > cur) maxOrderByCategory.set(t.category, t.order ?? 0);
    });

    const tasksByCategory = new Map<string, NormalizedTask[]>();
    newTasks.forEach((t) => {
      const list = tasksByCategory.get(t.category) ?? [];
      list.push(t);
      tasksByCategory.set(t.category, list);
    });

    const docs: ImportDoc[] = [];
    tasksByCategory.forEach((list, category) => {
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      let order = (maxOrderByCategory.get(category) ?? -1) + 1;
      list.forEach((t) => {
        docs.push({
          url: t.url,
          category,
          order,
          previewImage: t.previewImage || "",
          previewTitle: t.previewTitle || "",
          previewDescription: t.previewDescription || "",
          userId: user.userId,
          createdAt: t.createdAt,
        });
        order++;
      });
    });

    const inserted = await Task.insertMany(docs);

    return NextResponse.json({
      success: true,
      imported: inserted.length,
      duplicates: duplicates.length,
      invalid,
      analysis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
