// ─── Core Domain Types ───────────────────────────────────────────────────────

/**
 * The four quadrants of the Eisenhower Matrix.
 * Each maps to a combination of urgency and importance.
 */
export type QuadrantId =
  | "do"        // Urgent + Important   → Do First
  | "schedule"  // Not Urgent + Important → Schedule
  | "delegate"  // Urgent + Not Important → Delegate
  | "eliminate"; // Not Urgent + Not Important → Eliminate

/**
 * Priority level of a task, derived from its quadrant assignment.
 */
export type Priority = "high" | "medium" | "low" | "none";

/**
 * Core Task model. All fields are immutable after creation except
 * `quadrantId` (drag-and-drop), `completed`, and `updatedAt`.
 */
export interface Task {
  /** Unique identifier — generated via crypto.randomUUID() */
  id: string;
  /** Display label for the task */
  title: string;
  /** Optional longer description */
  description?: string;
  /** Which quadrant this task currently lives in */
  quadrantId: QuadrantId;
  /** Whether the task has been marked done */
  completed: boolean;
  /** ISO 8601 timestamp — set on creation, never changes */
  createdAt: string;
  /** ISO 8601 timestamp — updated on any mutation */
  updatedAt: string;
  /** Optional due date (ISO 8601 date string, e.g. "2025-12-31") */
  dueDate?: string;
  /** Optional tags for grouping / filtering */
  tags?: string[];
}

/**
 * Shape of the data persisted in localStorage under the app's key.
 */
export interface PersistedState {
  tasks: Task[];
  /** Schema version — increment if shape changes to trigger migration */
  version: number;
}

// ─── Quadrant Metadata ───────────────────────────────────────────────────────

export interface QuadrantMeta {
  id: QuadrantId;
  label: string;
  subtitle: string;
  /** Tailwind color tokens for the accent ring and header tint */
  accent: {
    /** e.g. "border-rose-400" */
    border: string;
    /** e.g. "bg-rose-50" */
    headerBg: string;
    /** e.g. "text-rose-700" */
    headerText: string;
    /** e.g. "bg-rose-100 text-rose-700" for the badge */
    badge: string;
  };
  /** Icon name (Heroicons outline) rendered next to the quadrant title */
  icon: "bolt" | "calendar" | "arrow-right" | "trash";
  emptyMessage: string;
}

/**
 * All four quadrant definitions in render order (top-left → top-right →
 * bottom-left → bottom-right).
 */
export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "do",
    label: "Do First",
    subtitle: "Urgent & Important",
    accent: {
      border: "border-rose-300",
      headerBg: "bg-rose-50",
      headerText: "text-rose-700",
      badge: "bg-rose-100 text-rose-700",
    },
    icon: "bolt",
    emptyMessage: "Nothing urgent right now — enjoy the calm.",
  },
  {
    id: "schedule",
    label: "Schedule",
    subtitle: "Important, Not Urgent",
    accent: {
      border: "border-indigo-300",
      headerBg: "bg-indigo-50",
      headerText: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-700",
    },
    icon: "calendar",
    emptyMessage: "No items planned. Add goals here.",
  },
  {
    id: "delegate",
    label: "Delegate",
    subtitle: "Urgent, Not Important",
    accent: {
      border: "border-amber-300",
      headerBg: "bg-amber-50",
      headerText: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
    icon: "arrow-right",
    emptyMessage: "Nothing to hand off. Good sign.",
  },
  {
    id: "eliminate",
    label: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    accent: {
      border: "border-slate-300",
      headerBg: "bg-slate-50",
      headerText: "text-slate-500",
      badge: "bg-slate-100 text-slate-500",
    },
    icon: "trash",
    emptyMessage: "Drop distractions here.",
  },
];
