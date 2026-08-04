"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./kanban.module.css";
import { Plus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface AddLinkFormProps {
  onAdd: (url: string, category: string, customTitle?: string) => Promise<string | undefined> | void;
  categories: string[];
}

export default function AddLinkForm({ onAdd, categories }: AddLinkFormProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    const handleFocus = () => {
      urlInputRef.current?.focus();
    };

    window.addEventListener("focus", handleFocus);
    
    // Initial focus on mount is handled by autoFocus prop, 
    // but this ensures it if we need to call it programmatically.
    handleFocus();

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setLoading(true);
    try {
      const addedCategory = await onAdd(url, category, customTitle.trim());
      setUrl("");
      setCategory("");
      setCustomTitle("");
      
      const categoryName = addedCategory || category || "the board";
      toast.success("Link Added", `Your link was successfully added to ${categoryName}.`);
      urlInputRef.current?.focus();
    } catch (err) {
      toast.error("Failed to add link", err instanceof Error ? err.message : "An error occurred while adding the link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Link</h2>
      <form onSubmit={handleSubmit} className={styles.formInputGroup} aria-label="Add a new link">
        <input
          ref={urlInputRef}
          type="url"
          className={styles.urlInput}
          placeholder="Paste URL here (e.g., https://youtube.com/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoFocus
          aria-label="Link URL"
        />
        <input
          type="text"
          className={styles.urlInput}
          placeholder="Custom Title (Optional)"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          aria-label="Custom Title"
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Select category"
        >
          <option value="">Auto-Detect</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button type="submit" className={styles.submitButton} disabled={loading} aria-label="Add link to board">
          <Plus size={20} aria-hidden="true" />
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>
    </div>
  );
}
