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

    const { url, category, title } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check for duplicates
    const existingTask = await Task.findOne({ userId: user.userId, url });
    if (existingTask) {
      return NextResponse.json({ error: `This link already exists in the '${existingTask.category}' column!` }, { status: 409 });
    }

    // Auto-categorize links if no explicit category is provided
    let finalCategory = category || "Other";
    if (!category) {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        finalCategory = "YouTube";
      } else if (lowerUrl.includes("codepen.io")) {
        finalCategory = "CodePen";
      } else if (lowerUrl.includes("tympanus.net") || lowerUrl.includes("codrops")) {
        // Default to Codrops Articles, but detect 3d if possible
        if (lowerUrl.includes("3d")) {
          finalCategory = "Codrops 3d Articles";
        } else {
          finalCategory = "Codrops Articles";
        }
      } else if (lowerUrl.includes("blog") || lowerUrl.includes("tutorial") || lowerUrl.includes("medium.com") || lowerUrl.includes("dev.to") || lowerUrl.includes("hashnode")) {
        finalCategory = "Blog Tutorial";
      }
    }

    // Fetch link preview
    let previewImage = "";
    let previewTitle = title || ""; // Use user-provided custom title if available
    let previewDescription = "";

    try {
      const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
      const isCodePen = url.includes("codepen.io");

      if (isYouTube) {
        // Use YouTube oEmbed API which never blocks bots
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          previewTitle = previewTitle || data.title || "";
          previewImage = data.thumbnail_url || "";
          previewDescription = data.author_name ? `By ${data.author_name}` : "";
        }
      } else if (isCodePen) {
        // Bypass Cloudflare by manually constructing the CodePen metadata
        const codepenMatch = url.match(/codepen\.io\/([^/]+)\/(?:pen|full|details)\/([^/?]+)/i);
        if (codepenMatch) {
          const username = codepenMatch[1];
          const penId = codepenMatch[2];
          previewTitle = previewTitle || `CodePen by ${username}`; // Fallback if custom title not provided
          previewImage = `https://shots.codepen.io/${username}/pen/${penId}-800.jpg`;
          previewDescription = "View on CodePen";
        }
      } 
      
      // Fallback for non-YouTube/non-CodePen links, or if we still need an image/description
      if (!previewTitle || !previewImage) {
        const previewData: any = await getLinkPreview(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
          }
        });
        if (previewData) {
          previewTitle = previewTitle || previewData.title || "";
          previewDescription = previewDescription || previewData.description || "";
          if (!previewImage && previewData.images && previewData.images.length > 0) {
            previewImage = previewData.images[0];
          }
        }
      }
    } catch (err) {
      console.error("Error fetching link preview", err);
    }

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
