# Project Brief: AI Math Tutor

## Executive Summary

**AI Math Tutor** is an interactive Socratic learning assistant that guides elementary and middle school students through mathematical problems without giving direct answers. Unlike existing tools like Khan Academy, Photomath, or Symbolab that focus on answer delivery, this tutor creates a **seamless, conversational learning experience paired with interactive whiteboard collaboration** where students work alongside an AI tutor through multi-modal interaction (voice, text, and visual collaboration). The platform addresses the critical gap in current solutions: **responsiveness and attunement to the actual work students are doing in real-time**, creating a natural tutoring flow that adapts to individual student understanding levels.

**Core Value Proposition:** Transform math learning from answer-seeking to understanding-building through immersive conversational tutoring and collaborative whiteboarding that feels like having a patient human tutor sitting next to you at a shared workspace.

## Problem Statement

### Current State & Pain Points

**Existing math help tools fall into two categories, both inadequate:**

1. **Answer-Delivery Tools** (Photomath, Symbolab, Mathway)
   - Show step-by-step solutions but don't engage students in thinking
   - Students become dependent on getting answers rather than understanding methods
   - No conversational interaction or adaptation to student's actual understanding
   - Static, non-responsive to where students get stuck

2. **Video-Based Learning** (Khan Academy, YouTube tutorials)
   - One-way communication with no real-time feedback
   - Students can't ask clarifying questions or explore their specific confusion
   - Generic explanations that don't adapt to individual learning pace
   - Disconnected from the actual problem the student is working on

### The Core Problem

Students struggle with math homework because they lack **responsive, attuned guidance** that meets them where they are. When stuck, they either:
- Give up and don't complete the work
- Copy answers without understanding
- Wait for parent/teacher help that may not come or may not use effective pedagogy

**The Gap:** There's no tool that provides the experience of having a patient human tutor sitting next to you, watching you work, asking guiding questions, and collaborating on a shared workspace in real-time.

### Why Existing Solutions Fall Short

Current tools are **not responsive and attuned enough to the actual work that the student is doing**:
- They can't see what the student is trying and adapt questions accordingly
- They don't maintain context across multi-turn problem-solving
- They lack the natural, conversational flow of human tutoring
- They can't visually collaborate on the same problem space

### Impact & Urgency

- **Learning Efficacy:** Students learn to seek answers rather than develop problem-solving skills
- **Confidence:** Lack of understanding erodes mathematical confidence over time
- **Opportunity:** LLM advances (2024-2025) + real-time voice + vision capabilities now make this feasible
- **Market Timing:** Post-OpenAI/Khan Academy demo, there's clear proof-of-concept demand for conversational math tutoring

## Proposed Solution

### Core Concept & Approach

**AI Math Tutor** combines three key innovations into a unified learning experience:

1. **Conversational Socratic Tutoring**
   - Multi-turn dialogue that never gives direct answers, only guiding questions
   - Context-aware responses that adapt to student's demonstrated understanding
   - Encouraging, patient tone that builds confidence
   - Voice-first interaction with text fallback option

2. **Interactive Whiteboard Collaboration**
   - Shared visual workspace where problems are rendered and solved
   - Problems can come from student uploads (text/image) OR tutor-generated examples
   - Visual rendering of equations and solution steps (LaTeX/KaTeX)
   - Both student and tutor can interact with the canvas

3. **Adaptive Step Visualization**
   - Animated breakdown of solution approaches
   - Step-by-step progression that matches student's pace
   - Visual scaffolding that reinforces conceptual understanding

### Student Workflow

**Entry Point 1: Student Brings Problems**
- Upload problem via image (OCR/Vision LLM parsing) or text entry
- Problem renders on interactive whiteboard
- Tutor avatar appears and begins Socratic questioning
- Student works through problem with guidance via voice or text

**Entry Point 2: Student Requests Practice**
- Student asks for help with a general category (e.g., "I need help with fractions")
- Tutor generates appropriate example problems
- Problems render on whiteboard
- Same guided discovery flow

### Key Differentiators

**vs. Answer-Delivery Tools (Photomath, Symbolab):**
- We never give answers—students discover solutions through guided questioning
- Conversational, not transactional
- Collaborative whiteboard workspace vs. static solution display

**vs. Khan Academy/Video Learning:**
- Two-way real-time conversation vs. one-way video
- Responds to actual student work and confusion points
- Voice interface creates natural tutoring feel

