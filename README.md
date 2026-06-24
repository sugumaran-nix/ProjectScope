# ProjectScope — Eisenhower Matrix Task Manager

A professional-grade, frontend-only task manager built as a portfolio piece.
All data persists in `localStorage` — no backend, no sign-up, no network required..

---

## ✦ Live Features

| Feature | Implementation |
|---|---|
| 4-quadrant Eisenhower Matrix | `Quadrant` component × 4, driven by `QUADRANTS` config |
| Drag & drop between quadrants | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Keyboard-accessible DnD | `KeyboardSensor` with arrow-key navigation |
| Persistent state | `useLocalStorage` hook synced to `localStorage` |
| Cross-tab sync | `storage` event listener in `useLocalStorage` |
| Add / complete / delete tasks | Inline `AddTaskForm`, checkbox toggle, hover-reveal delete |
| Accessible UI | ARIA labels, `aria-pressed`, `role="form"`, focus rings |
| Responsive layout | 2-column grid → single-column stack on mobile |
| Empty-state guidance | Per-quadrant placeholder text |

---

## 🗂 Project Structure

```
projectscope/
├── public/
│   └── favicon.svg             # Inline SVG favicon (no external assets)
├── src/
│   ├── components/
│   │   ├── Matrix.tsx          # DndContext + 2×2 grid layout
│   │   ├── Quadrant.tsx        # Droppable container + SortableContext
│   │   ├── TaskCard.tsx        # Sortable card with drag handle
│   │   └── AddTaskForm.tsx     # Inline task creation form
│   ├── hooks/
│   │   └── useLocalStorage.ts  # Generic type-safe localStorage hook
│   ├── store/
│   │   └── useTasks.ts         # All task CRUD; single source of truth
│   ├── types/
│   │   └── index.ts            # Task, QuadrantId, QuadrantMeta, QUADRANTS[]
│   ├── App.tsx                 # Shell: header, stats bar, Matrix
│   ├── main.tsx                # ReactDOM.createRoot entry point
│   └── index.css               # Tailwind directives + Inter font
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── .eslintrc.cjs
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (or pnpm / yarn)

### 1. Install dependencies

```bash
npm install
```

This installs the full dependency tree including:

```
react, react-dom
@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
typescript, vite, @vitejs/plugin-react
tailwindcss, postcss, autoprefixer
```

### 2. Start the dev server

```bash
npm run dev
```

Opens at **http://localhost:5173** with hot-module replacement enabled.

### 3. Production build

```bash
npm run build       # type-checks then bundles to dist/
npm run preview     # locally preview the production build
```

The `dist/` folder is a fully static site — drop it on Vercel, Netlify,
GitHub Pages, or any CDN.

---

## 🧠 Architecture Deep-Dive

### State Flow

```
useLocalStorage (localStorage sync)
      ↓
   useTasks (CRUD operations)
      ↓
     App (stats derived from tasks[])
      ↓
   Matrix (DndContext, drag lifecycle)
      ↓
  Quadrant (SortableContext per quadrant)
      ↓
  TaskCard (useSortable per task)
```

There is **no Context or external state library** — `useTasks` is called once
at the `App` level and props are passed down. For a larger app, wrap `useTasks`
in a React Context to avoid prop-drilling.

### `useLocalStorage<T>` Hook

```ts
const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue);
```

- **Reads** from storage on first render via lazy `useState` initialiser.
- **Writes** via a `useEffect` on every change to `storedValue`.
- **Syncs across tabs** by listening to the native `window` `storage` event.
- **Handles errors** (corrupted JSON, quota exceeded) by falling back to
  `initialValue` without crashing the app.

### `useTasks` Store

All mutations are `useCallback`-wrapped for referential stability.
Each operation returns a new immutable state snapshot — no direct mutations.

```ts
addTask(title, quadrantId, opts?)  → string (new task id)
moveTask(taskId, targetQuadrant)   → void
toggleComplete(taskId)             → void
updateTask(taskId, patch)          → void
deleteTask(taskId)                 → void
getTasksByQuadrant(quadrantId)     → Task[]
```

### dnd-kit Integration

| Concern | Solution |
|---|---|
| Drag activation | `PointerSensor` with 8 px distance threshold (no accidental drags) |
| Keyboard DnD | `KeyboardSensor` + `sortableKeyboardCoordinates` |
| Collision detection | `closestCorners` — works well for a multi-container grid |
| Cross-quadrant drops | `handleDragEnd` checks if `over.id` is a quadrant id or a task id |
| Ghost card | `DragOverlay` renders a rotated clone outside the normal tree |
| Drop highlight | `useDroppable` → `isOver` → conditional `bg-indigo-50/60` tint |

### TypeScript Interfaces

```ts
// Core task model
interface Task {
  id: string;
  title: string;
  description?: string;
  quadrantId: QuadrantId;     // "do" | "schedule" | "delegate" | "eliminate"
  completed: boolean;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
  dueDate?: string;           // ISO 8601 date only
  tags?: string[];
}

// What gets persisted
interface PersistedState {
  tasks: Task[];
  version: number;            // bump for schema migrations
}
```

---

## 🎨 Design Tokens

| Token | Value | Used for |
|---|---|---|
| Background | `slate-50` | App background |
| Surface | `white` | Cards, header |
| Accent | `indigo-600` | Save button, focus rings, logo |
| Success | `emerald-500` | Completed task checkbox |
| Danger | `rose-500` | Delete hover, "Do First" quadrant |
| Text primary | `slate-900` | Headings |
| Text secondary | `slate-500` | Body copy, subtitles |
| Text muted | `slate-300–400` | Placeholders, icons |
| Border | `ring-1 ring-slate-200` | Card edges (no heavy shadows) |
| Hover shadow | `shadow-md` | Card hover state only |
| Radius | `rounded-xl / rounded-2xl` | Cards / quadrant containers |

---

## ♿ Accessibility Checklist

- [x] All buttons have `aria-label` (or visible text)
- [x] Checkbox uses `aria-pressed` (toggle pattern)
- [x] Drag handle announces task name via `aria-label`
- [x] Quadrant sections use `<section aria-label="…">`
- [x] Matrix root uses `<main aria-label="Eisenhower Matrix">`
- [x] Add task form uses `role="form"` with `aria-label`
- [x] `focus-visible` rings on all interactive elements
- [x] `prefers-reduced-motion` respected via CSS media query
- [x] Keyboard DnD via `KeyboardSensor`

---

## 🔧 Extending the App

### Add due-date picker to `AddTaskForm`

```tsx
const [dueDate, setDueDate] = useState("");
// In the form JSX:
<input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
// Pass to onAdd:
onAdd(trimmed, quadrantId, { dueDate });
```

### Add filtering (e.g. hide completed)

```tsx
// In Matrix.tsx
const [showCompleted, setShowCompleted] = useState(true);
const filtered = showCompleted ? tasks : tasks.filter(t => !t.completed);
```

### Wrap in Context for deeper trees

```tsx
// src/store/TaskContext.tsx
const TaskContext = createContext<TaskStore | null>(null);
export const TaskProvider = ({ children }) => (
  <TaskContext.Provider value={useTasks()}>{children}</TaskContext.Provider>
);
export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
};
```

### Export tasks as JSON

```ts
const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
// attach to an <a download="tasks.json"> element
```

---

## 📦 Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

Drag the `dist/` folder to app.netlify.com/drop.

### GitHub Pages

```bash
# vite.config.ts: set base: "/repo-name/"
npm run build
npx gh-pages -d dist
```

---

## License

MIT — free to use, modify, and deploy.
