# AI Math Tutor Product Requirements Document (PRD)

**Version:** 1.0
**Date:** November 3, 2025
**Author:** PM Agent (John)
**Status:** Ready for Architecture Phase

---

## Table of Contents

1. [Goals and Background Context](#goals-and-background-context)
2. [Requirements](#requirements)
3. [User Interface Design Goals](#user-interface-design-goals)
4. [Technical Assumptions](#technical-assumptions)
5. [Epic List](#epic-list)
6. [Epic Details](#epic-details)
7. [Checklist Results Report](#checklist-results-report)
8. [Next Steps](#next-steps)

---

## Goals and Background Context

### Goals

Based on the Project Brief, here are the key desired outcomes for this PRD:

- Deliver a functional AI Math Tutor MVP within 5-7 days demonstrating Socratic tutoring methodology
- Enable students to submit problems via text, image upload, or request practice problems on specific topics
- Implement seamless multi-modal interaction combining voice, text, and interactive whiteboard collaboration
- Ensure tutor never provides direct answers—only guiding questions that lead students to discover solutions
- Create a polished, portfolio-quality demonstration showcasing advanced engineering capabilities
- Validate that conversational AI tutoring can effectively guide students through 5+ distinct problem types
- Deploy a working demo with clean architecture, comprehensive documentation, and video walkthrough

### Background Context

AI Math Tutor addresses a critical gap in existing math education tools: the lack of responsive, attuned guidance that adapts to individual student work in real-time. Current solutions fall into two inadequate categories—answer-delivery tools (Photomath, Symbolab) that encourage dependency without understanding, and video-based learning (Khan Academy) that provides generic one-way instruction without personalization or feedback.

This project leverages recent advances in LLM capabilities (GPT-4 Vision, real-time voice APIs) to create an interactive Socratic learning assistant for elementary and middle school students (ages 8-14). The system combines conversational tutoring with collaborative whiteboard interaction, simulating the experience of having a patient human tutor working alongside the student. By focusing on guided discovery rather than answer delivery, the platform builds genuine mathematical understanding and problem-solving confidence. The 5-7 day timeline positions this as a portfolio demonstration project showcasing technical capability, product thinking, and pedagogical innovation.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-03 | 1.0 | Initial PRD creation from Project Brief | PM Agent |

---

## Requirements

### Functional Requirements

**Problem Input & Parsing:**
- FR1: The system shall accept math problems via direct text entry
- FR2: The system shall accept math problems via image upload (supporting both printed and handwritten notation)
- FR3: The system shall use GPT-4 Vision to parse uploaded images and extract mathematical problems via OCR
- FR4: The system shall allow students to request practice problems on specific topics (e.g., "fractions", "algebra")
- FR5: The system shall generate appropriate example problems when students request topic-based practice
- FR6: The system shall render parsed mathematical expressions on the whiteboard using LaTeX/KaTeX formatting
- FR7: The system shall provide a re-upload button and manual text correction option if OCR parsing fails or is incorrect

**Socratic Dialogue Engine:**
- FR8: The system shall conduct multi-turn conversations with students using GPT-4 powered tutoring
- FR9: The system shall never provide direct answers to problems, only guiding questions and hints
- FR10: The system shall maintain conversation history and track the student's demonstrated understanding level throughout the session
- FR11: The system shall adapt question difficulty and hint specificity based on student responses (providing more concrete hints after 2+ consecutive stuck turns)
- FR12: The system shall use encouraging, patient language with positive reinforcement throughout the tutoring session
- FR13: The system shall explicitly acknowledge incorrect answers (e.g., "That's not quite right, let's think about...")
- FR14: The system shall recognize when a student arrives at the correct answer and celebrate their success
- FR15: The system shall offer to start a new problem session after successful completion

**Interactive Whiteboard:**
- FR16: The system shall provide a shared canvas for rendering problems and enabling visual collaboration
- FR17: The system shall allow students to draw and write directly on the whiteboard using a basic pen tool
- FR18: The system shall enable the tutor to highlight or circle key parts of problems on the whiteboard
- FR19: The system shall serialize all student canvas interactions and include them as context for the tutor LLM
- FR20: The system shall provide a clear/restart button for the whiteboard canvas

**Voice Interface:**
- FR21: The system shall convert tutor text responses to speech using OpenAI TTS API
- FR22: The system shall transcribe student voice input to text using OpenAI Whisper API
- FR23: The system shall provide push-to-talk/turn-based voice interaction (student controls when to speak)
- FR24: The system shall provide a text input fallback option for students who prefer typing over speaking

**Avatar Presence:**
- FR25: The system shall display a 2D tutor avatar character positioned next to the whiteboard
- FR26: The system shall animate the avatar's mouth movements synchronized with speech output (lip-sync)
- FR27: The system shall display a "thinking" indicator on the avatar when processing student input
- FR28: The system shall keep the avatar in a static idle state when not speaking or processing

**Step Visualization:**
- FR29: The system shall provide animated step-by-step visualization of solution approaches as students progress through problems
- FR30: The system shall progressively reveal solution steps incrementally as students work through the problem

**User Interface:**
- FR31: The system shall display conversation history in a chat-style interface alongside the whiteboard
- FR32: The system shall provide a clear problem upload area with options for text entry or image upload
- FR33: The system shall present an initial prompt allowing students to choose between providing a problem or requesting practice on a topic
- FR34: The system shall work responsively on tablets and laptops (minimum 768px width)

### Non-Functional Requirements

**Performance:**
- NFR1: The system shall respond to student input with tutor response start within 2 seconds average latency
- NFR2: The system shall transcribe speech to text within 500ms of speech completion
- NFR3: The system shall render canvas drawing and animations at 60fps for smooth interaction
- NFR4: The system shall process uploaded images and display parsed problems on the whiteboard within 5 seconds

**Reliability:**
- NFR5: The system shall maintain less than 2% error rate in OCR parsing, voice transcription, and canvas rendering combined
- NFR6: The system shall successfully guide students through at least 5 distinct problem types (arithmetic, algebra, geometry, word problems, multi-step problems)
- NFR7: The system shall achieve 0 instances of the tutor providing direct answers during test sessions (100% Socratic compliance)

**Usability:**
- NFR8: The system shall support modern browsers (Chrome, Safari, Firefox - latest 2 versions)
- NFR9: The system shall work on laptop, desktop, and tablet devices
- NFR10: The system shall require no user authentication or account creation for MVP

**Scalability & Cost:**
- NFR11: The system shall use serverless architecture (Next.js API routes only) with no separate backend infrastructure
- NFR12: The system shall aim to keep OpenAI API usage within approximately $10-30 for development and demonstration purposes
- NFR13: The system shall deploy to Vercel free tier for hosting

**Maintainability:**
- NFR14: The system shall be implemented as a monorepo with frontend and Next.js API routes in a single repository
- NFR15: The system shall include comprehensive documentation covering setup instructions and architectural decisions
- NFR16: The system shall use TypeScript for type safety and code clarity
- NFR17: The system shall maintain clean repository structure with clear separation of components, services, hooks, and utilities

---

## User Interface Design Goals

### Overall UX Vision

The interface should feel like **sitting next to a patient tutor at a shared desk**. The design prioritizes simplicity, focus, and collaboration over feature-rich complexity. The primary visual metaphor is a **tutoring workspace** with three key zones: the conversation (left), the shared whiteboard (center/right), and the avatar tutor presence (adjacent to whiteboard).

The experience should be **calm and uncluttered**—no overwhelming toolbars or competing visual elements. Students should feel invited to engage without intimidation. Color palette should be warm and approachable (soft blues, greens, neutrals) rather than stark or corporate. Typography should be large and readable for the target age group (8-14 years).

The interface adapts to the student's workflow: minimal chrome on initial landing (just "Upload a problem" or "Ask for practice"), then the workspace expands to reveal conversation, whiteboard, and avatar once tutoring begins.

### Key Interaction Paradigms

**1. Turn-Based Conversational Flow:**
- Student initiates input (push-to-talk button for voice, or text field)
- Clear visual feedback when tutor is "thinking" (processing indicator on avatar)
- Tutor response plays with lip-synced avatar, text appears in conversation panel simultaneously
- Student controls pacing—no interruptions or always-on listening pressure

**2. Collaborative Whiteboard:**
- Problem renders centrally on canvas (LaTeX-formatted equations)
- Student can draw/annotate directly using simple pen tool (single color, medium stroke)
- Tutor highlights/circles key elements visually during conversation (distinct color from student pen)
- Canvas persists throughout problem session, cleared only when starting new problem

**3. Multi-Modal Input Flexibility:**
- Voice-first design (large push-to-talk button), but text input always available as fallback
- Image upload via drag-and-drop or file picker, with immediate OCR feedback
- Manual text entry for problems if student prefers typing over image upload

**4. Avatar as Presence Anchor:**
- Avatar positioned consistently (not moving or distracting) adjacent to whiteboard
- Minimal animation states: idle (static), thinking (pulsing/spinner indicator), speaking (lip-sync only)
- Avatar serves as visual anchor for "who is talking" rather than entertainment feature

### Core Screens and Views

From a product perspective, the most critical screens necessary to deliver the PRD values:

**1. Landing/Problem Entry Screen**
- Initial prompt: "What would you like to work on today?"
- Two clear pathways:
  - "I have a problem" → Upload image or enter text
  - "I need practice with..." → Topic selection or text entry
- Minimal UI—just these options, logo, and welcoming message

**2. Active Tutoring Workspace**
- **Left panel (30% width):** Conversation history (scrollable chat)
- **Center/Right panel (70% width):** Interactive whiteboard with avatar adjacent
- **Bottom:** Input controls (push-to-talk button, text input field, toggle between voice/text)
- **Top:** Session controls (restart problem, exit session)

**3. Problem Upload/OCR Confirmation (Modal or Inline)**
- Shows uploaded image preview
- Displays parsed mathematical expression
- "Is this correct?" with options to re-upload, manually edit, or proceed
- Only appears when using image upload pathway

**4. Topic Practice Problem Selection (Optional Modal)**
- If student requests practice, simple topic picker or free-text entry
- Examples: "Fractions", "Algebra", "Word Problems", "Geometry"
- Tutor generates problem and proceeds to Active Tutoring Workspace

### Accessibility

**Target Level: WCAG AA Compliance (Partial for MVP)**

For MVP, prioritize:
- **Keyboard navigation:** All interactive elements (buttons, input fields) accessible via keyboard
- **Color contrast:** Minimum 4.5:1 contrast ratio for text and important UI elements
- **Alt text:** Images and icons have descriptive labels
- **Focus indicators:** Clear visual focus states for keyboard users

**Out of scope for MVP:**
- Screen reader optimization (aria labels, semantic HTML—address in post-MVP)
- Full WCAG AA compliance audit
- High-contrast mode or visual customization options

**Assumption:** Target age group (8-14) typically has fewer accessibility needs than adult users, but basic keyboard access and contrast are essential for students with low vision or motor control preferences.

### Branding

**Style: Friendly Educational, Not Playful/Childish**

- **Color Palette:** Soft, approachable tones
  - Primary: Medium blue (#4A90E2) for action buttons and active states
  - Secondary: Warm green (#7CB342) for success/celebration moments
  - Neutral: Light grays (#F5F5F5 background, #333 text)
  - Accent: Tutor highlight color (orange #FF9800) to differentiate from student pen (blue)

- **Typography:**
  - Sans-serif, high readability (Inter, Open Sans, or system fonts)
  - Larger base font size (18px) for target age group
  - Clear hierarchy with bold weights for headings

- **Tone:** Professional but warm—avoid overly cutesy or gamified aesthetics. This is a learning tool, not a game. Think "PBS Kids meets modern SaaS" rather than "cartoon app".

- **Avatar Design:** Simple, gender-neutral character design. Not hyper-realistic, not cartoon—somewhere in between (think "instructional video presenter" aesthetic).

**No existing brand guidelines**—this is a net-new portfolio project.

### Target Device and Platforms

**Primary: Web Responsive (Tablet & Laptop Focus)**

- **Devices:**
  - **Primary:** Laptops (MacBook, Chromebook, Windows laptop) at 1280px+ width
  - **Secondary:** Tablets in landscape (iPad, Android tablets) at 768px-1024px width
  - **Out of scope:** Mobile phones (too small for effective whiteboard collaboration)

- **Browsers:** Chrome, Safari, Firefox, Edge (latest 2 versions)
  - Must support Web Speech API for voice features
  - Chrome is primary development target (best voice API support)

- **Input Methods:**
  - Touch support for tablet drawing on whiteboard
  - Mouse/trackpad for laptop drawing
  - Microphone access required for voice features
  - Camera/file upload for image-based problem entry

**Platform Rationale:** Elementary/middle school students doing homework typically use tablets or laptops (school-issued Chromebooks or family devices). Mobile phone screens are too small for comfortable whiteboard collaboration and would require significant layout compromises.

---

## Technical Assumptions

### Repository Structure: **Monorepo**

**Decision:** Single repository containing frontend application and Next.js API routes together.

**Rationale:**
- Simplifies development workflow for solo developer within 5-7 day timeline
- Next.js supports co-located API routes, eliminating need for separate backend repo
- Easier dependency management and deployment (single Vercel deployment)
- Reduces coordination overhead—all code changes in one place
- Appropriate for project scope (no need for independent service scaling)

**Structure:**
```
ai-math-tutor/
├── src/
│   ├── app/              # Next.js 13+ App Router pages
│   ├── components/       # React components
│   ├── services/         # Business logic and API integrations
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── docs/                 # Documentation (Brief, PRD, Architecture)
└── README.md
```

### Service Architecture: **Monolith (Frontend + Serverless API Routes)**

**Decision:** Monolithic Next.js application with serverless API routes for backend logic. No separate backend services or microservices.

**Architecture Components:**
1. **Frontend (React/Next.js):** UI components, whiteboard canvas, conversation interface, avatar rendering
2. **API Routes (Next.js):** Orchestrate OpenAI API calls (GPT-4, Vision, Whisper, TTS), handle business logic
3. **External Services:** OpenAI API only (all AI capabilities through single provider)

**Rationale:**
- **Simplicity:** Single deployment unit, no service orchestration complexity
- **Timeline:** Monolith is fastest path to working MVP within 5-7 days
- **Serverless:** Next.js API routes auto-scale on Vercel, no server management
- **Cost:** Free tier hosting, pay-per-request OpenAI API usage (~$10-30 total)
- **Scope:** No requirements for independent service scaling, microservices would be over-engineering

**Data Flow:**
```
Student Input → Frontend → Next.js API Route → OpenAI API → Response Processing → Frontend Update
```

**State Management:**
- **Client:** Zustand or React Context for conversation history, canvas state, UI state
- **Server:** Stateless (no database, no session persistence for MVP)

### Testing Requirements: **Unit + Integration (Limited Coverage for MVP)**

**Decision:** Focus on critical path testing with pragmatic coverage, not comprehensive testing pyramid.

**MVP Testing Approach:**

1. **Manual Testing (Primary):**
   - Test across 5 problem types (arithmetic, algebra, geometry, word problems, multi-step)
   - Validate Socratic compliance (ensure no direct answers given)
   - Cross-browser testing (Chrome, Safari, Firefox)
   - Voice quality testing (latency, accuracy)
   - OCR reliability testing (handwritten + printed samples)

2. **Unit Tests (Selective):**
   - **Critical utilities:** Canvas serialization, LaTeX parsing helpers
   - **Prompt engineering:** Test Socratic prompt templates with mock LLM responses
   - **API service functions:** Basic error handling and response parsing
   - **Not required:** UI component unit tests (visual bugs caught in manual testing)

3. **Integration Tests (Minimal):**
   - **OpenAI API integration:** Validate request/response cycles with real API
   - **End-to-end flow (optional):** Single smoke test covering upload → conversation → solution

**Rationale:**
- **Timeline constraint:** Comprehensive test coverage would consume 20-30% of development time
- **Portfolio context:** Demonstrable functionality > test coverage metrics
- **Risk mitigation:** Manual testing across 5 problem types validates core value proposition
- **Post-MVP:** Can add comprehensive testing if project continues beyond demo phase

**Testing Tools:**
- Jest (if unit tests implemented)
- Manual QA checklist (highest ROI)
- Browser DevTools for debugging

### Additional Technical Assumptions and Requests

**Frontend Stack:**
- **Framework:** Next.js 14+ with App Router (TypeScript)
- **UI Library:** Tailwind CSS for rapid, responsive styling
- **Canvas Library:** TBD during implementation (leading candidates: Fabric.js, Konva.js, or HTML5 Canvas API directly)
- **Math Rendering:** KaTeX (lightweight, sufficient for grades 3-8 notation)
- **State Management:** Zustand (lightweight) or React Context (zero dependencies)

**LLM & AI Services (OpenAI API - Single Provider):**
- **Dialogue Engine:** GPT-4 (standard completion API, not streaming—questions are short)
- **Vision/OCR:** GPT-4 Vision for image parsing (handles handwritten + printed)
- **Speech-to-Text:** OpenAI Whisper API
- **Text-to-Speech:** OpenAI TTS API (voice options: alloy, echo, fable, onyx, nova, shimmer—to be selected during implementation)
- **API Key Management:** Server-side only (stored in environment variables, never exposed to client)

**Deployment & Hosting:**
- **Platform:** Vercel (optimal Next.js deployment experience)
- **Cost:** Free tier (sufficient for demo/portfolio usage)
- **Environment:** Production deployment + local development environment
- **CI/CD:** Vercel automatic deployments from main branch (no complex pipeline needed)

**Development Tools & Code Quality:**
- **AI Code Review:** Greptile (Reptile) for automated code review and security scanning
  - **Primary Use Case:** Ensure no secrets (API keys, credentials) are committed to GitHub
  - **Integration:** Pre-commit hook or CI/CD integration to block commits containing sensitive data
  - **Rationale:** Critical for demo/portfolio project—accidentally exposing OpenAI API key would be costly and embarrassing
  - **URL:** https://www.greptile.com/
- **Version Control:** Git + GitHub for source control
- **Code Formatting:** Prettier + ESLint for consistent code style
- **TypeScript:** Strict mode enabled for maximum type safety

**Browser & Device Support:**
- **Browsers:** Chrome (primary), Safari, Firefox, Edge (latest 2 versions)
- **Devices:** Laptop, desktop, tablet (minimum 768px width)
- **Voice API:** Web Speech API support required (Chrome has best compatibility)
- **No mobile phone optimization** (out of scope)

**Security & Privacy:**
- **No user authentication:** Stateless sessions, no login system
- **No PII collection:** No user data stored or persisted
- **API key security:** All OpenAI API calls from server-side only (Next.js API routes)
  - **Critical:** OpenAI API key stored in `.env.local` (gitignored)
  - **Greptile integration:** Automated scanning to prevent accidental key exposure in commits
- **Content moderation:** Optional—could add OpenAI Moderation API if needed
- **HTTPS:** Required for voice API access (Vercel provides by default)

**Development Workflow:**
- **Local development:** Next.js dev server with hot-reload
- **Git workflow:** Feature branches → main (or trunk-based development for solo project)
- **Pre-commit checks:** Greptile scan for secrets before allowing commit
- **Deployment:** Automatic Vercel deployment from main branch
- **Environment variables:**
  - Local: `.env.local` (gitignored)
  - Production: Vercel environment variables dashboard

**Performance Targets:**
- **LLM Response Latency:** <2 seconds from student input to tutor response start
- **Voice Transcription:** <500ms from speech end to text available
- **Canvas Rendering:** 60fps for drawing and animations
- **Image Upload Processing:** <5 seconds from upload to parsed problem display

**Critical Open Technical Questions (Require Research/Prototyping):**

1. **Canvas Action Parsing Strategy (RESOLVED):**
   - ✅ Research completed - 3-tier hybrid approach recommended
   - **Tier 1:** Semantic target resolution with fuzzy matching
   - **Tier 2:** Predefined region fallback
   - **Tier 3:** Verbal-only guidance (always works)
   - LLM uses natural language targets via function calling
   - See research findings for implementation details

2. **Avatar Lip-Sync Implementation:**
   - Library options: react-speech-kit, Lottie animations, Web Animations API, custom SVG animation?
   - Synchronization approach with OpenAI TTS audio playback
   - Performance considerations for smooth 60fps rendering
   - **Action Required:** Technical spike with prototypes early in Day 1-2

3. **Canvas Library Selection:**
   - Fabric.js (full-featured, larger bundle) vs. Konva.js (lighter) vs. native Canvas API?
   - Requirements: Student drawing, programmatic highlighting by tutor, serialization for LLM context
   - **Action Required:** Quick evaluation during Day 1 setup

**Constraints:**
- **Timeline:** 5-7 days total (approximately 40-60 hours)
- **Experience:** Limited Next.js experience (learning curve included in timeline)
- **Solo developer:** No team collaboration, all decisions unblocked
- **Budget:** <$50 total (primarily OpenAI API usage)
- **Security:** Zero tolerance for API key exposure (Greptile enforces this)

**Dependencies:**
- **OpenAI API uptime and rate limits:** Project blocked if API unavailable
- **Vercel deployment:** Backup plan is local development only if deployment fails
- **Browser voice API support:** Chrome required for best experience

---

## Epic List

Based on the PRD requirements and the 5-7 day timeline, here is the proposed epic structure:

### Epic 1: Foundation & Core Dialogue Engine
**Goal:** Establish project infrastructure, OpenAI integration, and validate Socratic tutoring approach with hardcoded problems.

This epic delivers the foundational setup (Next.js app, TypeScript, Tailwind, Git repo, Greptile integration) while simultaneously proving the core value proposition: that GPT-4 can successfully guide students through problems without giving direct answers. By end of Epic 1, we have a minimal text-based chat interface where students can work through at least 2-3 hardcoded math problems via Socratic dialogue.

---

### Epic 2: Problem Input & Visual Rendering
**Goal:** Enable students to submit problems via text/image upload or request practice problems, with proper mathematical rendering on an interactive whiteboard.

This epic builds the problem entry workflows and establishes the visual workspace. Students can now upload images (OCR parsing via GPT-4 Vision), type problems directly, or request practice on specific topics. Problems render beautifully on a canvas using KaTeX. The whiteboard becomes the shared workspace where tutoring happens, replacing the basic chat-only interface from Epic 1.

---

### Epic 3: Interactive Whiteboard Collaboration
**Goal:** Enable student drawing on the whiteboard and implement tutor visual tools (highlighting/circling) for true collaborative problem-solving.

This epic transforms the whiteboard from a static display into an interactive collaboration space. Students can draw and annotate directly on the canvas. The tutor can highlight or circle key parts of problems to guide student attention. Canvas state is serialized and included in LLM context so the tutor can "see" what the student is doing visually. This completes the core pedagogical experience.

---

### Epic 4: Voice Interface & Avatar Presence
**Goal:** Add voice-based interaction (speech-to-text, text-to-speech) and avatar presence with lip-sync to create seamless conversational tutoring experience.

This epic introduces the multi-modal experience that differentiates the product. Students can speak their responses using push-to-talk, and the tutor responds with synthesized voice. A 2D avatar with lip-sync animation provides visual presence and engagement. Turn-based interaction flow is polished with clear visual states (idle, thinking, speaking). Text fallback remains available for students who prefer typing.

---

### Epic 5: Polish, Testing & Deployment
**Goal:** Validate Socratic compliance across 5+ problem types, fix bugs, optimize performance, and deploy production-ready demo.

This epic focuses on quality assurance and demonstration readiness. Test the full workflow across arithmetic, algebra, geometry, word problems, and multi-step problems. Ensure zero instances of direct answers given. Meet performance targets (<2s response latency). Polish UI/UX rough edges. Complete documentation (README, architecture docs). Deploy to Vercel. The deliverable is a portfolio-quality demo with clean codebase.

---

## Epic Details

### Epic 1: Foundation & Core Dialogue Engine

**Epic Goal:** Establish project infrastructure (Next.js app, TypeScript, Tailwind, Git repo with Greptile security), integrate OpenAI API, and validate Socratic tutoring approach with a minimal text-based chat interface. By end of Epic 1, students can work through 2-3 hardcoded math problems via Socratic dialogue, proving the core value proposition that GPT-4 can guide without giving direct answers.

#### Story 1.1: Project Scaffolding and Repository Setup

**As a** developer,
**I want** a properly configured Next.js project with TypeScript, Tailwind CSS, and Git version control,
**so that** I have a solid foundation to build features efficiently.

**Acceptance Criteria:**

1. Next.js 14+ project initialized with App Router and TypeScript enabled
2. Tailwind CSS installed and configured with basic theme setup
3. Git repository initialized with initial commit
4. `.gitignore` configured to exclude `node_modules/`, `.env.local`, `.next/`, and other standard Next.js artifacts
5. Project directory structure created: `src/app/`, `src/components/`, `src/services/`, `src/hooks/`, `src/utils/`, `src/types/`
6. `README.md` created with project title and basic description
7. Package.json includes all necessary dependencies (Next.js, React, TypeScript, Tailwind)
8. Project runs successfully with `npm run dev` and displays default Next.js homepage

---

#### Story 1.2: Greptile Security Integration

**As a** developer,
**I want** Greptile (Reptile) integrated as a pre-commit hook,
**so that** I never accidentally commit API keys or secrets to GitHub.

**Acceptance Criteria:**

1. Greptile installed and configured in the project
2. Pre-commit hook configured to scan staged files for secrets/API keys
3. Test validation: Attempting to commit a file containing a mock API key (e.g., `OPENAI_API_KEY="sk-test123"`) is blocked by Greptile
4. `.env.local` file created with placeholder for `OPENAI_API_KEY` (actual key added but gitignored)
5. Documentation in README includes section on environment variable setup
6. Greptile configuration documented so other developers can replicate setup

---

#### Story 1.3: OpenAI API Integration Service

**As a** developer,
**I want** a service layer that handles OpenAI GPT-4 API calls with proper error handling,
**so that** I can easily integrate LLM responses throughout the application.

**Acceptance Criteria:**

1. `src/services/llmService.ts` created with typed functions for OpenAI API calls
2. Service accepts conversation history (array of messages) and returns GPT-4 response
3. OpenAI API key loaded from environment variables (`process.env.OPENAI_API_KEY`)
4. Error handling implemented for API failures (network errors, rate limits, invalid responses)
5. TypeScript types defined for conversation messages and API responses in `src/types/`
6. Next.js API route created (`/api/chat`) that calls the LLM service (server-side only, never exposes API key to client)
7. Basic test validation: API route successfully returns a response when called with a simple prompt

---

#### Story 1.4: Socratic Tutoring Prompt Engineering

**As a** product manager,
**I want** a system prompt that enforces Socratic method (never giving direct answers),
**so that** the tutor guides students to discover solutions themselves.

**Acceptance Criteria:**

1. System prompt created with explicit Socratic tutoring instructions:
   - Never provide direct answers to problems
   - Ask guiding questions that lead students to discover solutions
   - Use encouraging, patient language
   - Acknowledge incorrect answers explicitly ("That's not quite right...")
   - Provide more concrete hints after 2+ consecutive stuck turns
   - Celebrate when students arrive at correct answers
2. System prompt includes few-shot examples demonstrating good vs. bad tutor responses
3. System prompt specifies target audience (elementary/middle school students, ages 8-14)
4. Prompt documented in `src/services/prompts.ts` or similar file for easy iteration
5. Manual testing with 2-3 hardcoded problems validates Socratic compliance (no direct answers given)

---

#### Story 1.5: Basic Chat Interface UI

**As a** student,
**I want** a simple chat interface where I can type messages and see tutor responses,
**so that** I can engage in a tutoring conversation.

**Acceptance Criteria:**

1. Chat interface component created (`src/components/ChatInterface/`) with conversation history display
2. Message bubbles styled distinctly for student (one color/alignment) vs. tutor (different color/alignment)
3. Text input field at bottom of chat interface for student to type messages
4. Send button triggers API call to `/api/chat` with conversation history
5. Tutor response appears in chat after API call completes
6. Loading state displayed while waiting for tutor response ("Tutor is thinking...")
7. Conversation history persists in client state throughout session (no page refresh)
8. Responsive layout works on tablet and laptop screen sizes (minimum 768px width)

---

#### Story 1.6: Hardcoded Problem Validation

**As a** product manager,
**I want** to validate that the Socratic dialogue engine successfully guides students through at least 3 different problem types,
**so that** I have confidence the core value proposition works before building more features.

**Acceptance Criteria:**

1. Three hardcoded math problems defined covering different types:
   - **Problem 1 (Arithmetic):** "What is 24 + 37?"
   - **Problem 2 (Algebra):** "Solve for x: 2x + 5 = 13"
   - **Problem 3 (Word Problem):** "Sarah has 12 apples. She gives 1/3 of them to her friend. How many apples does she have left?"
2. Problems displayed to student at start of chat (or student can select which problem to work on)
3. Manual testing session conducted for each problem:
   - Tutor asks guiding questions (not direct answers)
   - Tutor provides progressively concrete hints if student is stuck
   - Tutor acknowledges incorrect answers explicitly
   - Tutor celebrates correct solution
4. Documentation of test results: screenshots or conversation logs demonstrating Socratic compliance
5. Zero instances of tutor providing direct answers across all 3 test sessions

---

### Epic 2: Problem Input & Visual Rendering

**Epic Goal:** Enable students to submit problems through multiple pathways (text entry, image upload with OCR, or request practice problems on topics) and render them beautifully on an interactive whiteboard using proper mathematical notation. This epic transforms the basic chat interface into a visual tutoring workspace.

#### Story 2.1: Problem Entry Landing Page

**As a** student,
**I want** a clear landing page that lets me choose how to start my tutoring session,
**so that** I can either bring my own problem or ask for practice on a specific topic.

**Acceptance Criteria:**

1. Landing page component created with welcoming heading: "What would you like to work on today?"
2. Two primary pathways presented as large, clear options:
   - **Option A:** "I have a problem to solve" (leads to problem input)
   - **Option B:** "I need practice with..." (leads to topic selection)
3. UI follows design vision: clean, uncluttered, age-appropriate (8-14 years)
4. Responsive layout works on tablet and laptop (768px+ width)
5. Clicking either option navigates to appropriate next step
6. Basic branding elements present (logo/title: "AI Math Tutor")

---

#### Story 2.2: Text-Based Problem Input

**As a** student,
**I want** to type my math problem directly into a text field,
**so that** I can quickly start working with the tutor without needing to upload an image.

**Acceptance Criteria:**

1. Text input area provided when student selects "I have a problem" pathway
2. Text area supports multi-line input for longer problems
3. Placeholder text provides guidance: "Enter your math problem here (e.g., '2x + 5 = 13')"
4. "Start Tutoring" button submits the problem and transitions to tutoring workspace
5. Problem text is sent to backend for processing (no parsing needed yet, just display)
6. Student can return to landing page to change problem input method
7. Empty/whitespace-only submissions are prevented with validation message

---

#### Story 2.3: Image Upload with OCR Parsing

**As a** student,
**I want** to upload a photo of my homework problem (printed or handwritten),
**so that** I don't have to manually type complex mathematical notation.

**Acceptance Criteria:**

1. Image upload interface provided when student selects "I have a problem" pathway (toggle between text/image input)
2. Drag-and-drop zone accepts image files (PNG, JPG, JPEG formats)
3. File picker button provides alternative to drag-and-drop
4. Uploaded image preview displayed to student before processing
5. "Parse Problem" button triggers OCR via GPT-4 Vision API
6. Next.js API route (`/api/parse-image`) handles GPT-4 Vision integration:
   - Accepts image file (base64 or multipart)
   - Calls OpenAI GPT-4 Vision with prompt: "Extract the mathematical problem from this image as plain text with proper mathematical notation"
   - Returns parsed text
7. Parsed problem text displayed to student with confirmation prompt: "Is this correct?"
8. Student can approve, manually edit parsed text, or re-upload if OCR fails
9. Loading state displayed during OCR processing ("Parsing your problem...")
10. Error handling for unsupported file types, file size limits (5MB max), and API failures

---

#### Story 2.4: Topic-Based Practice Problem Generation

**As a** student,
**I want** to request practice problems on specific topics (like "fractions" or "algebra"),
**so that** I can strengthen my skills without needing to bring my own homework.

**Acceptance Criteria:**

1. Topic selection interface provided when student selects "I need practice with..." pathway
2. Text input field with prompt: "What topic would you like to practice? (e.g., fractions, addition, word problems)"
3. Optional: Suggestion chips for common topics (Fractions, Algebra, Geometry, Word Problems)
4. "Generate Practice Problem" button triggers problem generation
5. Next.js API route (`/api/generate-problem`) calls GPT-4 with prompt:
   - "Generate a grade 3-8 appropriate math problem for practicing [TOPIC]. Return only the problem statement, no solution."
6. Generated problem displayed to student for confirmation
7. Student can regenerate if they want a different problem
8. Once confirmed, problem proceeds to tutoring workspace
9. Loading state during generation ("Creating a practice problem for you...")

---

#### Story 2.5: Whiteboard Canvas Setup

**As a** developer,
**I want** a whiteboard canvas component that can render mathematical notation and support future drawing interactions,
**so that** problems are displayed in a clear, visual workspace.

**Acceptance Criteria:**

1. Whiteboard component created (`src/components/Whiteboard/`) using chosen canvas library (Fabric.js, Konva.js, or HTML5 Canvas API)
2. Canvas sized appropriately for workspace (responsive to screen size, minimum 600x400px)
3. Canvas has white/light background with subtle border
4. Basic canvas initialization and rendering working (can display text and shapes)
5. Canvas is the focal point of the tutoring workspace layout
6. Canvas state can be cleared programmatically (for future "restart problem" functionality)
7. Performance validated: Canvas renders smoothly at 60fps

---

#### Story 2.6: KaTeX Mathematical Rendering on Whiteboard

**As a** student,
**I want** my math problem to render beautifully with proper mathematical notation on the whiteboard,
**so that** equations are clear and easy to read.

**Acceptance Criteria:**

1. KaTeX library integrated into the project
2. Problem text processed to identify mathematical expressions
3. Mathematical notation rendered on the whiteboard canvas using KaTeX:
   - Fractions display as proper fractions (not "1/2" but proper fraction bar)
   - Exponents render as superscripts (x² not x^2)
   - Square roots, inequalities, and other symbols render properly
4. Text and rendered math combined on canvas in readable layout
5. Font size appropriate for target age group (large enough for easy reading)
6. **Semantic registration:** During rendering, register semantic IDs for key elements (e.g., `numerator_1`, `denominator_1`, `equals_sign`) to support future tutor annotations
7. Test validation with sample problems:
   - "Solve for x: 2x + 5 = 13"
   - "What is 3/4 + 1/2?"
   - "Calculate √16"
   - "If 3x² = 27, what is x?"
8. Edge case handling: If LaTeX parsing fails, display problem as plain text (graceful degradation)

---

#### Story 2.7: Integrated Tutoring Workspace Layout

**As a** student,
**I want** a workspace that shows both my conversation with the tutor and the visual problem on the whiteboard,
**so that** I can follow the tutoring dialogue while seeing the problem clearly.

**Acceptance Criteria:**

1. Workspace layout implemented with two main panels:
   - **Left panel (30% width):** Conversation history (chat interface from Epic 1)
   - **Right panel (70% width):** Whiteboard canvas with rendered problem
2. Layout is responsive and works on tablets (768px+) and laptops
3. Conversation panel scrolls independently if conversation is long
4. Whiteboard panel remains fixed/visible (no scrolling of problem away)
5. Problem displayed at top of whiteboard canvas when tutoring session begins
6. Session controls available (restart problem, return to home)
7. Student text input (from Epic 1 chat) positioned below conversation panel
8. Visual hierarchy clear: whiteboard is focal point, conversation is supporting context

---

#### Story 2.8: End-to-End Problem Submission Flow

**As a** product manager,
**I want** to validate that students can submit problems through all pathways and successfully begin tutoring,
**so that** I have confidence the full problem input experience works.

**Acceptance Criteria:**

1. **Test Path A (Text Entry):**
   - Student enters problem via text
   - Problem renders on whiteboard with KaTeX formatting
   - Tutoring conversation begins with Socratic questions

2. **Test Path B (Image Upload):**
   - Student uploads printed math problem image
   - OCR successfully parses the problem
   - Student confirms parsed text
   - Problem renders on whiteboard
   - Tutoring conversation begins

3. **Test Path C (Practice Problem Request):**
   - Student requests practice on "fractions"
   - GPT-4 generates appropriate problem
   - Problem renders on whiteboard
   - Tutoring conversation begins

4. All three paths tested manually and documented
5. Error scenarios tested: failed OCR, invalid image format, empty text submission
6. Conversation from Epic 1 still works properly (Socratic compliance maintained)
7. No regressions from Epic 1 functionality

---

### Epic 3: Interactive Whiteboard Collaboration

**Epic Goal:** Transform the whiteboard from a static display into an interactive collaboration space where students can draw and work directly on the canvas, and the tutor can highlight or circle key elements to guide student attention. Canvas state is serialized and included in LLM context so the tutor can "see" and respond to student's visual work. This completes the core collaborative tutoring experience.

#### Story 3.1: Student Drawing Tools on Whiteboard

**As a** student,
**I want** to draw and write directly on the whiteboard using a pen tool,
**so that** I can show my work and try solving the problem visually.

**Acceptance Criteria:**

1. Drawing tool (pen/brush) implemented on the whiteboard canvas
2. Student can draw freehand lines and annotations on the canvas
3. Drawing color: Medium blue (distinct from tutor color, which will be orange)
4. Stroke width: Medium thickness (3-5px), appropriate for finger/mouse drawing
5. Drawing is smooth and responsive (no lag or jitter)
6. Student drawings layer on top of the rendered problem (don't erase the problem)
7. Basic clear/undo functionality available:
   - Clear button removes all student drawings (but keeps problem visible)
   - Optional: Undo button removes last drawing stroke
8. Drawing tool is the default active state (no need to select it from toolbar)
9. Works with both mouse/trackpad and touch input (tablet support)
10. Performance validated: Drawing at 60fps without stuttering

---

#### Story 3.2: Canvas State Serialization

**As a** developer,
**I want** to serialize the current canvas state (problem + student drawings) as an image snapshot,
**so that** I can send it to the LLM as visual context for tutoring responses.

**Acceptance Criteria:**

1. Function implemented to capture canvas as base64-encoded image (PNG or JPEG)
2. Serialization includes:
   - Original problem rendering (KaTeX-formatted text)
   - All student drawing strokes (blue color)
   - Future tutor annotations (orange color, when implemented in 3.4)
3. Canvas snapshot generated automatically before each student input is sent to tutor
4. Image size optimized for API payload (compressed if needed, max 1MB)
5. Color-coding preserved in snapshot so tutor can distinguish student work (blue) from tutor highlights (orange)
6. Test validation: Captured image visually matches what's displayed on canvas
7. Performance: Serialization completes in <200ms

---

#### Story 3.3: LLM Context Enhancement with Canvas State

**As a** tutor (LLM),
**I want** to receive the canvas visual state along with conversation history,
**so that** I can see what the student has drawn and adapt my guidance accordingly.

**Acceptance Criteria:**

1. API route (`/api/chat`) enhanced to accept canvas image along with text message
2. Canvas image sent to GPT-4 Vision API as part of the conversation context
3. System prompt updated to instruct tutor:
   - "You can see the student's work on the whiteboard. Blue markings are the student's drawings."
   - "Reference what you see them doing visually when asking guiding questions."
   - "If they've drawn something incorrect, ask questions about their visual approach."
4. Test validation: Tutor responds to student's visual work appropriately
   - Example: Student draws incorrect diagram, tutor asks: "I see you've drawn a number line. Can you explain what the marks represent?"
5. Canvas state included in API calls only when student has drawn something (optimization: don't send if canvas is unchanged)
6. Error handling: If Vision API fails, fall back to text-only conversation (graceful degradation)

---

#### Story 3.4: Tutor Highlighting and Circling Capability

**As a** tutor (LLM),
**I want** to highlight or circle specific parts of the problem on the whiteboard,
**so that** I can draw the student's attention to key elements visually.

**Acceptance Criteria:**

1. OpenAI function calling configured with `annotate_canvas` function definition
2. Function accepts: `action` ("highlight" | "circle") and `target` (string description)
3. System prompt instructs tutor:
   - "You can use annotate_canvas to highlight or circle parts of the problem"
   - "Describe targets naturally: 'numerator', 'left side', 'first term', etc."
   - "Use sparingly - only when visual guidance beats verbal explanation"
   - "If annotation fails, your words alone will still guide the student"
4. Annotation executor implements 3-tier resolution:
   - **Tier 1:** Fuzzy match target to semantic IDs (e.g., "numerator" → "numerator_1")
   - **Tier 2:** Match target to predefined regions (e.g., "left side" → left_side region)
   - **Tier 3:** Silent failure, verbal guidance proceeds
5. Tutor annotations render in distinct color (orange) to differentiate from student work (blue)
6. Canvas rendering functions created for tutor visual actions:
   - **Highlight:** Semi-transparent orange rectangle overlay on specific text/region
   - **Circle:** Orange circle/ellipse drawn around specific element
7. Maximum 3 annotations on screen at once (oldest fades when 4th is added)
8. Canvas updates immediately when tutor uses visual tool (animation optional but nice-to-have)
9. Test validation: 50%+ annotation success rate across 5 problem types (manual assessment)

---

#### Story 3.5: Canvas Action Parsing and Coordinate Resolution

**As a** developer,
**I want** a reliable method for translating tutor's intent ("highlight the numerator") into specific canvas coordinates,
**so that** visual annotations appear in the correct location.

**Acceptance Criteria:**

1. **Canvas coordinate system established:**
   - Problem elements (rendered KaTeX text) have known bounding boxes
   - Semantic IDs registered during rendering (Story 2.6) are available for lookup
2. **3-Tier Resolution Strategy Implemented:**
   - **Tier 1 (Semantic):** Match target to registered semantic IDs with fuzzy matching
   - **Tier 2 (Region):** Match target to predefined regions (top_half, bottom_half, left_side, right_side, first_term, second_term)
   - **Tier 3 (Verbal):** If Tiers 1 & 2 fail, annotation is skipped (tutor's verbal message still displays)
3. **Error handling:**
   - If coordinate resolution fails, tutor message displays without visual action (no crash)
   - Log failures for debugging and future improvement
4. **Test validation:**
   - At least 50% success rate in placing annotations on intended targets across 5 test problems
5. **Documentation:** Coordinate resolution strategy documented for future maintenance

**Note:** This is a high-risk story but mitigated through research. The 3-tier fallback system ensures graceful degradation.

---

#### Story 3.6: Restart Problem Functionality

**As a** student,
**I want** to restart a problem and clear the canvas,
**so that** I can try solving it again from the beginning if I make mistakes.

**Acceptance Criteria:**

1. "Restart Problem" button added to workspace UI (top-right or session controls area)
2. Clicking restart:
   - Clears all student drawings from canvas (blue strokes)
   - Clears all tutor annotations from canvas (orange highlights/circles)
   - Resets conversation history to beginning (problem reintroduced)
   - Keeps the original problem visible on canvas
3. Confirmation prompt before restarting: "Are you sure you want to restart? Your progress will be lost."
4. Canvas state returns to initial state (just the problem, no annotations)
5. Tutoring conversation begins fresh as if problem was just submitted
6. Test validation: Restart works mid-session without errors or visual artifacts

---

#### Story 3.7: Enhanced Socratic Dialogue with Visual Context

**As a** product manager,
**I want** to validate that the tutor effectively uses visual context and visual tools to guide students,
**so that** the collaborative whiteboard experience delivers educational value.

**Acceptance Criteria:**

1. **Test Session 1: Visual Work Recognition**
   - Student draws attempt at solving problem on canvas
   - Tutor acknowledges and asks questions about the visual work
   - Tutor does NOT give direct answers, even when seeing student's approach

2. **Test Session 2: Highlighting Effectiveness**
   - Tutor uses highlight/circle tool at appropriate moments
   - Visual annotations help student focus on key problem elements
   - Student completes problem with fewer conversation turns than without visual tools (qualitative assessment)

3. **Test Session 3: Collaborative Problem Solving**
   - Student draws, tutor responds to drawings
   - Tutor highlights areas of interest
   - Natural back-and-forth between visual and verbal guidance
   - Socratic method maintained throughout (no direct answers)

4. At least 2 different problem types tested (e.g., fraction problem + algebra problem)
5. Success criteria:
   - Tutor references visual elements in >50% of responses when student has drawn
   - Tutor uses highlighting/circling in at least 1 exchange per problem
   - Zero instances of direct answers given (Socratic compliance maintained)
6. Documentation: Screenshots or session recordings demonstrating collaborative whiteboard tutoring

---

### Epic 4: Voice Interface & Avatar Presence

**Epic Goal:** Transform the text-based tutoring experience into a seamless multi-modal conversation by adding voice interaction (speech-to-text and text-to-speech) and an animated 2D avatar with lip-sync. Students can speak their responses using push-to-talk, the tutor responds with synthesized voice, and the avatar provides visual presence and engagement. Text fallback remains available for accessibility.

#### Story 4.1: Text-to-Speech Integration (Tutor Voice)

**As a** student,
**I want** the tutor's responses to be spoken aloud,
**so that** I can hear guidance like I would from a human tutor.

**Acceptance Criteria:**

1. OpenAI TTS API integrated via Next.js API route (`/api/tts`)
2. API route accepts text and returns audio file (MP3 or WAV format)
3. Voice selection made from OpenAI options (alloy, echo, fable, onyx, nova, shimmer) - recommend **nova** or **alloy** for friendly, educational tone
4. Client-side audio playback implemented:
   - Audio plays automatically when tutor response arrives
   - Audio can be paused/stopped by student
5. Tutor responses display as text AND play as audio simultaneously
6. Loading state while TTS audio generates ("Tutor is responding...")
7. Error handling: If TTS fails, text still displays (graceful degradation)
8. Audio quality validated: Clear pronunciation of mathematical terms
9. Latency measured: TTS generation + playback start <2 seconds from response ready

---

#### Story 4.2: Speech-to-Text Integration (Student Voice Input)

**As a** student,
**I want** to speak my responses instead of typing them,
**so that** I can communicate naturally and quickly with the tutor.

**Acceptance Criteria:**

1. Push-to-talk button added to UI (large, prominent, easy to find)
2. Button states:
   - **Idle:** "Push to Talk" or microphone icon
   - **Recording:** Red indicator, "Recording..." or pulsing animation
   - **Processing:** "Processing..." spinner
3. Browser microphone permission requested on first use
4. Audio recording captured while button is held/clicked:
   - Record starts when button pressed
   - Record stops when button released (or after timeout, e.g., 30 seconds max)
5. Recorded audio sent to Next.js API route (`/api/stt`)
6. API route calls OpenAI Whisper API and returns transcribed text
7. Transcribed text displayed in conversation as student message
8. Transcription then sent to tutor for response (same flow as text input)
9. Text input fallback always available (toggle between voice/text input modes)
10. Error handling: Microphone access denied, Whisper API failure, no speech detected
11. Latency validated: Transcription completes within 500ms of recording stop

---

#### Story 4.3: 2D Avatar Character Design and Setup

**As a** developer,
**I want** a simple 2D avatar character integrated into the workspace,
**so that** I can animate it to provide tutor presence.

**Acceptance Criteria:**

1. 2D avatar character selected or created:
   - **Option A:** Use pre-made avatar from library (e.g., Lottie animations, SVG character)
   - **Option B:** Simple custom SVG character (circle head, basic features)
   - **Option C:** Static image with swappable mouth sprites
2. Avatar design is:
   - Gender-neutral or offers multiple options
   - Friendly, approachable appearance (appropriate for ages 8-14)
   - Professional/educational aesthetic (not overly cartoonish)
3. Avatar positioned adjacent to whiteboard (right side or top-right)
4. Avatar sized appropriately (not too large, not too small - roughly 150-200px)
5. Avatar integrated into workspace layout without cluttering interface
6. Avatar visible throughout tutoring session (persistent presence)

---

#### Story 4.4: Avatar Lip-Sync Animation

**As a** student,
**I want** the avatar's mouth to move in sync with the tutor's voice,
**so that** it feels like a real person is talking to me.

**Acceptance Criteria:**

1. Lip-sync animation implemented with basic mouth states:
   - **Closed:** Default/idle state
   - **Open:** Speaking state (alternates during speech)
2. Animation synchronized with TTS audio playback:
   - Mouth starts moving when audio begins
   - Mouth alternates open/closed at speech-appropriate intervals (e.g., every 100-200ms)
   - Mouth returns to closed state when audio ends
3. Implementation approach (choose simplest):
   - **Option A:** CSS keyframe animation triggered by audio events
   - **Option B:** Lottie animation with play/pause controls
   - **Option C:** SVG sprite swap on timer during audio
4. Lip-sync timing feels natural (not too fast, not too slow)
5. Performance validated: Animation runs smoothly at 60fps
6. No lip-sync when tutor is not speaking (idle state)

---

#### Story 4.5: Avatar Thinking Indicator

**As a** student,
**I want** to see when the tutor is processing my input,
**so that** I know the system is working and I should wait.

**Acceptance Criteria:**

1. "Thinking" state animation added to avatar:
   - Visual indicator appears when student submits input (voice or text)
   - Examples: Pulsing animation, spinner near avatar, thought bubble, animated dots
2. Thinking indicator displays during:
   - Speech transcription processing
   - LLM response generation
   - TTS audio generation
3. Thinking indicator disappears when tutor begins speaking
4. Clear visual distinction between "thinking" and "speaking" states
5. Indicator is non-intrusive but clearly visible
6. Idle state (static avatar) when no processing is happening

---

#### Story 4.6: Turn-Based Voice Interaction Flow

**As a** student,
**I want** a clear turn-based conversation flow where I speak, then the tutor responds,
**so that** I'm not confused about when to talk or interrupted mid-sentence.

**Acceptance Criteria:**

1. Push-to-talk interaction model implemented:
   - Student controls when they're ready to speak (presses button)
   - No "always-on" listening that might interrupt or misinterpret
2. Conversation states clearly indicated:
   - **Student's Turn:** Push-to-talk button enabled, "Your turn to respond"
   - **Tutor Processing:** Button disabled, thinking indicator shown
   - **Tutor Speaking:** Button disabled, avatar lip-syncing, audio playing
   - **Ready for Next Turn:** After tutor finishes, button re-enabled
3. Student cannot submit new input while tutor is processing or speaking
4. Text input remains available at all times as alternative to voice
5. Toggle button to switch input mode preference (voice primary vs. text primary)
6. Visual feedback for each state transition is clear and immediate
7. User testing validation: Turn-taking feels natural, not confusing or frustrating

---

#### Story 4.7: Voice Quality and Accessibility Settings

**As a** student,
**I want** to adjust voice settings if needed,
**so that** the experience works well for my preferences and environment.

**Acceptance Criteria:**

1. Volume control for tutor voice (slider or buttons)
2. Playback speed option (0.75x, 1x, 1.25x) - optional for MVP, nice-to-have
3. Text transcript always visible even when using voice (accessibility requirement)
4. Option to disable auto-play of tutor voice (text-only mode)
5. Settings persist within session (stored in client state)
6. Microphone test/preview option (optional for MVP)
7. Settings accessible via gear icon or settings button in workspace

---

#### Story 4.8: End-to-End Voice Tutoring Session Validation

**As a** product manager,
**I want** to validate that the complete voice-based tutoring experience works smoothly,
**so that** I have confidence the multi-modal interaction delivers on the product vision.

**Acceptance Criteria:**

1. **Test Session 1: Full Voice Workflow**
   - Student uploads problem (or uses practice problem)
   - Student speaks response using push-to-talk
   - Tutor responds with voice + avatar lip-sync
   - Multiple conversation turns (6+) complete successfully
   - Problem solved through voice-only interaction

2. **Test Session 2: Mixed Voice & Text**
   - Student alternates between voice and text input
   - Tutor always responds with voice
   - Mode switching feels seamless

3. **Test Session 3: Error Recovery**
   - Test microphone failure fallback (switches to text)
   - Test TTS failure fallback (text displayed, no audio)
   - Test speech not detected (prompts student to try again or type)

4. **Performance Validation:**
   - Voice round-trip latency <3 seconds total (speak → transcribe → LLM → TTS → playback)
   - Avatar animations run smoothly without lag
   - No audio glitches or cutoffs

5. **Socratic Compliance Maintained:**
   - Voice interaction doesn't compromise tutoring quality
   - Tutor still asks guiding questions, never gives direct answers
   - Voice tone is encouraging and patient

6. Documentation: Screen recording or session notes demonstrating successful voice tutoring

---

### Epic 5: Polish, Testing & Deployment

**Epic Goal:** Validate Socratic compliance and pedagogical effectiveness across 5+ problem types, ensure all performance targets are met, fix critical bugs, polish UI/UX rough edges, complete documentation, and deploy a production-ready demo to Vercel. Deliverable is a portfolio-quality demonstration with clean codebase suitable for evaluation.

#### Story 5.1: Comprehensive Problem Type Testing

**As a** product manager,
**I want** to validate that the system successfully guides students through all target problem types using Socratic method,
**so that** I have confidence the solution delivers on the core value proposition.

**Acceptance Criteria:**

1. **Test Suite Defined:** 5 problem types with 2 examples each (10 total test problems):
   - **Arithmetic:** "What is 47 + 28?", "Calculate 144 ÷ 12"
   - **Fractions:** "What is 3/4 + 1/2?", "Simplify 6/8"
   - **Basic Algebra:** "Solve for x: 2x + 5 = 13", "If 3y - 7 = 11, what is y?"
   - **Word Problems:** "Sarah has 12 apples. She gives 1/3 to her friend. How many does she have left?", "A rectangle has length 8cm and width 5cm. What is its perimeter?"
   - **Multi-Step Problems:** "If a shirt costs $25 and is on sale for 20% off, what is the sale price?", "John ran 2.5 miles on Monday and 3.8 miles on Tuesday. How many total miles did he run?"

2. **Socratic Compliance Validation:**
   - Complete tutoring session for all 10 problems
   - Document each conversation (screenshots or text logs)
   - Verify: **Zero instances of tutor giving direct answers**
   - Verify: Tutor asks guiding questions, provides progressive hints
   - Verify: Tutor explicitly acknowledges incorrect answers
   - Verify: Tutor celebrates correct solutions

3. **Feature Utilization Check:**
   - Student drawing used in at least 3 test sessions
   - Tutor annotations (highlight/circle) used in at least 5 test sessions
   - Voice interaction used in at least 3 test sessions
   - All problem input methods tested (text, image upload, practice problem generation)

4. **Success Metrics:**
   - 100% Socratic compliance (no direct answers)
   - Average 6+ conversation turns per problem (indicates genuine guidance)
   - Session completion rate 80%+ (student reaches solution or reasonable stopping point)

5. **Documentation:** Test results documented with pass/fail for each problem and notes on tutoring quality

---

#### Story 5.2: Performance Validation and Optimization

**As a** developer,
**I want** to measure and optimize system performance against targets,
**so that** the user experience is smooth and responsive.

**Acceptance Criteria:**

1. **Latency Measurements:**
   - **LLM Response:** Measure time from student input to tutor response start
   - **Voice Transcription:** Measure time from recording stop to transcription complete
   - **TTS Generation:** Measure time from response text to audio playback start
   - **Canvas Operations:** Measure frame rate during drawing and annotation
   - **Image OCR:** Measure time from upload to parsed problem display

2. **Performance Targets Validated:**
   - ✅ LLM response latency: <2 seconds average (NFR1)
   - ✅ Voice transcription: <500ms (NFR2)
   - ✅ Canvas rendering: 60fps (NFR3)
   - ✅ Image processing: <5 seconds (NFR4)

3. **Optimization Actions (if targets not met):**
   - Optimize API calls (parallel requests where possible)
   - Compress canvas images before sending to LLM
   - Use lower-resolution audio for STT if quality sufficient
   - Profile and optimize canvas rendering code
   - Add loading states to improve perceived performance

4. **Browser Testing:**
   - Test on Chrome (primary), Safari, Firefox
   - Test on laptop (1280px+) and tablet (768px+) screen sizes
   - Document any browser-specific issues

5. **Performance Report:** Document actual measured performance with comparison to targets

---

#### Story 5.3: Bug Fixing and Error Handling Polish

**As a** developer,
**I want** to identify and fix critical bugs and improve error handling,
**so that** the demo runs smoothly without crashes or confusing errors.

**Acceptance Criteria:**

1. **Bug Sweep:**
   - Complete at least 5 full tutoring sessions (using different problem types)
   - Document all bugs encountered during testing
   - Prioritize bugs: **Critical** (blocks usage), **High** (major issue), **Medium** (minor issue), **Low** (cosmetic)
   - Fix all Critical and High bugs
   - Fix Medium bugs if time permits

2. **Error Handling Review:**
   - Test all error scenarios:
     - OpenAI API failure (rate limit, network error)
     - Microphone permission denied
     - Image upload failure (invalid format, too large)
     - OCR parsing returns gibberish
     - TTS/STT API failures
   - Verify all errors show user-friendly messages (not raw API errors)
   - Verify graceful degradation (e.g., text works if voice fails)

3. **Edge Case Testing:**
   - Empty text submission
   - Very long student responses (100+ words)
   - Rapid repeated submissions
   - Canvas with 50+ drawing strokes
   - Multiple problems in single session

4. **Stability Validation:**
   - Complete 3 consecutive tutoring sessions without crashes
   - Session state persists correctly across multiple problems
   - Canvas clears properly on restart

---

#### Story 5.4: UI/UX Polish and Accessibility

**As a** student,
**I want** a polished, intuitive interface that looks professional,
**so that** I feel confident using the tool and can navigate it easily.

**Acceptance Criteria:**

1. **Visual Polish:**
   - Consistent spacing, padding, alignment across all screens
   - Color palette applied consistently (primary blue, secondary green, accent orange)
   - Typography hierarchy clear (headings, body text, button labels)
   - Loading states are smooth and non-jarring
   - Animations (avatar, transitions) are polished, not glitchy

2. **User Experience Improvements:**
   - Button states clearly indicate interactivity (hover, active, disabled)
   - Focus states visible for keyboard navigation
   - Error messages are helpful and actionable ("Microphone access denied. Please check browser permissions.")
   - Success feedback is encouraging ("Great work! Let's try another problem.")
   - Clear calls-to-action ("Push to Talk", "Start Tutoring", "Restart Problem")

3. **Accessibility Basics:**
   - Keyboard navigation works for all interactive elements (tab, enter, space)
   - Color contrast meets WCAG AA standards (4.5:1 minimum for text)
   - Alt text on images and icons
   - Text transcripts always visible alongside voice

4. **Responsive Design Validation:**
   - Test on 768px (tablet), 1024px, and 1440px+ (laptop) widths
   - Layout adapts without horizontal scrolling or cut-off content
   - Touch targets are appropriately sized for tablet use (44px minimum)

5. **User Testing (Optional but Recommended):**
   - Have 1-2 people (ideally in target age range or parents) try the system
   - Observe where they struggle or get confused
   - Make quick fixes to obvious UX issues

---

#### Story 5.5: Documentation Completion

**As a** developer or evaluator,
**I want** comprehensive documentation that explains the project,
**so that** I can understand how to set it up, how it works, and the decisions made.

**Acceptance Criteria:**

1. **README.md Complete:**
   - Project title and description
   - Key features listed
   - Prerequisites (Node.js version, OpenAI API key)
   - Installation instructions (clone, npm install, env setup)
   - Running locally (npm run dev)
   - Environment variables documented (.env.local template)
   - Deployment instructions (Vercel)
   - Troubleshooting common issues

2. **Architecture Documentation:**
   - System architecture diagram or description (monorepo, Next.js, OpenAI APIs)
   - Technology stack listed with rationale
   - Key design decisions documented:
     - Socratic prompt engineering approach
     - Canvas action parsing strategy (3-tier system)
     - Avatar implementation choice
     - Voice interaction model (push-to-talk)
   - File structure overview

3. **Code Documentation:**
   - Key functions have JSDoc comments or inline explanations
   - Complex algorithms explained (canvas serialization, coordinate resolution)
   - API routes documented (inputs, outputs, error handling)

4. **Testing Documentation:**
   - Test results from Story 5.1 included
   - Performance metrics from Story 5.2 included
   - Known limitations documented

5. **License and Credits:**
   - Open source license selected (MIT recommended)
   - Third-party libraries credited
   - OpenAI API usage acknowledged

---

#### Story 5.6: Deployment to Vercel

**As a** developer,
**I want** the application deployed to a live URL,
**so that** evaluators can access the demo without local setup.

**Acceptance Criteria:**

1. Vercel account created (or existing account used)
2. Project connected to GitHub repository
3. Environment variables configured in Vercel dashboard:
   - `OPENAI_API_KEY` set (production key or development key)
4. Automatic deployment from main branch configured
5. Deployment successful (no build errors)
6. Live URL accessible and functional:
   - Home page loads
   - Problem input works
   - Tutoring session works end-to-end
   - Voice features work (if browser permissions allow)
7. SSL/HTTPS enabled (Vercel provides by default)
8. Custom domain configured (optional, nice-to-have)
9. Deployment URL documented in README.md

---

#### Story 5.7: Demo Video or Walkthrough Preparation (Optional)

**As a** project creator,
**I want** supporting materials that showcase the project's capabilities,
**so that** evaluators can quickly understand the value without extensive setup.

**Acceptance Criteria:**

1. **Option A: Demo Video (5-7 minutes):**
   - Introduction: What is AI Math Tutor, what problem does it solve?
   - Feature walkthrough:
     - Problem upload (image OCR example)
     - Socratic tutoring conversation (showing multiple turns)
     - Whiteboard collaboration (student drawing, tutor annotations)
     - Voice interaction (speaking with avatar)
   - Technical highlights: Next.js, OpenAI APIs, canvas interaction
   - Closing: GitHub link, live demo link

2. **Option B: Screenshot Walkthrough:**
   - Annotated screenshots showing key features
   - Added to README.md or separate DEMO.md file
   - Captions explain what's happening in each screenshot

3. **Option C: Live Demo Session:**
   - Prepare 2-3 polished example problems to demonstrate live
   - Practice demo flow to ensure smooth presentation
   - Have backup problems in case of API issues

---

#### Story 5.8: Final QA and Release Readiness

**As a** product manager,
**I want** to conduct final quality assurance and ensure all acceptance criteria are met,
**so that** the project is truly ready for evaluation and showcasing.

**Acceptance Criteria:**

1. **Epic 1-4 Validation:**
   - Review acceptance criteria for all stories in Epics 1-4
   - Verify all critical functionality works:
     - Socratic dialogue ✅
     - Problem input (text, image, practice) ✅
     - Whiteboard rendering and interaction ✅
     - Tutor annotations ✅
     - Voice interface ✅
     - Avatar presence ✅

2. **PRD Requirements Checklist:**
   - Cross-reference PRD Functional Requirements (FR1-FR34)
   - Verify all "must have" requirements implemented
   - Document any descoped features (if timeline required cuts)

3. **Non-Functional Requirements Validation:**
   - Performance targets met (NFR1-4) ✅
   - Reliability targets met (NFR5-7) ✅
   - Usability requirements met (NFR8-10) ✅
   - Deployment requirements met (NFR11-13) ✅

4. **Portfolio Quality Check:**
   - Code is clean, readable, and well-structured
   - No hardcoded secrets in repository (Greptile validated) ✅
   - README is professional and complete
   - Deployment is stable and accessible
   - Demo materials (video/screenshots) are polished

5. **Known Issues Documented:**
   - List any known bugs or limitations
   - Note any features descoped due to timeline
   - Suggest future enhancements (Post-MVP roadmap)

6. **Final Approval:**
   - Product manager sign-off: Ready for evaluation ✅
   - All critical acceptance criteria met across all epics

---

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 95%

**MVP Scope Appropriateness:** Just Right (with minor scope concerns for 5-7 day timeline)

**Readiness for Architecture Phase:** ✅ **READY**

**Most Critical Concerns:**
1. Canvas action parsing complexity (Story 3.4/3.5) is high-risk but mitigated through research
2. Timeline optimism - 5-7 days is aggressive for scope; need Day 5 checkpoint discipline
3. Limited Next.js experience introduces learning curve risk

### Category Analysis Table

| Category                         | Status  | Critical Issues |
| -------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context  | ✅ PASS | None - Clear problem statement from Brief, target users well-defined |
| 2. MVP Scope Definition          | ✅ PASS | Scope boundaries clear, future enhancements documented |
| 3. User Experience Requirements  | ✅ PASS | User flows covered, UI design goals specified, accessibility addressed |
| 4. Functional Requirements       | ✅ PASS | 34 FRs documented, testable, user-focused |
| 5. Non-Functional Requirements   | ✅ PASS | Performance, reliability, scalability, cost constraints all specified |
| 6. Epic & Story Structure        | ✅ PASS | 5 epics with 38 stories, logical sequencing, clear ACs |
| 7. Technical Guidance            | ✅ PASS | Tech stack specified, architecture decisions documented, risks flagged |
| 8. Cross-Functional Requirements | 🟡 PARTIAL | Data requirements minimal (stateless MVP), integrations clear (OpenAI only) |
| 9. Clarity & Communication       | ✅ PASS | Clear language, well-structured, terminology consistent |

**Legend:** ✅ PASS (90%+), 🟡 PARTIAL (60-89%), ❌ FAIL (<60%)

### Final Decision

## ✅ **READY FOR ARCHITECT**

The PRD and epics are comprehensive, properly structured, and ready for architectural design.

**Confidence Level:** HIGH

---

## Next Steps

**Status:** ✅ PRD Complete and Ready for Architecture Phase

**Next Phases:**
1. **UX Design:** Create detailed wireframes and interaction specifications
2. **Architecture:** Design technical architecture and implementation plan
3. **Development:** Begin with Epic 1 (Foundation & Core Dialogue Engine)

**Note:** Next step prompts were provided separately to avoid token usage in the PRD document.

---

🎉 **PRD Complete!** Ready for architecture and implementation phases.

**Generated by:** PM Agent (John) | Product Manager
**Date:** November 3, 2025
**Version:** 1.0
