# Tech Stack

This is the **DEFINITIVE** technology selection for the entire AI Math Tutor project. All development must use these exact technologies and versions.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3+ | Type-safe frontend development | PRD requirement for type safety; prevents runtime errors in canvas/state management logic |
| **Frontend Framework** | Next.js | 14.2+ | React framework with App Router + API Routes | PRD explicit requirement; provides both frontend and serverless backend in single framework |
| **UI Component Library** | Headless UI | 2.0+ | Accessible, unstyled components | Lightweight, pairs with Tailwind, provides keyboard navigation for accessibility (PRD NFR8) |
| **State Management** | Zustand | 4.5+ | Lightweight client state | Simpler than Redux, <1KB, sufficient for conversation history + canvas state; no learning curve overhead |
| **Backend Language** | TypeScript | 5.3+ | Type-safe API route development | Same language across stack; shared types between frontend/backend in `src/types/` |
| **Backend Framework** | Next.js API Routes | 14.2+ | Serverless API endpoints | Built-in to Next.js; zero additional setup; auto-deployed as Vercel serverless functions |
| **API Style** | REST | N/A | HTTP JSON APIs | Simplest approach for OpenAI API proxying; no GraphQL/tRPC overhead needed for 5 endpoints |
| **Database** | None (Stateless) | N/A | No persistence layer | PRD explicitly stateless MVP; eliminates setup/migration time |
| **Cache** | None | N/A | No caching layer | Stateless sessions; OpenAI responses are non-deterministic (no cache benefit) |
| **File Storage** | Vercel Blob Storage | N/A | Temporary image uploads (OCR) | Optional; may use in-memory base64 encoding instead; evaluate in Epic 2 |
| **Authentication** | None | N/A | No user accounts | PRD explicitly states "no user authentication or account creation for MVP" |
| **Frontend Testing** | Jest + React Testing Library | 29+ / 14+ | Unit tests for critical utilities | PRD allows "selective unit tests"; focus on canvas serialization, LaTeX parsing |
| **Backend Testing** | Jest | 29+ | Unit tests for API services | Test LLM service with mocked OpenAI responses; validate prompt engineering |
| **E2E Testing** | Manual QA | N/A | Cross-browser validation | PRD prioritizes manual testing over E2E automation for 5-7 day timeline |
| **Build Tool** | npm | 10+ | Package management | Default Node.js tooling; no additional setup |
| **Bundler** | Webpack (via Next.js) | 5+ | Asset bundling | Built-in to Next.js; zero configuration needed |
| **IaC Tool** | None | N/A | No infrastructure as code | Vercel manages all infrastructure; no Terraform/CDK needed |
| **CI/CD** | Vercel Git Integration | N/A | Automatic deployments from main | Zero-config CI/CD; auto-deploys on push to main branch |
| **Monitoring** | Vercel Analytics | N/A | Performance monitoring | Free tier; tracks Core Web Vitals, function execution times |
| **Logging** | Vercel Logs | N/A | Serverless function logs | Built-in; accessible via Vercel dashboard; sufficient for demo/portfolio |
| **CSS Framework** | Tailwind CSS | 3.4+ | Utility-first styling | PRD explicit requirement; rapid prototyping, responsive design utilities |
| **Math Rendering** | KaTeX | 0.16+ | LaTeX mathematical notation | PRD explicit requirement; lightweight (<100KB), renders fractions/exponents/symbols |
| **Canvas Library** | Konva.js | 9.3+ | HTML5 Canvas abstraction | Simpler API than Fabric.js; better performance; supports touch + mouse; ~200KB bundle |
| **Voice (STT)** | OpenAI Whisper API | V1 | Speech-to-text transcription | PRD requirement; server-side processing via `/api/stt` endpoint |
| **Voice (TTS)** | OpenAI TTS API | V1 | Text-to-speech synthesis | PRD requirement; voice recommendation: "nova" or "alloy" (friendly, educational tone) |
| **LLM** | OpenAI GPT-4 | gpt-4-turbo | Socratic dialogue engine | PRD requirement; sufficient context window for conversation history + canvas images |
| **Vision** | OpenAI GPT-4 Vision | gpt-4-vision-preview | Image OCR parsing | PRD requirement; handles both handwritten and printed math notation |
| **Linting** | ESLint | 8.57+ | Code quality enforcement | Next.js default config; enforce TypeScript strict mode |
| **Formatting** | Prettier | 3.2+ | Code formatting | Consistent style across codebase; integrates with ESLint |
| **Git Hooks** | Husky | 9.0+ | Pre-commit hooks | Run Gitleaks secret scanning before commits (Story 1.2) |
| **Secret Scanning** | Gitleaks | 8.18+ | API key leak prevention | PRD requirement (Greptile → Gitleaks); blocks commits containing secrets |

---
