"use client";

import { Draggable } from "@hello-pangea/dnd";
import styles from "./kanban.module.css";
import { Link2, Trash2 } from "lucide-react";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, index, onDelete }: TaskCardProps) {
  // Extract domain for display
  let domain = "";
  try {
    domain = new URL(task.url).hostname.replace("www.", "");
  } catch (e) {
    domain = task.url;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete(task._id);
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={styles.taskCard}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <button className={styles.deleteButton} onClick={handleDelete} title="Delete Task">
            <Trash2 size={14} />
          </button>
          
          <div className={styles.cardNumber}>
            {index + 1}
          </div>
          
          <a href={task.url} target="_blank" rel="noopener noreferrer">
            {task.previewImage ? (
              <img src={task.previewImage} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.noPreview}>
                <Link2 size={32} />
              </div>
            )}
            <div className={styles.taskContent}>
              <h3 className={styles.taskTitle}>
                {task.previewTitle || task.url}
              </h3>
              <div className={styles.taskDomain}>
                <Link2 size={12} />
                {domain}
              </div>
            </div>
          </a>
        </div>
      )}
    </Draggable>
  );
}