**vs. OpenAI/Khan Academy Demo:**
- Addition of interactive whiteboard for visual collaboration
- Step visualization to reinforce learning
- Tutor can visually annotate and guide on shared canvas

### Interaction Model

**MVP Approach: Push-to-Talk / Turn-Based**
- Predictable, reliable interaction without interruption errors
- Student controls when they're ready to speak/submit input
- Simpler implementation reduces technical risk for 5-7 day timeline
- Post-MVP: Can add "always-on" listening mode as enhancement

### Whiteboard Collaboration Details

**Shared Canvas Model:**
- Student can draw, write, and work directly on the whiteboard
- Tutor can see all student canvas interactions as part of conversation context
- Tutor can proactively use visual tools when student needs support

**Tutor Visual Tools (Priority Order):**
1. **Highlighting/Circling** - Draw attention to key parts of the problem
2. **Drawing/Sketching** - Create visual aids (number lines, geometric shapes, diagrams)
3. **Step Annotations** - Write out intermediate steps or mathematical notation

**Implementation Note:** Tutor expresses intent via natural language → system translates to canvas actions

### Avatar Design

**MVP Specification:**
- 2D avatar character positioned next to whiteboard
- Lip-sync animation synchronized with text-to-speech output
- Conveys tutor presence and engagement during problem-solving session

### Why This Will Succeed

**Pedagogical Foundation:** Socratic method is proven for math learning; we're making it accessible at scale

**Technical Feasibility:** Convergence of LLM capabilities (2024-2025), real-time voice APIs, and web canvas technologies makes this achievable in 5-7 days

**User Experience Excellence:** Focus on "seamless" interaction through polished turn-taking, shared whiteboard collaboration, and responsive visual guidance creates differentiation through execution quality, not just feature checklist

## Target Users

### Primary User Segment: Elementary & Middle School Students (Ages 8-14)

**Demographic Profile:**
- **Age Range:** 8-14 years old (Grades 3-8)
- **Math Level:** Basic arithmetic through pre-algebra
- **Tech Comfort:** Digital natives comfortable with tablets/computers, familiar with voice interfaces (Siri, Alexa)
- **Learning Context:** Homework help, test preparation, concept reinforcement

**Current Behaviors & Workflows:**
- Use Google/YouTube to search for help when stuck
- Try answer-delivery apps (Photomath) to "get through" homework
- Ask parents/siblings for help (if available)
- Struggle silently and skip problems they can't solve
- Learn better through conversation and examples than reading

**Specific Needs & Pain Points:**
- Need patient guidance without judgment when confused
- Want to understand "why" not just "what" the answer is
- Get frustrated with textbook explanations that don't click
- Need visual aids and multiple explanation approaches
- Require encouragement to persist through difficult problems

**Goals They're Trying to Achieve:**
- Complete homework with understanding (not just answers)
- Build confidence in math abilities
- Prepare for tests and quizzes
- Develop problem-solving skills
- Feel successful and competent in mathematics

**Usage Pattern:**
- Session length: 10-30 minutes per problem/concept
- Frequency: 2-4 times per week during school year
- Context: After school, during homework time
- Device: Tablet or laptop with microphone access

### Secondary User Segment: Parents & Educators (Supervisors)

**Profile:**
- Parents helping with homework (may lack math confidence themselves)
- Teachers seeking supplemental tools for struggling students
- Tutors looking to augment their practice

**Their Needs:**
- Confidence that tool is pedagogically sound (not "cheating")
- Visibility into student's learning process
- Evidence that student is actually learning, not just getting answers

**Goals:**
- Support student independence in learning
- Reduce homework stress and conflict
- Supplement their own tutoring or teaching

## Goals & Success Metrics

### Business Objectives

- **Demonstrate Technical Capability:** Successfully implement complex multi-modal interaction (voice + whiteboard + LLM orchestration) within 5-7 day timeline
- **Showcase Differentiated UX:** Create a "seamless" tutoring experience that clearly stands apart from existing math help tools
- **Validate Pedagogical Approach:** Prove that Socratic AI tutoring works across 5+ problem types without giving direct answers
- **Portfolio Impact:** Deliver production-quality demo with clean code, documentation, and video that demonstrates advanced engineering skills

### User Success Metrics

