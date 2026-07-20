"use client";

import { useRef } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./kanban.module.css";
import TaskCard from "./TaskCard";

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

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string) => void;
}

export default function Column({ id, title, tasks, onDeleteTask, onMoveTask }: ColumnProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Roughly one card + gap
      scrollContainerRef.current.scrollBy({ 
        left: direction === "left" ? -scrollAmount : scrollAmount, 
        behavior: "smooth" 
      });
    }
  };

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h2 className={styles.columnTitle}>
          {title}
          <span className={styles.taskCount}>Total items: {tasks.length}</span>
        </h2>
        
        <div className={styles.scrollControls}>
          <button onClick={() => scroll("left")} className={styles.scrollBtn} aria-label="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll("right")} className={styles.scrollBtn} aria-label="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <Droppable droppableId={id} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              scrollContainerRef.current = el;
            }}
            {...provided.droppableProps}
            className={`${styles.columnList} ${snapshot.isDraggingOver ? styles.draggingOver : ""}`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                index={index} 
                onDelete={onDeleteTask} 
                onMove={onMoveTask} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
