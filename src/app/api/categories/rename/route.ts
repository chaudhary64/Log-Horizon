import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import { getUserFromCookie } from "@/lib/auth";
import {
  DEFAULT_CATEGORIES,
  isValidCategoryName,
  normalizeCategoryName,
} from "@/lib/categories";

export async function PUT(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { oldName, newName } = await req.json();
    const fromName = normalizeCategoryName(oldName);
    const toName = normalizeCategoryName(newName);

    if (!isValidCategoryName(toName) || !fromName) {
      return NextResponse.json(
        { error: "Both category names are required (max 40 characters)." },
        { status: 400 }
      );
    }

    if (fromName === toName) {
      return NextResponse.json({ error: "New name must be different from the current name." }, { status: 400 });
    }

    await connectToDatabase();
    const userDoc = await User.findById(user.userId);
    if (!userDoc) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const categories = Array.isArray(userDoc.categories) && userDoc.categories.length
      ? userDoc.categories
      : [...DEFAULT_CATEGORIES];

    if (!categories.includes(fromName)) {
      return NextResponse.json({ error: `Column '${fromName}' does not exist.` }, { status: 404 });
    }

    if (categories.some((c: string) => c !== fromName && c.toLowerCase() === toName.toLowerCase())) {
      return NextResponse.json({ error: `A column named '${toName}' already exists.` }, { status: 409 });
    }

    userDoc.categories = categories.map((c: string) => (c === fromName ? toName : c));
    userDoc.hiddenCategories = (userDoc.hiddenCategories || []).map((c: string) =>
      c === fromName ? toName : c
    );

    const aliases: Record<string, string> =
      userDoc.categoryAliases && typeof userDoc.categoryAliases === "object"
        ? { ...userDoc.categoryAliases }
        : {};

    for (const [key, value] of Object.entries(aliases)) {
      if (value === fromName) aliases[key] = toName;
    }
    if (DEFAULT_CATEGORIES.includes(fromName)) {
      aliases[fromName] = toName;
    }

    userDoc.categoryAliases = aliases;
    userDoc.markModified("categories");
    userDoc.markModified("hiddenCategories");
    userDoc.markModified("categoryAliases");
    await userDoc.save();

    await Task.updateMany({ userId: user.userId, category: fromName }, { $set: { category: toName } });

    return NextResponse.json({
      categories: userDoc.categories,
      hiddenCategories: userDoc.hiddenCategories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
