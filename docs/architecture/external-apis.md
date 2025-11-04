# External APIs

The AI Math Tutor integrates with **OpenAI's API suite** as the sole external service provider.

## OpenAI API

- **Purpose:** Provides all AI capabilities for the tutoring system
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL(s):**
  - `https://api.openai.com/v1/chat/completions` (GPT-4, GPT-4 Vision)
  - `https://api.openai.com/v1/audio/transcriptions` (Whisper STT)
  - `https://api.openai.com/v1/audio/speech` (TTS)
- **Authentication:** Bearer token (API key stored in `OPENAI_API_KEY` environment variable)
- **Rate Limits:** Tier 1+ recommended (3,500 requests/minute, 10,000 requests/day)
- **Cost estimate:** $10-30 for development + demo (within PRD budget)

**Key Endpoints:**

1. **POST /v1/chat/completions** - Socratic Dialogue (with function calling for canvas annotations)
2. **POST /v1/chat/completions** - Image OCR (GPT-4 Vision with base64 images)
3. **POST /v1/audio/transcriptions** - Speech-to-Text (Whisper, supports webm/mp3/wav)
4. **POST /v1/audio/speech** - Text-to-Speech (TTS, voice: "nova" recommended)

---
