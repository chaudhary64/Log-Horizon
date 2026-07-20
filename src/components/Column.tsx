"use client";

import { Droppable } from "@hello-pangea/dnd";
import styles from "./kanban.module.css";
import TaskCard from "./TaskCard";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export default function Column({ id, title, tasks, onDeleteTask }: ColumnProps) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h2 className={styles.columnTitle}>
          {title}
          <span className={styles.taskCount}>{tasks.length}</span>
        </h2>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${styles.columnList} ${snapshot.isDraggingOver ? styles.draggingOver : ""}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