- **Learning Engagement:** Student completes full problem-solving session (not just answer lookup)
- **Understanding Validation:** Student can articulate reasoning behind solution steps when prompted
- **Confidence Building:** Student attempts similar problems independently after tutoring session
- **Natural Interaction:** Student uses voice interface comfortably without friction or confusion
- **Visual Collaboration:** Student actively uses whiteboard to work through problems alongside tutor

### Key Performance Indicators (KPIs)

**Technical Success:**
- **Problem Type Coverage:** Successfully guides students through 5+ distinct problem types (arithmetic, algebra, geometry, word problems, multi-step)
- **Socratic Compliance:** 0 instances of tutor giving direct answers in test sessions
- **System Reliability:** <2% error rate in OCR parsing, voice transcription, and canvas rendering
- **Response Latency:** <2 seconds average from student input to tutor response start

**User Experience Success:**
- **Session Completion Rate:** >80% of started problem sessions reach solution
- **Conversation Depth:** Average of 6+ conversation turns per problem (indicates genuine guidance, not answer delivery)
- **Feature Utilization:** Tutor uses whiteboard tools (highlight/draw/annotate) in >60% of sessions where appropriate

**Demonstration Success:**
- **Demo Video Quality:** 5-minute walkthrough showing all core features with smooth, bug-free execution
- **Code Quality:** Clean repository structure, documented setup instructions, clear architectural decisions
- **Deployment:** Live URL or flawless local setup experience for evaluators

## MVP Scope

### Core Features (Must Have)

**1. Problem Input & Parsing**
- **Text Entry:** Direct text input for math problems
- **Image Upload:** OCR/Vision LLM parsing for uploaded problem images (both printed and handwritten)
- **Problem Generation:** Tutor can generate example problems based on student's requested topic/subject area (e.g., "addition", "fractions")
- **Initial Prompt:** Student chooses to either provide a problem OR request practice on a topic
- **Problem Rendering:** LaTeX/KaTeX rendering of parsed mathematical expressions on whiteboard
- **Rationale:** Flexible entry points support both homework help and practice workflows; Vision LLM handles handwritten as easily as printed

**2. Socratic Dialogue Engine**
- **LLM-Powered Tutoring:** Multi-turn conversation with strict "never give direct answers" prompt engineering
- **Context Maintenance:** Track conversation history and student's demonstrated understanding level
- **Adaptive Questioning:** Adjust hint difficulty based on student responses (more specific after 2+ stuck turns)
- **Encouraging Language:** Positive reinforcement and patient tone throughout
- **Solution Recognition:** Tutor recognizes when student arrives at correct answer, celebrates success, offers to start next problem
- **Rationale:** This is the pedagogical core—if Socratic method fails, the entire value proposition collapses

**3. Interactive Whiteboard**
- **Shared Canvas:** HTML5 Canvas or similar for rendering problems and collaboration
- **Student Drawing:** Student can draw/write directly on whiteboard with basic pen tool
- **Tutor Visual Tools:**
  - **Priority 1 (MVP):** Highlighting/circling capability (draw attention to key parts)
  - **Priority 2 (MVP if time):** Basic drawing/sketching (number lines, simple shapes)
  - **Priority 3 (Post-MVP):** Step annotations (write out intermediate steps)
- **Canvas Context:** All student canvas interactions visible to tutor LLM as context
- **Rationale:** Shared visual workspace is a key differentiator; prioritize highlighting as minimum viable collaboration

**4. Voice Interface**
- **Text-to-Speech:** Tutor responses spoken aloud (Web Speech API or similar)
- **Speech-to-Text:** Student can respond via voice (push-to-talk/turn-based interaction)
- **Text Fallback:** Option to type responses instead of speaking
- **Rationale:** Voice creates "seamless" conversational feel; turn-based reduces complexity vs. always-on

**5. Avatar Presence**
- **2D Character:** Simple 2D tutor avatar positioned next to whiteboard
- **Lip-Sync Animation:** Mouth movement synchronized with speech output
- **Rationale:** Essential for MVP to convey tutor presence and engagement; 2D keeps scope manageable

**6. Step Visualization**
- **Animated Breakdown:** Visual step-by-step display of solution approach as student progresses
- **Progressive Reveal:** Steps appear incrementally as student works through problem
- **Rationale:** Reinforces learning and provides visual scaffolding; differentiates from static problem displays

