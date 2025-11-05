# Cursor Agent Integration

This directory contains configuration and helpers for using your Claude Desktop agents within Cursor.

## Quick Start

To use any of your agents in Cursor, simply mention the agent name or their alias in your conversation:

**Examples:**

- "Activate the scrum-story-master agent"
- "Use @bob to create a story"
- "Switch to James (dev-story-implementer) to implement story 2.1"
- "Let Quinn (qa-test-architect) review this implementation"

## Files

- `agent-router.md` - Complete guide on using agents
- `agents.json` - Agent registry with aliases and metadata
- `README.md` - This file

## How It Works

Unlike Claude Desktop, Cursor doesn't have a built-in agent invocation system. Instead:

1. **I'll load the agent's context** - When you mention an agent, I'll read their `.md` file from `.claude/agents/`
2. **I'll adopt the agent's persona** - I'll follow the agent's instructions and constraints
3. **I'll use the agent's commands** - Commands like `*help`, `*develop-story`, etc. will work

## Agent Routing

The AI assistant (me) will automatically:

- Detect when you need a specific agent based on your request
- Load the appropriate agent file
- Adopt that agent's persona and constraints
- Follow the agent's workflow and command structure

## Future Enhancements

Potential improvements:

- MCP server for programmatic agent invocation
- Custom Cursor commands that trigger agents
- Workflow automation scripts

For now, the conversational approach works seamlessly - just mention the agent you need!

