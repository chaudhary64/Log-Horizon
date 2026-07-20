import KanbanBoard from "@/components/kanban/KanbanBoard";
import { LogOut } from "lucide-react";
import styles from "@/components/kanban/kanban.module.css";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BoardPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return (
    <main>

      
      <KanbanBoard />
    </main>
  );
}
