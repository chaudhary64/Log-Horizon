import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { getUserFromCookie } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { updates } = await req.json();
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();

    // Perform a bulkWrite to update all tasks in a single operation
    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: update._id, userId: user.userId },
        update: { $set: { category: update.category, order: update.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
