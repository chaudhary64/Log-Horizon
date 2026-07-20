"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./kanban.module.css";
import { Plus } from "lucide-react";

interface AddLinkFormProps {
  onAdd: (url: string, category: string, customTitle?: string) => void;
}

export default function AddLinkForm({ onAdd }: AddLinkFormProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

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
    setError("");
    try {
      await onAdd(url, category, customTitle.trim());
      setUrl("");
      setCategory("");
      setCustomTitle("");
      urlInputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to add link");
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
          <option value="Blog Tutorial">Blog Tutorial</option>
          <option value="CodePen">CodePen</option>
          <option value="Codrops 3d Articles">Codrops 3d Articles</option>
          <option value="Codrops Articles">Codrops Articles</option>
          <option value="Decoded Websites">Decoded Websites</option>
          <option value="YouTube">YouTube</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className={styles.submitButton} disabled={loading} aria-label="Add link to board">
          <Plus size={20} aria-hidden="true" />
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>
      {error && <div style={{ color: "var(--danger)", fontSize: "0.875rem", marginTop: "0.5rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{error}</div>}
    </div>
  );
}
