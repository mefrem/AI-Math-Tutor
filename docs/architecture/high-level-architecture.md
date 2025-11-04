# High Level Architecture

## Technical Summary

The AI Math Tutor is a **serverless-first, monolithic Next.js 14 application** deployed on Vercel, utilizing Next.js API Routes as the exclusive backend layer. The frontend leverages React 18 with TypeScript for type-safe component development and Tailwind CSS for rapid UI styling. The backend orchestrates all AI capabilities through OpenAI's unified API suite: GPT-4 for Socratic dialogue, GPT-4 Vision for OCR, Whisper for speech-to-text, and TTS for voice synthesis.

The architecture is **stateless by design**—no database, no session persistence, no user authentication—enabling zero-infrastructure overhead while meeting the 5-7 day delivery timeline. All application state lives client-side (React Context or Zustand), with server-side API routes acting as thin orchestration layers for OpenAI API calls. The interactive whiteboard uses HTML5 Canvas API (or lightweight library like Konva.js) for drawing and annotation, with canvas state serialized to base64 images sent to GPT-4 Vision for visual context understanding.

This architecture achieves the PRD goals by prioritizing **speed of development**, **minimal operational complexity**, and **portfolio demonstration quality** over production-scale concerns like data persistence, user management, or multi-tenancy.

## Platform and Infrastructure Choice

**Selected Platform:** Vercel
**Key Services:**
- **Frontend Hosting:** Vercel Edge Network (CDN + static hosting)
- **Backend:** Vercel Serverless Functions (Next.js API Routes)
- **AI Services:** OpenAI API (GPT-4, GPT-4 Vision, Whisper, TTS)
- **Deployment:** Vercel Git Integration (auto-deploy from `main` branch)

**Deployment Host and Regions:** Global edge network (automatic), primary compute in US-East (Vercel default)

## Repository Structure

**Structure:** Monorepo (single repository)
**Monorepo Tool:** Native Next.js structure (no external tool needed)
**Package Organization:** Flat structure with clear separation of concerns

**Rationale:** PRD explicitly specifies "Monorepo" with Next.js API routes co-located. No need for Turborepo/Nx for single-app project (YAGNI principle). Shared TypeScript types live in `src/types/` (accessible to both frontend and API routes).

## High Level Architecture Diagram

```mermaid
graph TB
    User[Student User<br/>Browser: Chrome/Safari/Firefox]

    subgraph "Vercel Edge Network"
        CDN[CDN + Static Assets]
        NextApp[Next.js Application<br/>React Frontend]
    end

    subgraph "Vercel Serverless Functions"
        APIChat[/api/chat<br/>Socratic Dialogue]
        APIParseImage[/api/parse-image<br/>OCR Processing]
        APIGenerate[/api/generate-problem<br/>Practice Problems]
        APITTS[/api/tts<br/>Text-to-Speech]
        APISTT[/api/stt<br/>Speech-to-Text]
    end

    subgraph "External Services"
        OpenAI[OpenAI API Suite]
        GPT4[GPT-4<br/>Dialogue Engine]
        Vision[GPT-4 Vision<br/>Image OCR]
        Whisper[Whisper API<br/>Voice → Text]
        TTS[TTS API<br/>Text → Voice]
    end

    User -->|HTTPS| CDN
    CDN --> NextApp
    NextApp -->|API Calls| APIChat
    NextApp -->|Upload Image| APIParseImage
    NextApp -->|Request Practice| APIGenerate
    NextApp -->|Voice Input| APISTT
    NextApp -->|Tutor Response| APITTS

    APIChat -->|Conversation + Canvas| GPT4
    APIParseImage -->|Image| Vision
    APIGenerate -->|Topic| GPT4
    APISTT -->|Audio| Whisper
    APITTS -->|Text| TTS

    GPT4 --> OpenAI
    Vision --> OpenAI
    Whisper --> OpenAI
    TTS --> OpenAI

    style User fill:#e1f5ff
    style NextApp fill:#ffeb3b
    style OpenAI fill:#4caf50
    style CDN fill:#ff9800
```

## Architectural Patterns

- **Jamstack Architecture:** Static-first frontend with serverless API functions - _Rationale:_ Optimal performance for interactive UI while keeping backend logic isolated and stateless

- **Serverless Functions Pattern:** Each API route is an independent serverless function - _Rationale:_ Auto-scaling, zero infrastructure management, pay-per-request cost model ideal for demo/portfolio

- **Component-Based UI:** Reusable React components with TypeScript - _Rationale:_ Maintainability and type safety across large codebase; aligns with PRD requirement for clean architecture

- **Service Layer Pattern:** Business logic abstracted into service modules (llmService, canvasService, audioService) - _Rationale:_ API routes remain thin orchestration layers; services are testable in isolation

- **Stateless Session Pattern:** No server-side session storage; all state managed client-side - _Rationale:_ PRD explicitly states "no user authentication" and "stateless sessions"; eliminates database requirement

- **API Gateway Pattern (Implicit):** Next.js API routes act as unified API layer - _Rationale:_ Single entry point for OpenAI API calls; centralizes error handling, rate limiting, and API key management

- **Canvas Serialization Pattern:** Visual state captured as base64 images for LLM context - _Rationale:_ GPT-4 Vision requires image input; serialization enables "visual understanding" of student work

---
