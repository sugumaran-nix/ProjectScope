import React, { createContext, useContext } from "react";
import { useTasks } from "./useTasks";

// ─── TaskContext ──────────────────────────────────────────────────────────────
//
// Wraps useTasks() in a React Context so the hook is called ONCE at the App
// level. All child components (Matrix, Quadrant, App stats bar) share the
// same state instance — no duplicate localStorage subscriptions.
//
// Usage:
//   1. Wrap your tree:  <TaskProvider> … </TaskProvider>
//   2. Consume anywhere: const store = useTaskContext();
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStore = ReturnType<typeof useTasks>;

const TaskContext = createContext<TaskStore | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useTasks();
  return <TaskContext.Provider value={store}>{children}</TaskContext.Provider>;
};

export function useTaskContext(): TaskStore {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used inside <TaskProvider>");
  }
  return ctx;
}
