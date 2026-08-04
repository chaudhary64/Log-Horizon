import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const tasks = await Task.find({ userId: user.userId }).sort({
      category: 1,
      order: 1,
    });

    const data = tasks.map((t) => ({
      url: t.url,
      category: t.category,
      order: t.order,
      previewImage: t.previewImage || "",
      previewTitle: t.previewTitle || "",
      previewDescription: t.previewDescription || "",
      createdAt: t.createdAt ? t.createdAt.toISOString() : null,
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      app: "log-horizon",
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