**7. Web Interface**
- **Clean Chat-Style UI:** Conversation history displayed alongside whiteboard
- **Problem Upload Area:** Clear interface for text entry or image upload
- **Responsive Design:** Works on tablet/laptop (primary devices for target age)
- **Rationale:** Professional, intuitive interface is non-negotiable for portfolio piece

### Out of Scope for MVP

- **Always-On Voice Mode:** Push-to-talk only for MVP reliability
- **Advanced Avatar Features:** No expressions, emotions, or 3D character (2D lip-sync only)
- **Difficulty Modes:** No grade-level adjustment for MVP (single difficulty tier)
- **User Accounts:** No login, persistence, or conversation history storage
- **Progress Tracking:** No learning analytics or parent dashboards
- **Mobile App:** Web-only (no native iOS/Android)
- **Advanced Canvas Tools:** No erasers, color pickers, shape tools for MVP
- **Multi-Language Support:** English only

### MVP Success Criteria

**The MVP is successful if:**
1. A student can upload (image), type a problem, OR request practice on a topic (e.g., "fractions")
2. The problem (provided or generated) correctly renders on the interactive whiteboard
3. The tutor avatar speaks and guides through Socratic questions (never giving direct answers)
4. The student can respond via voice or text through 6+ conversation turns
5. The tutor can highlight/circle parts of the problem on the shared whiteboard
6. Solution steps visualize progressively as student works through problem
7. The tutor recognizes correct answers, celebrates, and offers to start next problem session
8. The entire workflow executes smoothly in a 5-minute demo video across 5+ problem types
9. The codebase is clean, documented, and deployable

**Minimum viable feature set:** If time is tight, deprioritize step visualization and advanced canvas tools before cutting core Socratic dialogue or basic whiteboard collaboration.

## Post-MVP Vision

### Phase 2 Features (Post-5-7 Day Timeline)

**High-Value Enhancements:**

1. **Always-On Voice Mode**
   - Natural "conversation mode" like ChatGPT voice interface
   - Toggle between always-on and push-to-talk modes
   - Improved interruption handling and turn prediction
   - **Impact:** Maximum conversational naturalness

2. **Advanced Whiteboard Tools**
   - Full annotation suite (step-by-step mathematical notation)
   - Eraser, color selection, shape tools for student use
   - Tutor can write out intermediate steps visually
   - **Impact:** Richer visual collaboration capabilities

3. **Enhanced Avatar**
   - Facial expressions matching conversation context (encouraging, thinking, celebrating)
   - 3D character option with more personality
   - Gesture animations (pointing at whiteboard elements)
   - **Impact:** Increased engagement and emotional connection

**Polish & Accessibility:**

4. **Difficulty Modes**
   - Grade-level adjustment (elementary vs. middle school scaffolding)
   - Adaptive hint timing based on student performance
   - Customizable scaffolding intensity
   - **Impact:** Broader age range support

5. **User Accounts & Persistence**
   - Save conversation history across sessions
   - Track problems attempted and mastery progress
   - Parent/teacher dashboard with learning insights
   - **Impact:** Longitudinal learning support

6. **Mobile Optimization**
   - Responsive design for phone screens
   - Touch-optimized whiteboard controls
   - Mobile-friendly voice interaction
   - **Impact:** Accessibility for students without laptops/tablets

### Long-Term Vision (1-2 Years)

**Personalized Learning Ecosystem:**
- AI adapts to individual student's learning style and common mistake patterns
- Curriculum-aligned problem sets that match school coursework
- Integration with learning management systems (Google Classroom, Canvas)
- Multi-subject expansion beyond math (science, reading comprehension)

**Collaborative Learning:**
- Peer tutoring mode where students can help each other with AI guidance
- Teacher tools for assigning specific problems and monitoring progress
- Parent involvement features (notifications, progress reports, co-tutoring mode)

**Advanced Pedagogical Features:**
- Multiple representation modes (visual, symbolic, verbal, contextual)
- Metacognitive scaffolding (helping students reflect on their thinking)
- Error pattern analysis with targeted intervention
- Adaptive problem sequencing based on zone of proximal development

### Expansion Opportunities

**Adjacent Markets:**
- **Test Prep:** SAT/ACT math preparation with timed practice
- **Homeschooling:** Comprehensive curriculum support for homeschool families
- **Tutoring Augmentation:** Tools for human tutors to enhance their practice
- **International:** Multi-language support for global markets

