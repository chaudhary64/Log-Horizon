"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../../kanban/kanban.module.css";
import { Link2, FolderInput } from "lucide-react";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

interface MoveConfirmModalProps {
  task: Task;
  categories: string[];
  onConfirm: (newCategory: string) => void;
  onCancel: () => void;
}

export default function MoveConfirmModal({ task, categories, onConfirm, onCancel }: MoveConfirmModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(task.category);
  const [imageError, setImageError] = useState(false);
  const moveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    moveBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.modalOverlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <FolderInput color="var(--primary)" size={24} />
          <h2 id="modal-title" className={styles.modalTitle}>Move Link?</h2>
        </div>
        
        <p className={styles.modalText}>
          Select a new category for this link:
        </p>
        
        <select
          className={styles.categorySelect}
          style={{ width: "100%", marginBottom: "1.5rem" }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Select new category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className={styles.modalPreviewCard}>
          {task.previewImage && !imageError ? (
            <img 
              src={task.previewImage} 
              alt="Preview" 
              className={styles.modalPreviewImage} 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.modalNoPreview}>
              <Link2 size={32} />
            </div>
          )}
          <div className={styles.modalTaskContent}>
            <h3 className={styles.modalTaskTitle}>
              {task.previewTitle || task.url}
            </h3>
            <div className={styles.modalTaskDomain}>
              <Link2 size={12} />
              {task.url}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            className={styles.modalCancelButton} 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={styles.modalMoveButton} 
            onClick={() => onConfirm(selectedCategory)}
            ref={moveBtnRef}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
