import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import {
  MAX_CATEGORIES,
  getUserCategoryState,
  isValidCategoryName,
  normalizeCategoryName,
} from "@/lib/categories";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userDoc = await User.findById(user.userId);

    if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(getUserCategoryState(userDoc));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    const categoryName = normalizeCategoryName(name);

    if (!isValidCategoryName(categoryName)) {
      return NextResponse.json({ error: "Category name is required (max 40 characters)." }, { status: 400 });
    }

    await connectToDatabase();
    const userDoc = await User.findById(user.userId);
    if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { categories } = getUserCategoryState(userDoc);

    if (categories.some((c: string) => c.toLowerCase() === categoryName.toLowerCase())) {
      return NextResponse.json({ error: `A column named '${categoryName}' already exists.` }, { status: 409 });
    }

    if (categories.length >= MAX_CATEGORIES) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_CATEGORIES} columns.` },
        { status: 400 }
      );
    }

    userDoc.categories = [...categories, categoryName];
    userDoc.markModified("categories");
    await userDoc.save();

    return NextResponse.json(getUserCategoryState(userDoc), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
