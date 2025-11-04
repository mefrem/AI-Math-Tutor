# Introduction

This document outlines the complete fullstack architecture for **AI Math Tutor**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

The AI Math Tutor is a **serverless monolithic Next.js application** that leverages Next.js API Routes as the backend layer, eliminating the need for separate backend infrastructure. All AI capabilities (dialogue, vision, voice) are orchestrated through server-side API routes that interact with OpenAI's suite of APIs.

## Starter Template or Existing Project

**Assessment:** This is a **greenfield project** with no existing starter template specified in the PRD.

**Recommendation:** Using the official Next.js template (`npx create-next-app@latest` with TypeScript + Tailwind) for fastest path to working foundation with zero configuration conflicts.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-03 | 1.0 | Initial architecture document creation | Winston (Architect) |

---
