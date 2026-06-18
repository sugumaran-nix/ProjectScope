import React from "react";
import { TaskProvider, useTaskContext } from "./store/TaskContext";
import { Matrix } from "./components/Matrix";

// ─── StatPill ─────────────────────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: number; accent: string }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${accent}`} aria-hidden="true" />
    <span className="text-xs text-slate-500 font-medium">
      <span className="text-slate-800 font-bold">{value}</span> {label}
    </span>
  </div>
);

// ─── AppShell ─────────────────────────────────────────────────────────────────
//
// Rendered inside TaskProvider so it can read from the shared task context.
// ─────────────────────────────────────────────────────────────────────────────

function AppShell() {
  const { tasks } = useTaskContext();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                ProjectScope
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Eisenhower Matrix
              </p>
            </div>
          </div>

          {/* Stats — hidden on xs, shown from sm */}
          <div className="hidden sm:flex items-center gap-4 divide-x divide-slate-100">
            <StatPill label="pending" value={pending} accent="bg-indigo-400" />
            <div className="pl-4">
              <StatPill label="done" value={completed} accent="bg-emerald-400" />
            </div>
            <div className="pl-4">
              <StatPill label="total" value={total} accent="bg-slate-300" />
            </div>
          </div>

          {/* Hint — hidden below md */}
          <div className="hidden md:block text-[10px] text-slate-300 font-mono">
            drag · drop · ↵ to add
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Your Priority Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Drag tasks between quadrants. Click the circle to mark complete.
          </p>
        </div>

        {/* Axis labels — desktop only */}
        <div className="hidden md:grid grid-cols-2 gap-6 mb-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-400">
            ↑ Urgent
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
            Not Urgent ↑
          </p>
        </div>

        <Matrix />

        <div className="hidden md:grid grid-cols-2 gap-6 mt-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
            ↓ Urgent
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Not Urgent ↓
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-16 py-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-300 font-medium">
          ProjectScope · All data stored locally in your browser
        </p>
      </footer>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
//
// TaskProvider wraps the whole tree so useTasks() runs exactly once.
// Both AppShell (stats) and Matrix (DnD) read from the same context instance.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <TaskProvider>
      <AppShell />
    </TaskProvider>
  );
}