**Technology Innovations:**
- **AR/VR Mode:** Immersive 3D space for geometry and spatial reasoning
- **Collaborative Multiplayer:** Students work together on problems in shared virtual space
- **Physical-Digital Hybrid:** Smart pen integration for seamless handwriting capture
- **Adaptive Voice Personas:** Student chooses tutor voice/personality style

## Technical Considerations

### Platform Requirements

**Target Platforms:**
- **Primary:** Web application (browser-based)
- **Browsers:** Chrome, Safari, Firefox (latest 2 versions)
- **Devices:** Laptop, desktop, tablet (iPad and Android tablets)
- **Screen Size:** Minimum 768px width (tablet landscape and up)

**Performance Requirements:**
- **Response Latency:** <2 seconds from student input to tutor response start
- **Voice Latency:** <500ms from speech end to transcription available
- **Canvas Rendering:** 60fps for smooth drawing and animations
- **Image Upload:** <5 seconds from upload to parsed problem on whiteboard

### Technology Stack (Confirmed)

**Frontend:**
- **Framework:** Next.js (React 18+ with TypeScript)
- **UI Library:** Tailwind CSS for rapid, responsive design
- **Canvas:** TBD during implementation (Fabric.js or Konva.js likely candidates)
- **Math Rendering:** KaTeX (fast, sufficient for target math level)
- **State Management:** Zustand or React Context

**Backend/API:**
- **Backend:** Next.js API Routes
- **LLM Provider:** OpenAI API
  - **Dialogue:** GPT-4 for Socratic tutoring (standard completion API)
  - **Vision:** GPT-4 Vision for OCR (handwritten + printed)
  - **Speech-to-Text:** OpenAI Whisper API
  - **Text-to-Speech:** OpenAI TTS API (voices: alloy, echo, nova)

**Database:**
- **MVP:** None (stateless sessions)
- **Post-MVP:** PostgreSQL or Firebase

**Hosting:**
- **Platform:** Vercel (optimal Next.js deployment)
- **Cost:** Free tier for demo/portfolio

### Architecture Considerations

**Repository Structure:**
```
ai-math-tutor/
├── src/
│   ├── components/          # React components
│   │   ├── Avatar/          # 2D avatar with lip-sync (implementation TBD)
│   │   ├── Whiteboard/      # Canvas interaction
│   │   ├── ChatInterface/   # Conversation UI
│   │   └── ProblemInput/    # Upload/text entry
│   ├── services/            # Business logic
│   │   ├── llmService.ts    # OpenAI integration
│   │   ├── voiceService.ts  # Speech APIs
│   │   └── canvasService.ts # Whiteboard actions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── docs/                    # Project documentation
└── README.md
```

**Service Architecture:**
- **Monorepo:** Single repo with frontend + Next.js API routes
- **LLM Orchestration:**
  - System prompt with strict Socratic constraints
  - Conversation history in component state
  - Canvas state serialized and included in LLM context
- **Real-time Flow:**
  1. Student input (voice/text) → Transcription → LLM
  2. LLM response → Parse for canvas actions → Render + execute
  3. OpenAI TTS + Lip-sync trigger → Avatar animation

**Integration Requirements:**
- **OpenAI API:** Single key for all services (GPT-4, Vision, Whisper, TTS)
- **Canvas Library:** TBD (Fabric.js or Konva.js)
- **Avatar Animation:** Implementation TBD (research needed)

**Security:**
- **API Keys:** Server-side only (Next.js API routes)
- **Student Data:** No PII collection for MVP
- **Content Safety:** Optional OpenAI moderation API

### Open Technical Questions (For PRD/Research Phase)

**High Priority Research Needs:**

1. **Canvas Action Parsing Strategy**
   - Work backwards from 5+ problem types: what needs highlighting/drawing?
   - How to reliably extract highlight coordinates from LLM responses?
   - Is structured output via function calling the best approach?
   - How to serialize canvas state for LLM context?
   - **Research Method:** Agentic deep-dive during PRD phase

2. **Avatar Implementation Options**
   - Lottie animations vs. CSS keyframes vs. react-speech-kit?
   - How to achieve reliable lip-sync with OpenAI TTS?
   - Performance considerations for 60fps rendering
   - **Research Method:** Technical spike with prototypes

