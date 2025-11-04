# Frontend Architecture

The frontend is a Next.js 14+ React application using the App Router, organized into presentational and container components with Zustand for state management.

## Component Organization

```
src/components/
├── ui/                    # Base UI primitives
├── layout/                # Layout components
├── chat/                  # Chat interface
├── whiteboard/            # Canvas components
├── problem-input/         # Problem entry
├── avatar/                # Avatar components
└── voice/                 # Voice controls
```

## State Management Architecture

**Store 1: Tutoring Store** - Session + conversation history
**Store 2: Canvas Store** - Drawing state and annotations
**Store 3: UI Store** - Loading states, modals, settings

**Pattern:** Container/Presentational separation with Zustand selectors for derived state.

## Routing Architecture

```
app/
├── page.tsx              # Landing page (/)
├── problem-input/page.tsx # Problem input (/problem-input)
└── workspace/page.tsx     # Tutoring workspace (/workspace)
```

---
