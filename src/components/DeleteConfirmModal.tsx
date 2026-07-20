"use client";

import { useEffect, useRef } from "react";
import styles from "./kanban.module.css";
import { Link2, AlertTriangle } from "lucide-react";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

interface DeleteConfirmModalProps {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ task, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the delete button by default on mount
    deleteBtnRef.current?.focus();

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
          <AlertTriangle color="var(--danger)" size={24} />
          <h2 id="modal-title" className={styles.modalTitle}>Delete Link?</h2>
        </div>
        
        <p className={styles.modalText}>
          Are you sure you want to delete this link? This action cannot be undone.
        </p>

        <div className={styles.modalPreviewCard}>
          {task.previewImage ? (
            <img src={task.previewImage} alt="Preview" className={styles.modalPreviewImage} />
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
            className={styles.modalDeleteButton} 
            onClick={onConfirm}
            ref={deleteBtnRef}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