3. **Voice Service Quality Validation**
   - Is Web Speech API quality sufficient for target age group?
   - When to fall back to OpenAI Whisper?
   - Browser compatibility testing strategy
   - **Research Method:** Quick prototypes + user testing

## Constraints & Assumptions

### Constraints

**Budget:**
- **API Costs:** ~$10-30 for OpenAI API usage during development and demo (GPT-4, Vision, Whisper, TTS)
- **Hosting:** $0 (Vercel free tier)
- **Total:** <$50 for entire project

**Timeline:**
- **Core MVP:** 5-7 days (approximately 40-60 hours)
- **Daily Breakdown:**
  - Day 1-2: Project setup, basic UI, OpenAI integration, hardcoded problem testing
  - Day 3-4: Whiteboard implementation, voice interface, avatar integration
  - Day 5: Polish, testing across 5+ problem types, bug fixes
  - Day 6-7 (optional): Documentation, demo video, stretch features
- **Hard Deadline:** Must be demo-ready by end of Day 7

**Resources:**
- **Team:** Solo developer (you)
- **Experience:** Limited Next.js experience (learning curve included)
- **Time Availability:** Assuming near full-time availability during 5-7 day period
- **Dependencies:** OpenAI API uptime and rate limits

**Technical:**
- **Browser Requirements:** Must work in modern browsers with Web Speech API support (Chrome, Safari, Edge)
- **Device Support:** Desktop/laptop priority; tablet secondary; no mobile phone optimization
- **No Backend Infrastructure:** Serverless only (Next.js API routes), no separate backend server
- **Stateless:** No user persistence or session storage beyond current browser session

### Key Assumptions

**Technical Assumptions:**
- OpenAI GPT-4 Vision can reliably parse both handwritten and printed math problems
- OpenAI Whisper API provides sufficient quality and latency for conversational flow
- Canvas library (Fabric.js/Konva.js) can handle real-time drawing and LLM-driven actions
- OpenAI function calling or structured output can reliably extract canvas action coordinates
- Canvas state can be serialized as image snapshots with color-coded annotations (tutor vs student)
- OpenAI TTS + Whisper latency (<2-3 sec round-trip) is acceptable for conversational flow
- KaTeX can render all math notation needed for grades 3-8

**User Assumptions:**
- Students have access to devices with microphone and camera/upload capability
- Students are comfortable speaking to a computer (digital native generation)
- 10-30 minute session length is appropriate for target age group's attention span
- Parents/educators will recognize Socratic method as legitimate pedagogy (not "cheating")

**Pedagogical Assumptions:**
- Socratic questioning is effective for elementary/middle school math
- Students will engage authentically (not just try to get answers)
- Voice + visual collaboration creates better learning than text-only chat
- Celebration of correct answers provides sufficient motivation

**Scope Assumptions:**
- 5+ problem types (arithmetic, algebra, geometry, word problems, multi-step) are sufficient to prove concept
- Printed + handwritten OCR covers >90% of real-world problem input needs
- Turn-based voice interaction is "seamless enough" for MVP (always-on not required)
- 2D avatar with lip-sync provides sufficient presence (no expressions needed initially)

**Project Assumptions:**
- This is a portfolio/demonstration project, not commercial product
- Success = demonstrating technical capability + pedagogical approach, not scale/revenue
- Clean code and documentation are as important as features
- Evaluators will assess both technical execution and product thinking

## Risks & Open Questions

### Key Risks

**1. LLM Prompt Engineering Complexity (HIGH)**
- **Risk:** Getting the Socratic method right is harder than expected—LLM might give direct answers despite prompts, or questions might be too vague/confusing for students
- **Impact:** Core value proposition fails; becomes just another answer bot
- **Mitigation:**
  - Validate prompt engineering on Day 1-2 with hardcoded problems before building UI
  - Test across all 5+ problem types early
  - Include explicit examples in system prompt of good vs. bad responses
  - Use few-shot prompting with example conversations
  - Follow guidelines from project spec: Provide concrete hints after 2+ stuck turns

**2. Canvas Action Coordination (HIGH)**
- **Risk:** Translating LLM intent ("highlight the numerator") to canvas coordinates is technically complex and unreliable
- **Impact:** Whiteboard collaboration feature feels broken or is cut from MVP
- **Mitigation:**
  - Use OpenAI function calling with structured output for canvas actions
  - Canvas state serialized as image snapshots with color-coded annotations (tutor = one color, student = another)
  - Fallback: Manual coordinate specification for demo problems if parsing fails
  - **Deprioritize if blocking** (cut to post-MVP)
  - **Research phase agentic investigation** to solve before implementation

