#!/bin/bash
# Script to clear Next.js build cache and restart dev server
# Usage: ./clear-cache.sh

echo "Clearing Next.js build cache..."

# Kill any running dev server
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clear Next.js build directory
rm -rf .next

# Clear any other Next.js cache directories
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

# Clear node_modules cache
rm -rf node_modules/.cache 2>/dev/null || true

# Clear webpack cache if it exists
rm -rf .next/cache 2>/dev/null || true

echo "Cache cleared! Starting dev server..."
npm run dev

