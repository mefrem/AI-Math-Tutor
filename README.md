# AI Math Tutor

An AI-powered math tutoring application built with Next.js, TypeScript, and Tailwind CSS.

## Description

AI Math Tutor is a web application that provides interactive math tutoring through Socratic dialogue. Students can input math problems, work through solutions on a canvas, and receive guided feedback from an AI tutor.

## Prerequisites

- Node.js 18.17 or later
- npm 10.0 or later

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-math-tutor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Add your environment variables to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)

## Project Structure

```
ai-math-tutor/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Service layer
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   ├── lib/             # Infrastructure code
│   └── utils/           # Utility functions
├── public/              # Static assets
├── docs/                # Documentation
└── package.json         # Dependencies
```

## Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand 4.5+
- **Canvas Library**: Konva.js 9.3+
- **Math Rendering**: KaTeX 0.16+
- **LLM**: OpenAI GPT-4

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