**3. Next.js Learning Curve (MEDIUM)**
- **Risk:** Limited Next.js experience slows development; debugging takes longer than expected
- **Impact:** Timeline slips; features get cut
- **Mitigation:**
  - Start with Next.js tutorial/boilerplate on Day 1
  - Use ChatGPT/Claude for Next.js-specific questions
  - Keep architecture simple (avoid advanced patterns)
  - Have React-only fallback plan if Next.js blocks progress

**4. Time Estimation Accuracy (MEDIUM)**
- **Risk:** 5-7 days is optimistic; avatar, whiteboard, voice, and Socratic dialogue are each substantial
- **Impact:** Incomplete demo; rushed code quality; missing stretch features
- **Mitigation:**
  - Ruthless prioritization: Socratic dialogue + basic whiteboard > everything else
  - Day 5 checkpoint: assess what's working, cut liberally
  - Step visualization and avatar enhancements are first to cut
  - Focus on one polished workflow over many half-done features
  - **Target: 5 problem types working well** (quality over quantity)

**5. OCR Parsing Reliability (LOW-MEDIUM)**
- **Risk:** Handwritten math problems misparse, especially with ambiguous notation (e.g., "x" vs. "×", "1" vs. "l")
- **Impact:** Problem input frustrates users; requires manual correction
- **Mitigation:**
  - Test with real handwritten examples early
  - **Include re-upload button and manual text entry after OCR parsing**
  - Allow students to edit parsed text before starting
  - Vision LLM generally robust for this task

**6. Avatar Implementation Complexity (LOW-MEDIUM)**
- **Risk:** Lip-sync animation harder than expected; performance issues; looks awkward
- **Impact:** Avatar feels like gimmick rather than presence
- **Mitigation:**
  - Use proven library (react-speech-kit, Lottie, or similar)
  - Simple animation better than complex but buggy
  - **Avatar states: thinking indicator (when processing) + lip-sync (during speech) + static (idle)**
  - Can use static avatar with basic mouth animation as fallback
  - Deprioritize if blocking other features

### Open Questions (Decisions Made)

**Technical Design:**
1. **Canvas state serialization:** ✅ Image snapshot with color-coded annotations (tutor vs student highlights/drawings)
2. **Canvas action format:** → Pass to research phase (agentic investigation)
3. **API approach:** ✅ Standard completion API (not streaming) - questions are short enough
4. **Conversation history limits:** Not a concern for MVP (short sessions)

**User Experience:**
5. **Whiteboard controls:** ✅ Include clear/restart button
6. **Tutor state indication:** ✅ Show "thinking" indicator when processing; no idle animation, only animate during speech
7. **Avatar idle state:** ✅ Static when not speaking
8. **OCR failure handling:** ✅ Re-upload button + manual text entry option

**Pedagogical Approach:**
9. **Hint levels:** ✅ Follow project spec guidance (more concrete hints after 2+ stuck turns)
10. **Incorrect answers:** ✅ Acknowledge explicitly ("That's not quite right, let's think about...")
11. **Gaming/guessing:** Not optimizing for this in MVP
12. **Encouragement balance:** ✅ Authentic validation/invalidation without artificial "challenge"

**Scope Prioritization:**
13-14. **Minimum feature set:** Decide at Day 5 checkpoint during development
15. **Problem type target:** ✅ 5 problem types working well (not 10 working adequately)

**Demo Strategy:**
16-18. **Demo video:** Handled by you (not in project scope)

### Areas Needing Further Research

**Pre-Implementation Research (Critical):**

1. **Canvas Action Parsing Deep Dive** ← HIGHEST PRIORITY
   - Map 5 problem types to required visual actions
   - Design structured output schema for canvas commands (function calling approach)
   - Prototype coordinate extraction from LLM responses
   - Validate image snapshot + color-coding approach
   - **Research Method:** Agentic investigation during PRD phase

2. **Avatar Lip-Sync Solutions**
   - Evaluate react-speech-kit, Lottie, Web Animations API
   - Test lip-sync timing with OpenAI TTS
   - Implement thinking indicator (spinner, pulsing, etc.)
   - Identify lightest-weight solution that works

