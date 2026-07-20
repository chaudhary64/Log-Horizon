import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { getUserFromCookie } from "@/lib/auth";
import { getLinkPreview } from "link-preview-js";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const tasks = await Task.find({ userId: user.userId }).sort({ order: 1 });
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url, category } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Auto-categorize YouTube links if no explicit category is provided
    let finalCategory = category || "Inbox";
    if (!category && (url.includes("youtube.com") || url.includes("youtu.be"))) {
      finalCategory = "YouTube";
    }

    // Fetch link preview
    let previewImage = "";
    let previewTitle = "";
    let previewDescription = "";

    try {
      const previewData: any = await getLinkPreview(url);
      if (previewData) {
        previewTitle = previewData.title || "";
        previewDescription = previewData.description || "";
        if (previewData.images && previewData.images.length > 0) {
          previewImage = previewData.images[0];
        }
      }
    } catch (err) {
      console.error("Error fetching link preview", err);
    }

    await connectToDatabase();

    const maxOrderTask = await Task.findOne({ userId: user.userId, category: finalCategory }).sort("-order");
    const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const newTask = new Task({
      url,
      category: finalCategory,
      previewImage,
      previewTitle,
      previewDescription,
      order: newOrder,
      userId: user.userId,
    });

    await newTask.save();
    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
