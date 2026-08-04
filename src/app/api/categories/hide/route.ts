import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { getUserCategoryState, normalizeCategoryName } from "@/lib/categories";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, hidden } = await req.json();
    const categoryName = normalizeCategoryName(name);

    if (!categoryName) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    await connectToDatabase();
    const userDoc = await User.findById(user.userId);
    if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { categories } = getUserCategoryState(userDoc);

    if (!categories.includes(categoryName)) {
      return NextResponse.json({ error: `Column '${categoryName}' does not exist.` }, { status: 404 });
    }

    const hiddenCategories = Array.isArray(userDoc.hiddenCategories)
      ? [...userDoc.hiddenCategories]
      : [];

    if (hidden) {
      if (!hiddenCategories.includes(categoryName)) {
        hiddenCategories.push(categoryName);
      }
    } else {
      const index = hiddenCategories.indexOf(categoryName);
      if (index !== -1) hiddenCategories.splice(index, 1);
    }

    userDoc.hiddenCategories = hiddenCategories;
    userDoc.markModified("hiddenCategories");
    await userDoc.save();

    return NextResponse.json({ categories, hiddenCategories: userDoc.hiddenCategories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
