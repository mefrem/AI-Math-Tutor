# Database Schema

**Note:** The AI Math Tutor is architecturally **stateless with no database persistence** (PRD requirement). This eliminates ~6-10 hours of setup time and reduces operational complexity.

**Data Storage Strategy:**
- **Client-side:** All application state in Zustand stores
- **Server-side:** Stateless API routes (no session storage)
- **External:** No file storage (everything in-memory as base64)

**Post-MVP:** If persistence becomes a requirement, recommended approach is PostgreSQL via Supabase free tier with session/message/analytics tables.

---
