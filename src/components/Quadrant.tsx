import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { AddTaskForm } from "./AddTaskForm";
import type { Task, QuadrantMeta } from "../types";

// ─── Icon map (inline SVG, no icon-font dependency) ──────────────────────────

const ICONS: Record<QuadrantMeta["icon"], React.FC<{ className: string }>> = {
  bolt: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  calendar: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  "arrow-right": ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  trash: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuadrantProps {
  meta: QuadrantMeta;
  tasks: Task[];
  onAddTask: (title: string, quadrantId: QuadrantMeta["id"]) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

// ─── Quadrant ─────────────────────────────────────────────────────────────────

export const Quadrant: React.FC<QuadrantProps> = ({
  meta,
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
}) => {
  // useDroppable registers this element as a valid drop target with dnd-kit.
  const { setNodeRef, isOver } = useDroppable({ id: meta.id });

  const IconComponent = ICONS[meta.icon];
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    // ── Outer card ──
    <section
      aria-label={`${meta.label} quadrant — ${meta.subtitle}`}
      className={[
        "flex flex-col rounded-2xl border-2 transition-all duration-200",
        meta.accent.border,
        // Highlight the drop zone when a drag is hovering over it.
        isOver ? "bg-indigo-50/60 shadow-inner" : "bg-white/80",
        "min-h-[320px]",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div
        className={[
          "flex items-start justify-between gap-2",
          "px-5 pt-5 pb-4 rounded-t-2xl",
          meta.accent.headerBg,
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={[
              "p-1.5 rounded-lg",
              meta.accent.badge,
            ].join(" ")}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-sm font-bold ${meta.accent.headerText}`}>
              {meta.label}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Task count badge */}
        {pendingCount > 0 && (
          <span
            aria-label={`${pendingCount} pending task${pendingCount !== 1 ? "s" : ""}`}
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.accent.badge}`}
          >
            {pendingCount}
          </span>
        )}
      </div>

      {/* ── Task list (droppable + sortable zone) ── */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 p-4 pt-3 overflow-y-auto"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            // Empty state guidance — never leave a quadrant blank.
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-xs text-slate-300 font-medium text-center leading-relaxed select-none">
                {meta.emptyMessage}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* ── Add Task Form ── */}
      <div className="px-4 pb-4">
        <AddTaskForm quadrantId={meta.id} onAdd={onAddTask} />
      </div>
    </section>
  );
};
