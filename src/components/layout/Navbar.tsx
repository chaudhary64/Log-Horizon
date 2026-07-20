"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import styles from "../kanban/kanban.module.css";
import CommandPalette from "./CommandPalette";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  createdAt: string;
  order: number;
}

interface NavbarProps {
  isLoggedIn: boolean;
  tasks?: Task[];
}

export default function Navbar({ isLoggedIn, tasks = [] }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.headerTitle} style={{ textDecoration: 'none' }}>
          <div className={styles.logoBox}>LH</div>
          LOG HORIZON
        </Link>
        
        <button 
          className={styles.hamburger} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        
        <div className={`${styles.navActions} ${isMenuOpen ? styles.navOpen : ''}`}>
          {isLoggedIn && (
            <div className={styles.commandWrapper}>
              <CommandPalette tasks={tasks} />
            </div>
          )}
          
          <div className={styles.authButtons}>
            {isLoggedIn ? (
              <>
                <Link href="/board" className={styles.loginBtn}>
                  Board
                </Link>
                <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
                  <button type="submit" className={styles.logoutButton}>
                    <LogOut size={18} />
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
      </div>
    </header>
  );
}
