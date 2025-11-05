# Agent Router MCP Server Setup Guide

## Quick Start

Your MCP server is already configured! Here's what you need to know:

## What Was Created

1. **MCP Server** (`.cursor/mcp-server/server.ts`)

   - Exposes your agents as MCP tools, resources, and prompts
   - Automatically loads agents from `.claude/agents/`

2. **Agent Loader** (`.cursor/mcp-server/agent-loader.ts`)

   - Utility functions to load and parse agent files
   - Handles agent metadata from `agents.json`

3. **MCP Configuration** (`~/.cursor/mcp.json`)
   - Already configured to use the agent router server
   - Uses stdio transport for Cursor integration

## How It Works

### 1. Agent Discovery

The server automatically discovers all agents in `.claude/agents/*.md`

### 2. Tool Registration

Each agent becomes an MCP tool:

- `invoke_scrum_story_master`
- `invoke_dev_story_implementer`
- `invoke_qa_test_architect`
- `invoke_orca_orchestrator`

### 3. Resource Access

Agents are available as resources:

- `agent://scrum-story-master`
- `agent://dev-story-implementer`
- etc.

### 4. Prompt Templates

Agents can be invoked via prompts:

- `use_scrum_story_master`
- `use_dev_story_implementer`
- etc.

## Using in Cursor

Once Cursor restarts, the MCP server will be available. You can:

### Direct Usage

Just mention the agent in your conversation:

```
"Invoke the scrum-story-master agent to create a story"
"Use the dev-story-implementer to implement story 2.1"
```

### Programmatic Access

The MCP tools are available to me (the AI assistant) automatically. I can:

- List all agents
- Get agent definitions
- Invoke agents with specific tasks
- Access agent content as resources

## Testing the Server

### Manual Test

```bash
cd /Users/maxefremov/Dev/week4/ai-math-tutor
npx tsx .cursor/mcp-server/server.ts
```

The server should start and wait for stdio input (MCP protocol messages).

### In Cursor

1. Restart Cursor
2. Check MCP status (should show "agent-router" as active)
3. Try using an agent in conversation

## Configuration

The MCP configuration is in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "agent-router": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/Users/maxefremov/Dev/week4/ai-math-tutor/.cursor/mcp-server/server.ts"
      ],
      "cwd": "/Users/maxefremov/Dev/week4/ai-math-tutor"
    }
  }
}
```

## Troubleshooting

### Server Not Starting

1. Check that `tsx` is installed: `npm list tsx`
2. Verify the path in `mcp.json` is correct (absolute path)
3. Check Cursor's MCP logs for errors

### Agents Not Found

1. Verify agent files exist in `.claude/agents/`
2. Check file names match agent names in `agents.json`
3. Ensure agent files are readable

### Tools Not Available

1. Restart Cursor after configuration changes
2. Check MCP server status in Cursor
3. Verify agent files have proper YAML frontmatter

## Adding New Agents

1. Create agent file in `.claude/agents/[agent-name].md`
2. Add metadata to `.cursor/agents.json`
3. Restart Cursor - the server will auto-discover new agents

## Architecture

```
.cursor/
├── mcp-server/
│   ├── server.ts          # Main MCP server
│   ├── agent-loader.ts    # Agent loading utilities
│   ├── tsconfig.json      # TypeScript config
│   └── README.md          # Full documentation
├── agents.json            # Agent metadata registry
└── README.md              # Overview
```

## Next Steps

1. **Restart Cursor** to load the MCP server
2. **Test agent invocation** in a conversation
3. **Verify tools are available** by checking MCP status
4. **Use agents programmatically** - I can now invoke them via MCP tools!

Your agents are now fully integrated into Cursor via MCP! 🎉

