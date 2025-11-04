# Data Models

The AI Math Tutor is **stateless with no database persistence**. However, well-defined data models provide type safety across frontend and backend (shared TypeScript interfaces), API contract definitions, conversation state management, and canvas serialization for LLM context.

These models live in `src/types/` and are imported by both frontend components and API routes.

## ConversationMessage

**Purpose:** Represents a single message in the tutoring conversation between student and tutor. Used in conversation history state and passed to GPT-4 for context.

**Key Attributes:**
- `id`: string - Unique identifier for the message (UUID or timestamp-based)
- `role`: 'student' | 'tutor' | 'system' - Sender of the message
- `content`: string - The text content of the message
- `timestamp`: Date - When the message was created
- `metadata`: MessageMetadata (optional) - Additional context (canvas snapshot, audio duration, etc.)

### TypeScript Interface

```typescript
interface ConversationMessage {
  id: string;
  role: 'student' | 'tutor' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

interface MessageMetadata {
  canvasSnapshot?: string; // base64 encoded image
  audioUrl?: string; // TTS audio URL (if voice enabled)
  annotationActions?: CanvasAnnotation[]; // Tutor visual actions
}
```

### Relationships
- **Many-to-One** with `TutoringSession` (a session contains multiple messages)
- **One-to-Many** with `CanvasAnnotation` (a tutor message may trigger multiple annotations)

## TutoringSession

**Purpose:** Represents the complete state of a single tutoring session, including the problem being worked on, conversation history, and canvas state. This is the primary client-side state object.

**Key Attributes:**
- `sessionId`: string - Unique session identifier
- `problem`: MathProblem - The current problem being worked on
- `messages`: ConversationMessage[] - Complete conversation history
- `canvasState`: CanvasState - Current state of the whiteboard
- `status`: 'active' | 'completed' | 'abandoned' - Session lifecycle status
- `startedAt`: Date - When the session began
- `completedAt`: Date (optional) - When the problem was solved

### TypeScript Interface

```typescript
interface TutoringSession {
  sessionId: string;
  problem: MathProblem;
  messages: ConversationMessage[];
  canvasState: CanvasState;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}
```

### Relationships
- **One-to-One** with `MathProblem` (each session works on one problem)
- **One-to-Many** with `ConversationMessage` (session contains conversation history)
- **One-to-One** with `CanvasState` (session has one active canvas)

## MathProblem

**Purpose:** Represents the mathematical problem being tutored, including its source (uploaded image, typed text, or generated practice problem) and rendered representation.

**Key Attributes:**
- `problemId`: string - Unique identifier
- `source`: 'text' | 'image' | 'generated' - How the problem was inputted
- `rawContent`: string - Original problem text or LaTeX notation
- `parsedContent`: string - Cleaned/parsed version for rendering (LaTeX format)
- `topic`: string (optional) - Subject area (e.g., "fractions", "algebra") for generated problems
- `imageUrl`: string (optional) - URL/base64 of uploaded image (if source is 'image')
- `difficulty`: 'easy' | 'medium' | 'hard' (optional) - For generated problems

### TypeScript Interface

```typescript
interface MathProblem {
  problemId: string;
  source: 'text' | 'image' | 'generated';
  rawContent: string;
  parsedContent: string;
  topic?: string;
  imageUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

### Relationships
- **One-to-One** with `TutoringSession` (problem is part of one session)

## CanvasState

**Purpose:** Represents the complete state of the interactive whiteboard, including the rendered problem, student drawings, and tutor annotations. Serialized for GPT-4 Vision context.

**Key Attributes:**
- `stageSize`: Dimensions - Width and height of the canvas
- `problemElements`: CanvasElement[] - Rendered problem components (LaTeX, text)
- `studentStrokes`: DrawingStroke[] - Student's drawing marks
- `tutorAnnotations`: CanvasAnnotation[] - Tutor's highlights/circles
- `semanticRegistry`: SemanticRegistry - Maps semantic IDs to canvas coordinates (e.g., "numerator_1" → {x, y, width, height})

### TypeScript Interface

```typescript
interface CanvasState {
  stageSize: Dimensions;
  problemElements: CanvasElement[];
  studentStrokes: DrawingStroke[];
  tutorAnnotations: CanvasAnnotation[];
  semanticRegistry: SemanticRegistry;
}

interface Dimensions {
  width: number;
  height: number;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'latex' | 'image';
  content: string;
  position: Position;
  style: ElementStyle;
}

interface DrawingStroke {
  id: string;
  points: number[]; // Konva.js format: [x1, y1, x2, y2, ...]
  color: string;
  strokeWidth: number;
  timestamp: Date;
}

interface CanvasAnnotation {
  id: string;
  type: 'highlight' | 'circle';
  targetId?: string; // Semantic ID from registry
  position: Position;
  size: Dimensions;
  color: string;
  createdAt: Date;
}

interface Position {
  x: number;
  y: number;
}

interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface SemanticRegistry {
  [semanticId: string]: {
    position: Position;
    size: Dimensions;
    label: string; // Human-readable label (e.g., "numerator", "equals sign")
  };
}
```

### Relationships
- **One-to-One** with `TutoringSession` (canvas is part of one session)
- **One-to-Many** with `CanvasAnnotation` (canvas contains multiple annotations)

## APIRequest / APIResponse

**Purpose:** Standard request/response contracts for all API routes. Ensures type safety between frontend and backend.

### TypeScript Interfaces

```typescript
// Chat API (Socratic Dialogue)
interface ChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  canvasSnapshot?: string; // base64 image
}

interface ChatResponse {
  message: ConversationMessage;
  annotationActions?: AnnotationAction[]; // If tutor wants to highlight/circle
}

// Image Parsing API (OCR)
interface ParseImageRequest {
  image: string; // base64 encoded
}

interface ParseImageResponse {
  success: boolean;
  parsedContent: string; // LaTeX formatted problem
  confidence: number; // 0-1 scale
  error?: string;
}

// Generate Practice Problem API
interface GenerateProblemRequest {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface GenerateProblemResponse {
  problem: MathProblem;
}

// Speech-to-Text API
interface STTRequest {
  audio: Blob | string; // Audio file or base64
}

interface STTResponse {
  transcription: string;
  duration: number; // seconds
}

// Text-to-Speech API
interface TTSRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'nova' | 'onyx' | 'shimmer';
}

interface TTSResponse {
  audioUrl: string; // Base64-encoded audio data
  duration: number; // seconds
}

// Annotation Action (from LLM function calling)
interface AnnotationAction {
  action: 'highlight' | 'circle';
  target: string; // Natural language description (e.g., "numerator", "left side")
}
```

---
