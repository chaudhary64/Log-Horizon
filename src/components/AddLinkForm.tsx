"use client";

import { useState } from "react";
import styles from "./kanban.module.css";
import { Plus } from "lucide-react";

interface AddLinkFormProps {
  onAdd: (url: string, category: string) => void;
}

export default function AddLinkForm({ onAdd }: AddLinkFormProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      await onAdd(url, category);
      setUrl("");
      setCategory("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Add New Link</h2>
      <form onSubmit={handleSubmit} className={styles.formInputGroup}>
        <input
          type="url"
          className={styles.urlInput}
          placeholder="Paste URL here (e.g., https://youtube.com/...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <select
          className={styles.categorySelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Auto-Detect / Inbox</option>
          <option value="Inbox">Inbox</option>
          <option value="YouTube">YouTube</option>
          <option value="Reading List">Reading List</option>
          <option value="Done">Done</option>
        </select>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          <Plus size={20} />
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>
    </div>
  );
}
