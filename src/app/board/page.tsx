import KanbanBoard from "@/components/kanban/KanbanBoard";
import { getUserFromCookie } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserCategoryState } from "@/lib/categories";
import { redirect } from "next/navigation";

export default async function BoardPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  await connectToDatabase();
  const userDoc = await User.findById(user.userId);

  const { categories, hiddenCategories } = getUserCategoryState(userDoc ?? {});

  return (
    <main>
      <KanbanBoard categories={categories} hiddenCategories={hiddenCategories} />
    </main>
  );
}
