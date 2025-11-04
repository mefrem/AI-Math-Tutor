# Coding Standards

**Purpose:** Define MINIMAL but CRITICAL standards for AI agents and developers. Focus only on project-specific rules that prevent common mistakes.

---

## Critical Fullstack Rules

- **Type Sharing:** Always define types in `src/types/` and import from there. Never duplicate type definitions between frontend and backend.

- **API Calls:** Never make direct `fetch()` calls in components. Use the service layer (`src/services/api/`) for all API interactions.

- **Environment Variables:** Access only through validated config objects, never `process.env` directly in components. Server-side API routes may use `process.env.OPENAI_API_KEY`.

- **Error Handling:** All API routes must use the standard error handler (`handleApiError()` from `lib/errorHandler.ts`).

- **State Updates:** Never mutate Zustand state directly. Always use store actions (`addMessage()`, `updateCanvas()`, etc.).

- **Canvas Serialization:** Only serialize canvas when sending to API, not on every state change. Use `canvasSerializer.serializeCanvas()` from `src/services/canvas/`.

- **Prompt Templates:** All OpenAI prompts live in `src/services/prompts.ts`. Never inline prompts in service files or API routes.

- **Serverless Function Size:** Keep API route handlers thin (<50 lines). Business logic belongs in service layer (`src/services/`).

---

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ChatInterface.tsx`, `Whiteboard.tsx` |
| Hooks | camelCase with 'use' | - | `useSendMessage.ts`, `useCanvasActions.ts` |
| Services | camelCase | camelCase | `llmService.ts`, `audioService.ts` |
| API Routes | kebab-case folder | - | `/api/chat`, `/api/parse-image` |
| Types/Interfaces | PascalCase | PascalCase | `ConversationMessage`, `TutoringSession` |
| Zustand Stores | camelCase with 'use' | - | `useTutoringStore`, `useCanvasStore` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_CANVAS_SIZE`, `DEFAULT_VOICE` |

---

## File Organization Rules

**Components:**
- One component per file
- Co-locate styles if using CSS modules (not applicable with Tailwind)
- Container components in root of feature folder, presentational as children

**Services:**
- One service class per file
- Export singleton instance: `export const llmService = new LLMService()`
- Client-side services in `src/services/api/` and `src/services/canvas/`
- Server-side services in `src/services/` root

**Types:**
- Group related types in single file (`src/types/models.ts`, `src/types/api.ts`)
- Never export types from component files
- API request/response types in `src/types/api.ts`

**Hooks:**
- One hook per file
- Prefix with `use` (React convention)
- Return object with named properties, not array: `return { sendMessage, isLoading }` not `return [sendMessage, isLoading]`

---

## TypeScript Standards

**Strict Mode:** Enabled in `tsconfig.json`. No `any` types without explicit `// @ts-expect-error` comment explaining why.

**Type Imports:**
```typescript
// ✅ Good
import type { ConversationMessage } from '@/types/models';

// ❌ Bad
import { ConversationMessage } from '@/types/models';
```

**Interface vs Type:**
- Use `interface` for object shapes (data models, component props)
- Use `type` for unions, intersections, and utility types

**Null Handling:**
```typescript
// ✅ Good - Explicit null checks
if (session?.messages) { ... }

// ❌ Bad - Assumes non-null
if (session.messages.length > 0) { ... }
```

---

## React/Next.js Patterns

**Client vs Server Components:**
- Default to Server Components (no 'use client' directive)
- Add `'use client'` only when using hooks, event handlers, or browser APIs
- API routes are always server-side (no 'use client')

**Component Props:**
```typescript
// ✅ Good - Explicit interface
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) { ... }

// ❌ Bad - Inline types
export function ChatInput({ onSend, disabled }: { onSend: Function, disabled: boolean }) { ... }
```

**Async Components (Server):**
```typescript
// ✅ Good - Server Component with async data
export default async function WorkspacePage() {
  const data = await fetchData();
  return <Workspace data={data} />;
}
```

**State Updates:**
```typescript
// ✅ Good - Use store actions
const { addMessage } = useTutoringStore();
addMessage(newMessage);

// ❌ Bad - Direct state mutation
useTutoringStore.getState().session.messages.push(newMessage);
```

---

## API Route Standards

