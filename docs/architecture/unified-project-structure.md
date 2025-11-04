# Unified Project Structure

```
ai-math-tutor/
├── .github/workflows/         # CI/CD
├── .husky/                    # Git hooks (Gitleaks pre-commit)
├── public/                    # Static assets (avatar images)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API Routes (serverless backend)
│   │   ├── problem-input/
│   │   └── workspace/
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Services (frontend + backend)
│   ├── lib/                   # Infrastructure (OpenAI client, error handler)
│   ├── stores/                # Zustand state stores
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # Utility functions
├── docs/                      # Documentation
├── scripts/                   # Build/deployment scripts
├── .env.local                 # Environment variables (gitignored)
├── .env.example               # Environment template
├── gitleaks.toml              # Gitleaks configuration
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

---
