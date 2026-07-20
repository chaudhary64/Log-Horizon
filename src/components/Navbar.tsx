import Link from "next/link";
import { LogOut } from "lucide-react";
import styles from "./kanban.module.css";
import CommandPalette from "./CommandPalette";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  createdAt: string;
}

interface NavbarProps {
  isLoggedIn: boolean;
  tasks?: Task[];
}

export default function Navbar({ isLoggedIn, tasks = [] }: NavbarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.headerTitle} style={{ textDecoration: 'none' }}>
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
        </Link>
        
        {isLoggedIn && <CommandPalette tasks={tasks} />}
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link href="/board" className={styles.loginBtn}>
                Board
              </Link>
              <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
                <button type="submit" className={styles.logoutButton}>
                  <LogOut size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>
                Login
              </Link>
              <Link href="/login" className={styles.signupBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
