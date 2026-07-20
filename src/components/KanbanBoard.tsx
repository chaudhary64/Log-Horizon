"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import styles from "./kanban.module.css";
import Column from "./Column";
import AddLinkForm from "./AddLinkForm";

interface Task {
  _id: string;
  url: string;
  category: string;
  previewImage?: string;
  previewTitle?: string;
  previewDescription?: string;
}

const CATEGORIES = ["Inbox", "YouTube", "Reading List", "Done"];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddTask = async (url: string, category: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [...prev, data.task]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
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
          order: destination.index // Simplistic ordering, might need refinement for complex cases
        }),
      });
    } catch (err) {
      console.error("Failed to update task", err);
      // Revert in real app
    }
  };

  // Group tasks by category
  const tasksByCategory: Record<string, Task[]> = {};
  CATEGORIES.forEach((cat) => (tasksByCategory[cat] = []));
  tasks.forEach((task) => {
    if (tasksByCategory[task.category]) {
      tasksByCategory[task.category].push(task);
    } else {
      tasksByCategory["Inbox"].push(task);
    }
  });

  return (
    <div className={styles.mainContent}>
      <AddLinkForm onAdd={handleAddTask} />
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading board...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {CATEGORIES.map((category) => (
              <Column
                key={category}
                id={category}
                title={category}
                tasks={tasksByCategory[category]}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
