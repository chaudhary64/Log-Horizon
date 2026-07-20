"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import styles from "./kanban.module.css";
import Column from "./Column";
import AddLinkForm from "./AddLinkForm";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

const CATEGORIES = [
  "Blog Tutorial",
  "CodePen",
  "Codrops 3d Articles",
  "Codrops Articles",
  "Decoded Websites",
  "YouTube",
  "Other"
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (url: string, category: string, customTitle?: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category, title: customTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add task");
      }
      if (data.task) {
        setTasks((prev) => [...prev, data.task]);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteClick = (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (task) {
      setTaskToDelete(task);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    const id = taskToDelete._id;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setTaskToDelete(null);
    
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Optimistically update UI
    const updatedTasks = Array.from(tasks);
    const draggedTaskIndex = updatedTasks.findIndex((t) => t._id === draggableId);
    if (draggedTaskIndex === -1) return;

    const [draggedTask] = updatedTasks.splice(draggedTaskIndex, 1);
    
    // Update category if moved to a different column
    if (source.droppableId !== destination.droppableId) {
      draggedTask.category = destination.droppableId;
    }

    // Find index to insert in the entire tasks array to maintain order relative to destination category
    const destinationTasks = updatedTasks.filter((t) => t.category === destination.droppableId);
    
    if (destination.index === 0) {
       // Insert at beginning of category
       const firstDestTask = updatedTasks.findIndex((t) => t.category === destination.droppableId);
       if(firstDestTask !== -1) {
         updatedTasks.splice(firstDestTask, 0, draggedTask);
       } else {
         updatedTasks.push(draggedTask);
       }
    } else {
       // Insert after the element at destination.index - 1
       const taskBeforeDest = destinationTasks[destination.index - 1];
       if (taskBeforeDest) {
         const insertIndex = updatedTasks.findIndex((t) => t._id === taskBeforeDest._id);
         updatedTasks.splice(insertIndex + 1, 0, draggedTask);
       } else {
         updatedTasks.push(draggedTask);
       }
    }

    setTasks(updatedTasks);

    // Persist to database
    try {
      await fetch(`/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: destination.droppableId, 
          order: destination.index
        }),
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // Group tasks by category
  const tasksByCategory: Record<string, Task[]> = {};
  CATEGORIES.forEach((cat) => (tasksByCategory[cat] = []));
  tasks.forEach((task) => {
    if (tasksByCategory[task.category]) {
      tasksByCategory[task.category].push(task);
    } else {
      tasksByCategory["Other"].push(task);
    }
  });

  return (
    <div className={styles.mainContent}>
      <AddLinkForm onAdd={handleAddTask} />
      
      {!loading && (
        <div className={styles.statsContainer}>
          <div 
            className={`${styles.statBadge} ${styles.total} ${activeFilter === null ? styles.active : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            Total Links
            <span className={styles.statNumber}>{tasks.length}</span>
          </div>
          {CATEGORIES.map(category => {
            const count = tasksByCategory[category]?.length || 0;
            if (count === 0) return null;
            return (
              <div 
                key={category} 
                className={`${styles.statBadge} ${activeFilter === category ? styles.active : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
                <span className={styles.statNumber}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading board...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {(activeFilter ? [activeFilter] : CATEGORIES.filter((category) => tasksByCategory[category].length > 0)).map((category) => (
              <Column
                key={category}
                id={category}
                title={category}
                tasks={tasksByCategory[category]}
                onDeleteTask={handleDeleteClick}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {taskToDelete && (
        <DeleteConfirmModal
          task={taskToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  );
}
