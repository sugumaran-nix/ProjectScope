import { useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Task, QuadrantId, PersistedState } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "projectscope_v1";
const SCHEMA_VERSION = 1;

const EMPTY_STATE: PersistedState = {
  tasks: [],
  version: SCHEMA_VERSION,
};

/** Stable helper — defined outside the hook so it never changes reference. */
const nowISO = () => new Date().toISOString();

// ─── useTasks ─────────────────────────────────────────────────────────────────
//
// Single source of truth for all task data.
// Call this hook ONCE and distribute state via TaskContext — never call it
// in multiple components, which would create independent localStorage listeners.
// ─────────────────────────────────────────────────────────────────────────────

export function useTasks() {
  const [state, setState] = useLocalStorage<PersistedState>(
    STORAGE_KEY,
    EMPTY_STATE
  );

  const tasks = state.tasks;

  // ── CRUD ─────────────────────────────────────────────────────────────────

  /** Add a new task. Returns the new task's id. */
  const addTask = useCallback(
    (
      title: string,
      quadrantId: QuadrantId,
      opts?: Partial<Pick<Task, "description" | "dueDate" | "tags">>
    ): string => {
      const task: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        quadrantId,
        completed: false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        ...opts,
      };
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
      return task.id;
    },
    [setState]
  );

  /** Move a task to a different quadrant (drag-and-drop). */
  const moveTask = useCallback(
    (taskId: string, targetQuadrant: QuadrantId) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? { ...t, quadrantId: targetQuadrant, updatedAt: nowISO() }
            : t
        ),
      }));
    },
    [setState]
  );

  /** Toggle the completed flag. */
  const toggleComplete = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, updatedAt: nowISO() }
            : t
        ),
      }));
    },
    [setState]
  );

  /** Patch mutable fields on an existing task. */
  const updateTask = useCallback(
    (
      taskId: string,
      patch: Partial<Pick<Task, "title" | "description" | "dueDate" | "tags">>
    ) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, ...patch, updatedAt: nowISO() } : t
        ),
      }));
    },
    [setState]
  );

  /** Permanently delete a task. */
  const deleteTask = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }));
    },
    [setState]
  );

  /** Return all tasks belonging to a specific quadrant. */
  const getTasksByQuadrant = useCallback(
    (quadrantId: QuadrantId) => tasks.filter((t) => t.quadrantId === quadrantId),
    [tasks]
  );

  return {
    tasks,
    addTask,
    moveTask,
    toggleComplete,
    updateTask,
    deleteTask,
    getTasksByQuadrant,
  };
}

export type TaskStore = ReturnType<typeof useTasks>;