**Route Structure:**
```typescript
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/services/llmService';
import { validateChatRequest } from '@/services/validators';
import { handleApiError } from '@/lib/errorHandler';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validationError = validateChatRequest(body);
    if (validationError) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: validationError } },
        { status: 400 }
      );
    }

    // 2. Call service layer
    const response = await llmService.processMessage(
      body.conversationHistory,
      body.message,
      body.canvasSnapshot
    );

    // 3. Return response
    return NextResponse.json(response);

  } catch (error) {
    return handleApiError(error);
  }
}
```

**Error Responses:**
All errors must follow this format:
```typescript
{
  error: {
    code: string;        // e.g., "INVALID_INPUT", "RATE_LIMIT", "INTERNAL_ERROR"
    message: string;     // User-friendly error message
    details?: any;       // Optional additional context
    timestamp: string;   // ISO 8601 timestamp
    requestId: string;   // UUID for correlation
  }
}
```

---

## Zustand Store Patterns

**Store Structure:**
```typescript
// src/stores/useTutoringStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TutoringStore {
  // State
  session: TutoringSession | null;

  // Actions (verbs, not nouns)
  createSession: (problem: MathProblem) => void;
  addMessage: (message: ConversationMessage) => void;
  resetSession: () => void;
}

export const useTutoringStore = create<TutoringStore>()(
  devtools(
    persist(
      (set) => ({
        session: null,

        createSession: (problem) => set({ session: { ... } }),

        addMessage: (message) => set((state) => ({
          session: state.session ? {
            ...state.session,
            messages: [...state.session.messages, message]
          } : null
        })),

        resetSession: () => set((state) => ({ session: null }))
      }),
      { name: 'tutoring-session' }
    ),
    { name: 'TutoringStore' }
  )
);
```

**Selectors for Performance:**
```typescript
// ✅ Good - Selector prevents unnecessary re-renders
const messageCount = useTutoringStore((state) => state.session?.messages.length || 0);

// ❌ Bad - Component re-renders on ANY store change
const { session } = useTutoringStore();
const messageCount = session?.messages.length || 0;
```

---

## Canvas/Konva Patterns

**Layer Organization:**
- Problem Layer (bottom): Rendered math problem (KaTeX)
- Drawing Layer (middle): Student strokes (blue)
- Annotation Layer (top): Tutor highlights/circles (orange)

**Semantic Registry:**
When rendering KaTeX elements, register their positions:
```typescript
// During problem rendering
semanticRegistry.register('numerator_1', {
  position: { x: 120, y: 50 },
  size: { width: 20, height: 30 },
  label: 'numerator'
});
```

**Canvas Serialization:**
```typescript
// ✅ Good - Serialize only when needed (on message send)
const canvasSnapshot = canvasSerializer.serializeCanvas(canvasState);
await chatApi.sendMessage({ message, canvasSnapshot });

// ❌ Bad - Serialize on every stroke (performance issue)
useEffect(() => {
  const snapshot = canvasSerializer.serializeCanvas(canvasState);
  setSnapshot(snapshot);
}, [canvasState.studentStrokes]);
```

---

## Styling with Tailwind

**Utility-First Approach:**
```typescript
// ✅ Good - Utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Send
</button>

// ❌ Bad - Custom CSS for simple styles
<button className="custom-button">Send</button>
```

**Component Variants:**
```typescript
// ✅ Good - Conditional classes with clsx or template literals
<div className={`
  rounded-lg px-4 py-2
  ${isStudent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}
`}>
  {message}
</div>
```

**Responsive Design:**
```typescript
// ✅ Good - Mobile-first responsive classes
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>
```

---

## Testing Guidelines (Selective Coverage)

**What to Test:**
- ✅ Canvas serialization logic (`canvasSerializer.ts`)
- ✅ Semantic registry resolution (`annotationResolver.ts`)
- ✅ LLM service with mocked OpenAI responses
- ✅ Critical utility functions (validators, formatters)

**What NOT to Test (for MVP):**
- ❌ UI components (manual QA sufficient per PRD)
- ❌ API routes (integration testing deferred)
- ❌ Simple presentational components

**Test File Location:**
```
src/services/canvas/canvasSerializer.ts
src/services/canvas/canvasSerializer.test.ts  ← Co-located
```

**Test Pattern:**
```typescript
// src/services/llmService.test.ts
import { llmService } from './llmService';
import { openai } from '@/lib/openai';

jest.mock('@/lib/openai');

describe('LLMService', () => {
  it('should format conversation history correctly', async () => {
    const mockResponse = { ... };
    (openai.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

    const result = await llmService.processMessage([], 'test message');

    expect(result.message.content).toBe('expected response');
  });
});
```

