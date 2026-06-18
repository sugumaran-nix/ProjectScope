import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Quadrant } from "./Quadrant";
import { TaskCard } from "./TaskCard";
import { useTaskContext } from "../store/TaskContext";
import { QUADRANTS } from "../types";
import type { Task, QuadrantId } from "../types";

// ─── Matrix ───────────────────────────────────────────────────────────────────
//
// Root layout component. Reads from TaskContext (single hook instance shared
// with App) — avoids a second localStorage subscription.
//
// Responsibilities:
//   1. dnd-kit sensor setup (pointer + keyboard for a11y)
//   2. Track the "active" dragged task for DragOverlay ghost rendering
//   3. On DragEnd, resolve target quadrant and call moveTask
//   4. Render the responsive 2×2 grid
// ─────────────────────────────────────────────────────────────────────────────

export const Matrix: React.FC = () => {
  const { tasks, addTask, moveTask, toggleComplete, deleteTask, getTasksByQuadrant } =
    useTaskContext();

  // ── Ghost card state ──
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // ── Sensors ──────────────────────────────────────────────────────────────
  //
  // PointerSensor: 8 px activation distance prevents accidental drags on
  //   checkbox/delete clicks.
  // KeyboardSensor: Space to pick up, arrow keys to move, Space/Enter to
  //   drop, Escape to cancel — full keyboard DnD.
  // ─────────────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Drag handlers ────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const found = tasks.find((t) => t.id === event.active.id);
    setActiveTask(found ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const draggedId = active.id as string;
    const quadrantIds: string[] = QUADRANTS.map((q) => q.id);

    // Resolve target quadrant: over.id is either a quadrant id or a task id.
    let targetQuadrantId: QuadrantId;

    if (quadrantIds.includes(over.id as string)) {
      targetQuadrantId = over.id as QuadrantId;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      targetQuadrantId = overTask.quadrantId;
    }

    const draggedTask = tasks.find((t) => t.id === draggedId);
    if (draggedTask && draggedTask.quadrantId !== targetQuadrantId) {
      moveTask(draggedId, targetQuadrantId);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* 2×2 grid — stacks to single column on mobile */}
      <main
        aria-label="Eisenhower Matrix"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
      >
        {QUADRANTS.map((quadrant) => (
          <Quadrant
            key={quadrant.id}
            meta={quadrant}
            tasks={getTasksByQuadrant(quadrant.id)}
            onAddTask={addTask}
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
          />
        ))}
      </main>

      {/*
        DragOverlay lives outside the quadrant tree so it is never clipped
        by overflow:hidden on the list containers.
      */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105">
            <TaskCard
              task={activeTask}
              onToggleComplete={() => { /* overlay is decorative only */ }}
              onDelete={() => { /* overlay is decorative only */ }}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
