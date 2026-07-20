"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import styles from "./commandPalette.module.css";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
  createdAt: string;
}

interface CommandPaletteProps {
  tasks: Task[];
}

export default function CommandPalette({ tasks }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector(`.${styles.selected}`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const searchString = `${task.previewTitle || ""} ${task.url} ${task.previewDescription || ""} ${task.category}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTasks.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredTasks.length > 0 && query.length > 0) {
      e.preventDefault();
      window.open(filteredTasks[selectedIndex].url, "_blank");
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const showResults = isFocused && query.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search (Cmd + K)"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showResults && (
        <div className={styles.results} ref={resultsRef}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>No results found for "{query}"</div>
          ) : (
            filteredTasks.map((task, index) => {
              let domain = "";
              try {
                domain = new URL(task.url).hostname.replace("www.", "");
              } catch (e) {
                domain = task.url;
              }

              return (
                <a
                  key={task._id}
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ""}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.resultTitle}>
                    {task.previewTitle || task.url}
                    <span className={styles.categoryBadge}>{task.category}</span>
                  </div>
                  <div className={styles.resultUrl}>{domain}</div>
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