3. **Socratic Prompt Engineering**
   - Research best practices for "never give answers" constraints
   - Study example Socratic dialogues for math
   - Build prompt template with few-shot examples
   - Include explicit incorrect answer acknowledgment patterns

**Day 1-2 Validation (Early Testing):**

4. **Math Rendering Scope**
   - Confirm KaTeX handles all grade 3-8 notation
   - Test edge cases (fractions, exponents, square roots, geometry symbols)

5. **OpenAI API Integration**
   - Validate Whisper STT latency and quality
   - Test TTS voice options (alloy, echo, nova)
   - Measure round-trip latency (speech → transcription → LLM → TTS → audio)

## Next Steps

### Immediate Actions

1. **Technical Research Phase** (Before Development Starts)
   - Launch agentic research on canvas action parsing strategy
   - Investigate avatar lip-sync implementation options
   - Draft initial Socratic system prompt with few-shot examples

2. **Environment Setup** (Day 1 Morning)
   - Create Next.js project with TypeScript
   - Install dependencies (Tailwind, KaTeX, canvas library TBD, Zustand)
   - Set up OpenAI API integration (all services: GPT-4, Vision, Whisper, TTS)
   - Configure Vercel deployment pipeline

3. **Early Validation** (Day 1 Afternoon - Day 2)
   - Test Socratic prompt engineering with hardcoded problems
   - Validate OpenAI Whisper + TTS latency and quality
   - Confirm KaTeX rendering for target math notation
   - Prototype basic Next.js + OpenAI integration

4. **Core Development Sprint** (Day 2-4)
   - Build problem input interface (text + image upload)
   - Implement whiteboard with student drawing capability
   - Integrate voice interface (Whisper STT + OpenAI TTS)
   - Develop avatar with lip-sync and thinking indicator
   - Implement tutor visual tools (highlighting priority #1)

5. **Testing & Polish** (Day 5)
   - Test across 5 problem types (arithmetic, algebra, geometry, word problems, multi-step)
   - Validate Socratic compliance (0 direct answers)
   - Assess what's working; cut features if needed
   - Bug fixes and UX refinement

6. **Documentation & Deployment** (Day 6-7, Optional)
   - Write README with setup instructions
   - Document architecture decisions and prompt engineering approach
   - Deploy to Vercel
   - Demo video creation (handled by project owner)

### PM Handoff

This Project Brief provides the full context for **AI Math Tutor - Socratic Learning Assistant**.

**For the Product Manager (next phase):**

Please start in **PRD Generation Mode**, review this brief thoroughly, and work with the user to create the PRD section by section. Pay special attention to:

**Critical PRD Focus Areas:**

1. **Canvas Action Parsing** (Highest Priority Research Need)
   - This is the most complex technical challenge
   - Requires agentic investigation before implementation
   - Work backwards from 5 problem types to define action taxonomy
   - Design structured output schema for LLM → canvas commands

2. **Socratic Dialogue Specification**
   - Define exact prompt engineering approach
   - Create few-shot examples for each problem type
   - Specify hint escalation logic (after 2+ stuck turns)
   - Document incorrect answer acknowledgment patterns

3. **Feature Prioritization Matrix**
   - Day-by-day development plan with fallback options
   - Clear "must have" vs. "nice to have" vs. "cut if needed" tiers
   - Day 5 checkpoint criteria for scope adjustment

4. **Technical Specifications**
   - Detailed API integration patterns (OpenAI services)
   - Canvas library selection and justification
   - Avatar implementation approach
   - State management and conversation flow architecture

5. **Testing Strategy**
   - 5 problem types with example problems for each
   - Success criteria validation approach
   - Socratic compliance testing methodology

**Key Constraints to Remember:**
- 5-7 day timeline (solo developer)
- Limited Next.js experience (learning curve)
- OpenAI API as single dependency (minimize complexity)
- Portfolio/demo context (not production product)

**Open Technical Questions to Resolve:**
- Canvas action parsing strategy (requires research)
- Avatar lip-sync implementation choice
- Canvas library selection (Fabric.js vs. Konva.js)

Please ask clarifying questions as needed and suggest improvements to the approach outlined in this brief.

---

**Project Brief Complete** | Generated: November 3, 2025 | Version 1.0

