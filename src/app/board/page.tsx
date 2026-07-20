import KanbanBoard from "@/components/KanbanBoard";
import { LogOut } from "lucide-react";
import styles from "@/components/kanban.module.css";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BoardPage() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return (
    <main>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <rect width="18" height="18" x="3" y="3" />
              <path d="M8 7v10" />
              <path d="M12 7v10" />
              <path d="M16 7v10" />
            </svg>
            LOG HORIZON
          </div>
          
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className={styles.logoutButton}>
              <LogOut size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Sign Out
            </button>
          </form>
        </div>
      </header>
      
      <KanbanBoard />
    </main>
  );
}
