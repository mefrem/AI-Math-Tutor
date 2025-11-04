# Backend Architecture

The backend is implemented entirely through **Next.js API Routes**, providing serverless functions that orchestrate OpenAI API calls.

## Serverless Architecture: Function Organization

```
src/app/api/
├── chat/route.ts          # POST /api/chat
├── parse-image/route.ts   # POST /api/parse-image
├── generate-problem/route.ts
├── stt/route.ts
└── tts/route.ts
```

**Service Layer:**
- `llmService.ts` - GPT-4 interaction
- `audioService.ts` - Whisper STT + TTS orchestration
- `canvasService.ts` - Canvas annotation resolution
- `prompts.ts` - Prompt templates

**Pattern:** API routes are thin controllers (<50 lines), business logic in testable services.

---