---

## Git Commit Standards

**Commit Message Format:**
```
<type>: <subject>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring (no behavior change)
- `docs:` - Documentation updates
- `style:` - Formatting (no logic change)
- `test:` - Adding tests
- `chore:` - Maintenance (dependencies, config)

**Examples:**
```
feat: implement Socratic dialogue with GPT-4

Added LLM service with prompt engineering for guiding questions.
Includes function calling for canvas annotations.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Security Rules

**API Keys:**
- ✅ Always use environment variables (`process.env.OPENAI_API_KEY`)
- ✅ Gitleaks pre-commit hook blocks commits with secrets
- ❌ Never hardcode API keys, even in comments or test files

**Input Validation:**
- ✅ Validate all API route inputs before processing
- ✅ Sanitize user input (strip HTML, limit length)
- ✅ Check file sizes before processing (images <5MB, audio <25MB)

**CORS and Headers:**
- Next.js API routes on same domain (no CORS needed)
- Set appropriate Content-Type headers in responses

---

## Performance Guidelines

**Bundle Size:**
- Target: <500KB initial JS bundle (measured with `next build`)
- Use dynamic imports for heavy components:
  ```typescript
  const Whiteboard = dynamic(() => import('@/components/whiteboard/Whiteboard'), {
    loading: () => <LoadingSpinner />
  });
  ```

**Canvas Performance:**
- Limit stroke points (simplify path if >1000 points)
- Debounce canvas serialization (don't serialize on every mouse move)
- Use Konva's `listening: false` for non-interactive layers

**API Response Time:**
- Target: <2 seconds for chat responses (NFR1)
- Implement loading states for all async operations
- Show progress indicators for long operations (>500ms)

---

## Common Pitfalls to Avoid

**❌ Pitfall: Serializing canvas on every state change**
```typescript
// BAD
useEffect(() => {
  const snapshot = serializeCanvas(canvasState);
  // This runs hundreds of times during drawing!
}, [canvasState]);
```

**✅ Solution: Serialize only when sending to API**
```typescript
// GOOD
const sendMessage = async (message: string) => {
  const snapshot = serializeCanvas(canvasState); // Only once per message
  await chatApi.sendMessage({ message, canvasSnapshot: snapshot });
};
```

---

**❌ Pitfall: Using `any` type for OpenAI responses**
```typescript
// BAD
const response: any = await openai.chat.completions.create({ ... });
```

**✅ Solution: Define proper types**
```typescript
// GOOD
import type { ChatCompletion } from 'openai/resources/chat';
const response: ChatCompletion = await openai.chat.completions.create({ ... });
```

---

**❌ Pitfall: Direct state mutation in Zustand**
```typescript
// BAD
const store = useTutoringStore.getState();
store.session.messages.push(newMessage); // Doesn't trigger re-render!
```

**✅ Solution: Use store actions**
```typescript
// GOOD
const { addMessage } = useTutoringStore();
addMessage(newMessage);
```

---

## AI Agent Instructions

**When implementing features:**
1. Check `docs/architecture/tech-stack.md` for technology versions
2. Reference `docs/architecture/unified-project-structure.md` for file locations
3. Follow patterns from `docs/architecture/components.md` and `docs/architecture/backend-architecture.md`
4. Import types from `src/types/` (never duplicate)
5. Use service layer for business logic (never inline in components/routes)

**When fixing bugs:**
1. Check error format matches standard (`ApiError` interface)
2. Verify types are correctly imported
3. Ensure state updates use store actions
4. Validate input/output matches API specification

**When refactoring:**
1. Preserve existing behavior (add tests if needed)
2. Follow naming conventions strictly
3. Keep commits atomic (one logical change per commit)
4. Update relevant documentation sections

---

## Quick Reference Card

```typescript
// ✅ DO
import type { ConversationMessage } from '@/types/models';
import { useTutoringStore } from '@/stores/useTutoringStore';
import { chatApi } from '@/services/api/chatApi';

const { addMessage } = useTutoringStore();
const response = await chatApi.sendMessage({ ... });
addMessage(response.message);

// ❌ DON'T
import { ConversationMessage } from '@/types/models'; // Missing 'type'
const store = useTutoringStore.getState();
store.session.messages.push(message); // Direct mutation
const response = await fetch('/api/chat', { ... }); // Direct fetch
```

---

**Last Updated:** November 3, 2025
**Version:** 1.0
**Status:** Active and enforced for all development
