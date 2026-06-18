import React, { useState, useRef, useEffect } from "react";
import type { QuadrantId } from "../types";

interface AddTaskFormProps {
  quadrantId: QuadrantId;
  onAdd: (title: string, quadrantId: QuadrantId) => void;
}

// ─── AddTaskForm ──────────────────────────────────────────────────────────────
//
// Inline form that appears within a quadrant when the user clicks "+ Add task".
// Submits on Enter, dismisses on Escape or blur (if empty).
// ─────────────────────────────────────────────────────────────────────────────

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ quadrantId, onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the form opens.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, quadrantId);
    setTitle("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setTitle("");
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Close form on blur only if no content was typed.
    if (!title.trim()) setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label={`Add a task to this quadrant`}
        className={[
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg",
          "text-sm font-medium text-slate-400",
          "hover:bg-slate-50 hover:text-indigo-600",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          "transition-colors duration-150 group",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 group-hover:border-indigo-400 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-2.5 h-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
        Add task
      </button>
    );
  }

  return (
    <div
      role="form"
      aria-label="New task form"
      className="rounded-xl ring-1 ring-indigo-300 bg-white p-3 shadow-sm"
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="What needs to be done?"
        aria-label="Task title"
        maxLength={200}
        className={[
          "w-full text-sm text-slate-700 placeholder-slate-300",
          "focus:outline-none bg-transparent",
        ].join(" ")}
      />
      <div className="mt-2.5 flex items-center gap-2">
        <button
          onMouseDown={(e) => {
            // Prevent blur from firing before click.
            e.preventDefault();
            handleSubmit();
          }}
          disabled={!title.trim()}
          aria-label="Save task"
          className={[
            "px-3 py-1 rounded-md text-xs font-semibold",
            "bg-indigo-600 text-white",
            "hover:bg-indigo-700 active:bg-indigo-800",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            "transition-colors",
          ].join(" ")}
        >
          Save
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setTitle("");
            setIsOpen(false);
          }}
          aria-label="Cancel adding task"
          className={[
            "px-3 py-1 rounded-md text-xs font-medium text-slate-500",
            "hover:bg-slate-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
            "transition-colors",
          ].join(" ")}
        >
          Cancel
        </button>
        <span className="ml-auto text-[10px] text-slate-300">↵ to save · Esc to close</span>
      </div>
    </div>
  );
};
