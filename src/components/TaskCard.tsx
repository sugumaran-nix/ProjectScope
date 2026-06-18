import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

// ─── Icons (inline SVG, no extra dependency) ─────────────────────────────────

const GripIcon = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    aria-hidden="true"
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    aria-hidden="true"
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── TaskCard ─────────────────────────────────────────────────────────────────

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // ── dnd-kit sortable setup ──
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    setIsDeleting(true);
    // Small delay so the user sees the button press before it vanishes.
    setTimeout(() => onDelete(task.id), 150);
  };

  // Format dueDate for display.
  const formattedDue = task.dueDate
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
        new Date(task.dueDate + "T00:00:00") // force local midnight
      )
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      aria-label={`Task: ${task.title}${task.completed ? " (completed)" : ""}`}
      className={[
        "group relative bg-white rounded-xl ring-1 ring-slate-200",
        "p-3.5 flex items-start gap-3",
        "hover:shadow-md hover:-translate-y-0.5",
        "transition-all duration-200 ease-out",
        isDragging ? "opacity-50 shadow-lg scale-105 cursor-grabbing" : "cursor-default",
        isDeleting ? "opacity-0 scale-95" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Drag handle ── */}
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder: ${task.title}`}
        className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
      >
        <GripIcon />
      </button>

      {/* ── Checkbox ── */}
      <button
        onClick={() => onToggleComplete(task.id)}
        aria-pressed={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        className={[
          "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          task.completed
            ? "bg-emerald-500 border-emerald-500"
            : "border-slate-300 hover:border-indigo-400",
        ].join(" ")}
      >
        {task.completed && (
          <svg
            aria-hidden="true"
            className="w-3 h-3 text-white m-auto"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-sm font-medium leading-snug break-words",
            task.completed ? "line-through text-slate-400" : "text-slate-700",
          ].join(" ")}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags + due date row */}
        {(formattedDue || (task.tags && task.tags.length > 0)) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {formattedDue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <CalendarIcon />
                {formattedDue}
              </span>
            )}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete button (visible on hover) ── */}
      <button
        onClick={handleDelete}
        aria-label={`Delete task: ${task.title}`}
        className={[
          "flex-shrink-0 p-1 rounded-md text-slate-300",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "hover:text-rose-500 hover:bg-rose-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
          "transition-all duration-150",
        ].join(" ")}
      >
        <TrashIcon />
      </button>
    </div>
  );
};
