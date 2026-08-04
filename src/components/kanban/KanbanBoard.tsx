"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { SlidersHorizontal } from "lucide-react";
import styles from "./kanban.module.css";
import Navbar from "../layout/Navbar";
import Column from "./Column";
import AddLinkForm from "./AddLinkForm";
import DeleteConfirmModal from "../ui/modals/DeleteConfirmModal";
import MoveConfirmModal from "../ui/modals/MoveConfirmModal";
import ManageColumnsModal from "./ManageColumnsModal";
import { useToast } from "@/contexts/ToastContext";

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

interface KanbanBoardProps {
  categories: string[];
  hiddenCategories: string[];
}

export default function KanbanBoard({ categories: initialCategories, hiddenCategories: initialHiddenCategories }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(initialHiddenCategories);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToMove, setTaskToMove] = useState<Task | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const toast = useToast();

  const visibleCategories = categories.filter((cat) => !hiddenCategories.includes(cat));

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

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 0);
    return () => clearTimeout(timer);
  }, []);

  const syncCategoryState = (data: { categories?: string[]; hiddenCategories?: string[] }) => {
    if (Array.isArray(data.categories)) {
      setCategories(data.categories);
    }
    if (Array.isArray(data.hiddenCategories)) {
      setHiddenCategories(data.hiddenCategories);
    }
  };

  const handleAddCategory = async (name: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add column");
    syncCategoryState(data);
    toast.success("Column Added", `Created the '${name}' column.`);
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const res = await fetch("/api/categories/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldName, newName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to rename column");
    syncCategoryState(data);
    setTasks((prev) =>
      prev.map((t) => (t.category === oldName ? { ...t, category: newName } : t))
    );
    if (activeFilter === oldName) setActiveFilter(newName);
    toast.success("Column Renamed", `'${oldName}' is now '${newName}'.`);
  };

  const handleToggleHidden = async (name: string, hidden: boolean) => {
    const res = await fetch("/api/categories/hide", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hidden }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update column");
    syncCategoryState(data);
    if (hidden && activeFilter === name) setActiveFilter(null);
    toast.info(hidden ? "Column Hidden" : "Column Shown", `'${name}' is ${hidden ? "now hidden" : "visible again"}.`);
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
        return data.task.category;
      }
    } catch (err) {
      console.error(err);
      throw err instanceof Error ? err : new Error("Failed to add task");
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
      toast.info("Link Deleted", "The link has been removed from your board.");
    } catch (err) {
      console.error(err);
      toast.error("Delete Failed", err instanceof Error ? err.message : "Failed to delete the link");
    }
  };

  const handleMoveClick = (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (task) {
      setTaskToMove(task);
    }
  };

  const confirmMove = async (newCategory: string) => {
    if (!taskToMove) return;
    
    if (taskToMove.category === newCategory) {
      setTaskToMove(null);
      return;
    }

    const id = taskToMove._id;
    const oldCategory = taskToMove.category;
    
    setTasks(prev => prev.map(t => t._id === id ? { ...t, category: newCategory } : t));
    setTaskToMove(null);
    
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      if (!res.ok) throw new Error("Failed to move task");
      toast.success("Link Moved", `Successfully moved to ${newCategory}`);
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.map(t => t._id === id ? { ...t, category: oldCategory } : t));
      toast.error("Move Failed", err instanceof Error ? err.message : "Failed to move the link");
    }
  };

  const handleMoveToTop = async (id: string) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;

    const categoryTasks = tasks
      .filter((t) => t.category === task.category)
      .sort((a, b) => a.order - b.order);

    if (categoryTasks[0]?._id === id) return;

    const reorderedCategory = [task, ...categoryTasks.filter((t) => t._id !== id)];
    const bulkUpdates: { _id: string; category: string; order: number }[] =
      reorderedCategory.map((t, i) => ({ _id: t._id, category: t.category, order: i }));

    setTasks((prev) => {
      const idx = prev.findIndex((t) => t._id === id);
      if (idx === -1) return prev;
      const moved = prev[idx];
      const rest = prev.filter((t) => t._id !== id);
      const firstOfCategory = rest.findIndex((t) => t.category === moved.category);
      const insertAt = firstOfCategory === -1 ? rest.length : firstOfCategory;
      const next = [...rest];
      next.splice(insertAt, 0, moved);
      return next;
    });

    try {
      const res = await fetch(`/api/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: bulkUpdates }),
      });
      if (!res.ok) {
        throw new Error("Failed to save new order");
      }
      toast.success("Moved to Top", `${task.previewTitle || "Link"} is now first in ${task.category}.`);
    } catch (err) {
      console.error("Failed to move to top", err);
      toast.error("Move Failed", err instanceof Error ? err.message : "Failed to update link order");
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

    const updatedTasks = Array.from(tasks);
    const draggedTaskIndex = updatedTasks.findIndex((t) => t._id === draggableId);
    if (draggedTaskIndex === -1) return;

    const [draggedTask] = updatedTasks.splice(draggedTaskIndex, 1);
    
    if (source.droppableId !== destination.droppableId) {
      draggedTask.category = destination.droppableId;
    }

    const destinationTasks = updatedTasks.filter((t) => t.category === destination.droppableId);
    
    if (destination.index === 0) {
       const firstDestTask = updatedTasks.findIndex((t) => t.category === destination.droppableId);
       if(firstDestTask !== -1) {
         updatedTasks.splice(firstDestTask, 0, draggedTask);
       } else {
         updatedTasks.push(draggedTask);
       }
    } else {
       const taskBeforeDest = destinationTasks[destination.index - 1];
       if (taskBeforeDest) {
         const insertIndex = updatedTasks.findIndex((t) => t._id === taskBeforeDest._id);
         updatedTasks.splice(insertIndex + 1, 0, draggedTask);
       } else {
         updatedTasks.push(draggedTask);
       }
    }

    const affectedCategories = new Set([source.droppableId, destination.droppableId]);
    const bulkUpdates: { _id: string; category: string; order: number }[] = [];

    affectedCategories.forEach(cat => {
      let currentOrder = 0;
      updatedTasks.forEach(t => {
        if (t.category === cat) {
          t.order = currentOrder;
          bulkUpdates.push({ _id: t._id, category: t.category, order: currentOrder });
          currentOrder++;
        }
      });
    });

    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: bulkUpdates }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to save new order");
      }
      
      toast.success("Order Saved", "Link order has been successfully updated");
    } catch (err) {
      console.error("Failed to update tasks", err);
      toast.error("Save Failed", err instanceof Error ? err.message : "Failed to update link order");
    }
  };

  const tasksByCategory: Record<string, Task[]> = {};
  categories.forEach((cat) => (tasksByCategory[cat] = []));
  tasksByCategory["Other"] = tasksByCategory["Other"] || [];
  tasks.forEach((task) => {
    if (tasksByCategory[task.category]) {
      tasksByCategory[task.category].push(task);
    } else {
      tasksByCategory["Other"].push(task);
    }
  });

  const visibleWithTasks = visibleCategories.filter(
    (category) => tasksByCategory[category].length > 0
  );

  return (
    <>
      <Navbar isLoggedIn={true} tasks={tasks} />

      <div className={styles.pageWrapper}>
        <div className={styles.mainContent}>
      <AddLinkForm onAdd={handleAddTask} categories={visibleCategories} />
      
      <div className={styles.boardToolbar}>
        <button className={styles.manageColumnsBtn} onClick={() => setManageOpen(true)}>
          <SlidersHorizontal size={16} />
          Manage Columns
        </button>
      </div>
      
      {!loading && (
        <div className={styles.statsContainer}>
          <div 
            className={`${styles.statBadge} ${styles.total} ${activeFilter === null ? styles.active : ''}`}
            onClick={() => setActiveFilter(null)}
          >
            Total Links
            <span className={styles.statNumber}>{tasks.length}</span>
          </div>
          {visibleCategories.map(category => {
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
      ) : visibleWithTasks.length === 0 ? (
        <div className={styles.emptyBoard}>
          <p>No visible columns yet. Add a link or manage your columns.</p>
          <button className={styles.manageColumnsBtn} onClick={() => setManageOpen(true)}>
            <SlidersHorizontal size={16} />
            Manage Columns
          </button>
        </div>
      ) : (
        <DragDropContext 
          onDragStart={() => document.body.classList.add('is-dragging')}
          onDragEnd={(result) => {
            document.body.classList.remove('is-dragging');
            onDragEnd(result);
          }}
        >
          <div className={styles.board}>
            {(activeFilter ? [activeFilter] : visibleWithTasks).map((category) => (
              <Column
                key={category}
                id={category}
                title={category}
                tasks={tasksByCategory[category]}
                onDeleteTask={handleDeleteClick}
                onMoveTask={handleMoveClick}
                onMoveToTopTask={handleMoveToTop}
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

      {taskToMove && (
        <MoveConfirmModal
          task={taskToMove}
          categories={visibleCategories}
          onConfirm={confirmMove}
          onCancel={() => setTaskToMove(null)}
        />
      )}

      {manageOpen && (
        <ManageColumnsModal
          categories={categories}
          hiddenCategories={hiddenCategories}
          onAdd={handleAddCategory}
          onRename={handleRenameCategory}
          onToggleHidden={handleToggleHidden}
          onClose={() => setManageOpen(false)}
        />
      )}
    </div>
  </div>
</>
  );
}
