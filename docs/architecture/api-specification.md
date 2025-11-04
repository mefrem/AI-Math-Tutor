# API Specification

The AI Math Tutor uses **REST API** endpoints implemented as Next.js API Routes. All endpoints are serverless functions deployed on Vercel, proxying requests to OpenAI APIs with server-side API key management.

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: AI Math Tutor API
  version: 1.0.0
  description: REST API for AI-powered Socratic math tutoring with multi-modal interaction
servers:
  - url: https://ai-math-tutor.vercel.app/api
    description: Production (Vercel)
  - url: http://localhost:3000/api
    description: Local Development

paths:
  /chat:
    post:
      summary: Send student message and receive Socratic tutor response
      description: |
        Processes student input (text or transcribed voice) along with conversation history
        and optional canvas snapshot. Returns tutor's guiding question/response and any
        canvas annotation actions.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - sessionId
                - message
                - conversationHistory
              properties:
                sessionId:
                  type: string
                  description: Unique session identifier (UUID)
                  example: "550e8400-e29b-41d4-a716-446655440000"
                message:
                  type: string
                  description: Student's input message
                  example: "I think the answer is 8"
                conversationHistory:
                  type: array
                  items:
                    $ref: '#/components/schemas/ConversationMessage'
                  description: Complete conversation history for context
                canvasSnapshot:
                  type: string
                  format: byte
                  description: Base64-encoded PNG of current canvas state (optional)
      responses:
        '200':
          description: Successful tutor response
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    $ref: '#/components/schemas/ConversationMessage'
                  annotationActions:
                    type: array
                    items:
                      $ref: '#/components/schemas/AnnotationAction'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

  /parse-image:
    post:
      summary: Parse uploaded math problem image using OCR
      description: |
        Accepts an uploaded image (handwritten or printed math problem) and uses
        GPT-4 Vision to extract the mathematical problem as LaTeX-formatted text.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - image
              properties:
                image:
                  type: string
                  format: byte
                  description: Base64-encoded image (PNG, JPG, JPEG)
                  example: "data:image/png;base64,iVBORw0KGgoAAAANS..."
      responses:
        '200':
          description: Successfully parsed image
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  parsedContent:
                    type: string
                    description: Extracted problem in LaTeX format
                    example: "2x + 5 = 13"
                  confidence:
                    type: number
                    format: float
                    description: Parsing confidence (0-1)
                    example: 0.95
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

  /generate-problem:
    post:
      summary: Generate practice problem on specified topic
      description: |
        Creates a grade-appropriate math problem for the requested topic using GPT-4.
        Returns problem as structured MathProblem object.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - topic
              properties:
                topic:
                  type: string
                  description: Subject area for practice
                  example: "fractions"
                difficulty:
                  type: string
                  enum: [easy, medium, hard]
                  description: Optional difficulty level
                  example: "medium"
      responses:
        '200':
          description: Successfully generated problem
          content:
            application/json:
              schema:
                type: object
                properties:
                  problem:
                    $ref: '#/components/schemas/MathProblem'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

  /stt:
    post:
      summary: Convert speech audio to text
      description: |
        Transcribes student voice input using OpenAI Whisper API.
        Accepts audio in various formats (webm, mp3, wav).
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - audio
              properties:
                audio:
                  type: string
                  format: binary
                  description: Audio file from browser recording
      responses:
        '200':
          description: Successfully transcribed audio
          content:
            application/json:
              schema:
                type: object
                properties:
                  transcription:
                    type: string
                    example: "I think the answer is 8"
                  duration:
                    type: number
                    format: float
                    description: Audio duration in seconds
                    example: 2.3
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

  /tts:
    post:
      summary: Convert text to speech audio
      description: |
        Generates spoken audio of tutor response using OpenAI TTS API.
        Returns base64-encoded audio data.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - text
              properties:
                text:
                  type: string
                  description: Tutor's response text to speak
                  example: "That's not quite right. Let's think about what 2x means."
                voice:
                  type: string
                  enum: [alloy, echo, fable, nova, onyx, shimmer]
                  description: OpenAI TTS voice selection
                  default: nova
                  example: "nova"
      responses:
        '200':
          description: Successfully generated audio
          content:
            application/json:
              schema:
                type: object
                properties:
                  audioUrl:
                    type: string
                    description: Base64-encoded audio data (data:audio/mp3;base64,...)
                    example: "data:audio/mp3;base64,..."
                  duration:
                    type: number
                    format: float
                    description: Audio duration in seconds
                    example: 3.5
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalError'

components:
  schemas:
    ConversationMessage:
      type: object
      required:
        - id
        - role
        - content
        - timestamp
      properties:
        id:
          type: string
          example: "msg_123456"
        role:
          type: string
          enum: [student, tutor, system]
          example: "student"
        content:
          type: string
          example: "I think the answer is 8"
        timestamp:
          type: string
          format: date-time
          example: "2025-11-03T14:30:00Z"
        metadata:
          type: object
          properties:
            canvasSnapshot:
              type: string
              format: byte
            audioUrl:
              type: string
            annotationActions:
              type: array
              items:
                $ref: '#/components/schemas/AnnotationAction'

    MathProblem:
      type: object
      required:
        - problemId
        - source
        - rawContent
        - parsedContent
      properties:
        problemId:
          type: string
          example: "prob_789012"
        source:
          type: string
          enum: [text, image, generated]
          example: "text"
        rawContent:
          type: string
          example: "Solve for x: 2x + 5 = 13"
        parsedContent:
          type: string
          example: "2x + 5 = 13"
        topic:
          type: string
          example: "algebra"
        imageUrl:
          type: string
        difficulty:
          type: string
          enum: [easy, medium, hard]

    AnnotationAction:
      type: object
      required:
        - action
        - target
      properties:
        action:
          type: string
          enum: [highlight, circle]
          example: "highlight"
        target:
          type: string
          description: Natural language description of target element
          example: "the numerator"

    ApiError:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              example: "INVALID_INPUT"
            message:
              type: string
              example: "Message field is required"
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

  responses:
    BadRequest:
      description: Invalid request parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
    InternalError:
      description: Internal server error (OpenAI API failure, processing error)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ApiError'
```

---
