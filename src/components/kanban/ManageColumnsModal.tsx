"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./kanban.module.css";
import { Check, Eye, EyeOff, Pencil, Plus, SlidersHorizontal, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface ManageColumnsModalProps {
  categories: string[];
  hiddenCategories: string[];
  onAdd: (name: string) => Promise<void>;
  onRename: (oldName: string, newName: string) => Promise<void>;
  onToggleHidden: (name: string, hidden: boolean) => Promise<void>;
  onClose: () => void;
}

export default function ManageColumnsModal({
  categories,
  hiddenCategories,
  onAdd,
  onRename,
  onToggleHidden,
  onClose,
}: ManageColumnsModalProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busy, setBusy] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    addInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      await onAdd(name);
      setNewName("");
      addInputRef.current?.focus();
    } catch (err) {
      toast.error("Add Column Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAdding(false);
    }
  };

  const startRename = (name: string) => {
    setEditing(name);
    setEditValue(name);
  };

  const saveRename = async (oldName: string) => {
    const name = editValue.trim();
    if (!name || name === oldName) {
      setEditing(null);
      return;
    }
    setBusy(true);
    try {
      await onRename(oldName, name);
      setEditing(null);
    } catch (err) {
      toast.error("Rename Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const toggleHidden = async (name: string, hidden: boolean) => {
    setBusy(true);
    try {
      await onToggleHidden(name, hidden);
    } catch (err) {
      toast.error("Update Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="manage-columns-title">
      <div className={`${styles.modalContent} ${styles.manageColumnsContent}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <SlidersHorizontal color="var(--primary)" size={24} />
          <h2 id="manage-columns-title" className={styles.modalTitle}>Manage Columns</h2>
        </div>

        <form onSubmit={handleAdd} className={styles.manageAddRow}>
          <input
            ref={addInputRef}
            type="text"
            className={styles.urlInput}
            placeholder="New column name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="New column name"
          />
          <button type="submit" className={styles.submitButton} disabled={adding || !newName.trim()}>
            <Plus size={16} />
            Add
          </button>
        </form>

        <ul className={styles.manageList}>
          {categories.map((cat) => {
            const hidden = hiddenCategories.includes(cat);
            const isEditing = editing === cat;
            return (
              <li
                key={cat}
                className={`${styles.manageRow} ${hidden ? styles.manageRowHidden : ""}`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.urlInput}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(cat);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    aria-label={`Rename ${cat}`}
                  />
                ) : (
                  <span className={styles.manageRowName}>{cat}</span>
                )}

                <div className={styles.manageRowActions}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className={styles.manageIconBtn}
                        onClick={() => saveRename(cat)}
                        disabled={busy || !editValue.trim()}
                        title="Save name"
                        aria-label={`Save name for ${cat}`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.manageIconBtn}
                        onClick={() => setEditing(null)}
                        disabled={busy}
                        title="Cancel rename"
                        aria-label="Cancel rename"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.manageIconBtn}
                        onClick={() => startRename(cat)}
                        disabled={busy}
                        title="Rename column"
                        aria-label={`Rename ${cat}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.manageIconBtn}
                        onClick={() => toggleHidden(cat, !hidden)}
                        disabled={busy}
                        title={hidden ? "Show column" : "Hide column"}
                        aria-label={hidden ? `Show ${cat}` : `Hide ${cat}`}
                      >
                        {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelButton} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
