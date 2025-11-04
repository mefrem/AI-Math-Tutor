# Core Workflows

This section illustrates critical system workflows using sequence diagrams.

## Workflow 1: Complete Tutoring Session (Text Input Path)

```mermaid
sequenceDiagram
    actor Student
    participant UI as Landing Page
    participant Input as Problem Input
    participant Workspace as Tutoring Workspace
    participant Store as Zustand Store
    participant ChatAPI as /api/chat
    participant LLM as LLM Service
    participant GPT4 as OpenAI GPT-4

    Student->>UI: Opens application
    UI->>Student: Display "I have a problem" / "I need practice"

    Student->>UI: Clicks "I have a problem"
    UI->>Input: Navigate to text input

    Student->>Input: Types "Solve for x: 2x + 5 = 13"
    Student->>Input: Clicks "Start Tutoring"

    Input->>Store: Create session with problem
    Input->>Workspace: Navigate to workspace

    Workspace->>Student: Display whiteboard with problem + chat interface

    Student->>Workspace: Types "I don't know where to start"
    Workspace->>Store: Add student message to history
    Workspace->>ChatAPI: POST {message, conversationHistory}

    ChatAPI->>LLM: processMessage()
    LLM->>GPT4: Chat completion with Socratic prompt

    GPT4-->>LLM: "Let's begin by understanding...<br/>What does 'solve for x' mean?"
    LLM-->>ChatAPI: Format response
    ChatAPI-->>Workspace: {message, annotationActions: []}

    Workspace->>Store: Add tutor message
    Store-->>Workspace: Update UI
    Workspace->>Student: Display tutor question
```

## Workflow 2: Voice Interaction with Canvas Annotation

```mermaid
sequenceDiagram
    actor Student
    participant Voice as Voice Controls
    participant Audio as Audio Service
    participant STTAPI as /api/stt
    participant Canvas as Whiteboard Canvas
    participant ChatAPI as /api/chat
    participant TTSAPI as /api/tts
    participant Avatar as Avatar Component

    Student->>Voice: Presses "Push to Talk" button
    Voice->>Audio: startRecording()
    Audio->>Student: Display "Recording..." (red indicator)

    Student->>Voice: Releases button
    Voice->>Audio: stopRecording()
    Audio->>STTAPI: POST {audio: Blob}

    STTAPI-->>Audio: {transcription: "I think the answer is 8"}

    Audio->>Canvas: Display transcription in chat
    Canvas->>Canvas: serializeCanvas() → base64 image
    Audio->>ChatAPI: POST {message, conversationHistory, canvasSnapshot}

    ChatAPI->>Canvas: Apply annotation
    Canvas->>Canvas: Resolve target → coordinates
    Canvas->>Canvas: Draw orange circle

    ChatAPI->>TTSAPI: POST {text, voice: "nova"}
    TTSAPI-->>ChatAPI: {audioUrl: base64, duration: 3.5}

    ChatAPI->>Avatar: Play audio + start lip-sync
    Avatar->>Avatar: Animate mouth (open/close loop)
    Avatar->>Student: Audio plays through speakers

    Avatar->>Avatar: Return to idle state
    Voice->>Student: Re-enable "Push to Talk" button
```

---
