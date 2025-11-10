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

### Setting Up Environment Variables

1. Copy the example file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and replace placeholder values with your actual API keys:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important Security Notes:**

- `.env.local` is gitignored and will **never** be committed to the repository
- Never commit API keys or secrets to the repository
- Use `.env.example` as a template for required environment variables
- The pre-commit hook (Gitleaks) will block commits containing secrets

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

## Security & Secret Scanning

This project uses **Gitleaks** to prevent accidental commits of API keys and secrets.

### How It Works

- **Gitleaks** scans staged files before each commit
- If secrets are detected, the commit is blocked
- The pre-commit hook runs automatically via **Husky**

### Configuration

- Gitleaks configuration: `gitleaks.toml`
- Pre-commit hook: `.husky/pre-commit`
- Husky manages git hooks automatically

### Bypassing the Hook (Emergency Only)

If you need to bypass the hook for an emergency (not recommended):

```bash
git commit --no-verify -m "your message"
```

**Warning:** Only bypass the hook in genuine emergencies. Never commit secrets, even with `--no-verify`.

### Adding Custom Patterns

To add custom secret patterns, edit `gitleaks.toml`:

```toml
[[rules]]
id = "custom-pattern"
description = "Custom secret pattern"
regex = '''your-regex-pattern'''
```

### Troubleshooting

**Issue:** Hook not running

- Solution: Run `npm install` to ensure Husky is set up (prepare script runs automatically)

**Issue:** False positives

- Solution: Add patterns to `gitleaks.toml` allowlist in the `[[allowlists]]` section

**Issue:** Gitleaks not found

- Solution: Install Gitleaks via Homebrew: `brew install gitleaks`
  - Or download from: https://github.com/gitleaks/gitleaks/releases

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment to Vercel

This application is optimized for deployment on Vercel, the platform built by the creators of Next.js.

### Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- An OpenAI API key

### Deployment Steps

1. **Connect Your Repository**
   - Go to [vercel.com](https://vercel.com) and log in
   - Click "Add New..." → "Project"
   - Import your GitHub/GitLab/Bitbucket repository
   - Vercel will automatically detect the Next.js configuration

2. **Configure Environment Variables**
   - In the Vercel project configuration screen, add environment variables:
     - `OPENAI_API_KEY` - Your OpenAI API key (required)
   - These variables should be set for Production, Preview, and Development environments

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application automatically
   - Monitor the build logs for any errors
   - Once complete, you'll receive a deployment URL (e.g., `your-project.vercel.app`)

4. **Verify Deployment**
   - Visit your deployment URL
   - Test the following features:
     - Landing page loads correctly
     - Problem input (text and image upload)
     - Tutoring workspace with whiteboard
     - Chat functionality with AI tutor
     - Text-to-speech (TTS) for tutor responses
     - Speech-to-text (STT) for student input
     - 2D avatar rendering and lip-sync

### Automatic Deployments

Once connected, Vercel will automatically:
- Deploy the `main` branch to production
- Create preview deployments for pull requests
- Rebuild on every push to the repository

### Configuration Files

- **`.env.example`** - Template for required environment variables
- **`vercel.json`** - Vercel-specific configuration (function timeouts, build settings)

### Important Notes

- **API Timeouts**: The `vercel.json` file configures a 60-second timeout for API routes to accommodate OpenAI API calls
- **Static Assets**: The `public/` directory (including VRM avatar models) is automatically deployed as static assets
- **Serverless Functions**: All API routes (`/api/*`) are deployed as serverless functions
- **No Database Required**: The application is stateless and doesn't require a database setup

### Troubleshooting

**Build Failures**
- Check build logs in Vercel dashboard
- Ensure all dependencies are listed in `package.json`
- Verify TypeScript compilation succeeds locally: `npm run build`

**Environment Variables**
- Ensure `OPENAI_API_KEY` is set in Vercel project settings
- Variables must be configured for the appropriate environments (Production/Preview/Development)

**API Errors**
- Check function logs in Vercel dashboard
- Verify OpenAI API key is valid and has sufficient credits
- Check for rate limiting issues with OpenAI API

### Custom Domain (Optional)

To use a custom domain:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## License

MIT
