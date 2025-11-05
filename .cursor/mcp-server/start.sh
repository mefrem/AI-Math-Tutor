#!/bin/bash
# Startup script for Agent Router MCP Server

cd "$(dirname "$0")/../.."
npx tsx .cursor/mcp-server/server.ts


