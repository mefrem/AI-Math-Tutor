# Agent Router MCP Server

This MCP server provides programmatic access to your Claude Desktop agents from Cursor.

## Overview

The Agent Router MCP Server exposes your agents as:

- **Tools** - Invoke agents directly with tasks
- **Resources** - Access agent definitions as resources
- **Prompts** - Use agents via prompt templates

## Available Agents

1. **scrum-story-master** (Bob) - Creates user stories and manages epics
2. **dev-story-implementer** (James) - Implements development stories
3. **qa-test-architect** (Quinn) - Conducts QA reviews and testing
4. **orca-orchestrator** - Orchestrates complete development workflows

## Tools

### `invoke_scrum_story_master`

Invoke the scrum-story-master agent.

**Parameters:**

- `task` (string, required): The task for the agent to handle
- `context` (object, optional): Additional context

### `invoke_dev_story_implementer`

Invoke the dev-story-implementer agent.

**Parameters:**

- `task` (string, required): The task for the agent to handle
- `context` (object, optional): Additional context

### `invoke_qa_test_architect`

Invoke the qa-test-architect agent.

**Parameters:**

- `task` (string, required): The task for the agent to handle
- `context` (object, optional): Additional context

### `invoke_orca_orchestrator`

Invoke the orca-orchestrator agent.

**Parameters:**

- `task` (string, required): The task for the agent to handle
- `context` (object, optional): Additional context

### `list_agents`

List all available agents with their descriptions.

### `get_agent_definition`

Get the full definition/content of a specific agent.

**Parameters:**

- `agent_name` (string, required): Name or alias of the agent

## Resources

Agents are available as resources with URIs like:

- `agent://scrum-story-master`
- `agent://dev-story-implementer`
- `agent://qa-test-architect`
- `agent://orca-orchestrator`

## Prompts

Agents can be invoked via prompts:

- `use_scrum_story_master`
- `use_dev_story_implementer`
- `use_qa_test_architect`
- `use_orca_orchestrator`

## Usage Examples

### Using Tools in Cursor

When you're in a Cursor conversation, you can now use these tools directly:

```
"Invoke the scrum-story-master agent to create a story for the login feature"
"Use the dev-story-implementer agent to implement story 2.1"
"Have the qa-test-architect review this implementation"
```

The MCP server will automatically:

1. Load the appropriate agent definition
2. Provide the agent's full context
3. Return the agent definition with your task

### Example Tool Call

```json
{
  "name": "invoke_scrum_story_master",
  "arguments": {
    "task": "Create a user story for implementing user authentication",
    "context": {
      "epic": "User Management",
      "priority": "high"
    }
  }
}
```

## Configuration

The server is configured in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "agent-router": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/.cursor/mcp-server/server.ts"],
      "cwd": "/path/to/project"
    }
  }
}
```

## Development

### Running the Server

```bash
cd .cursor/mcp-server
npm start
```

### Building

```bash
npm run build
```

### Testing

You can test the server by running it directly:

```bash
npx tsx server.ts
```

The server will listen on stdio for MCP protocol messages.

## Architecture

- **server.ts** - Main MCP server implementation
- **agent-loader.ts** - Utility functions for loading agent files
- **agents.json** - Agent metadata registry (in parent `.cursor/` directory)

## Troubleshooting

### Server Not Starting

1. Check that `tsx` is installed: `npm list tsx`
2. Verify the path in `mcp.json` is correct
3. Check Cursor's MCP logs for errors

### Agents Not Found

1. Verify agent files exist in `.claude/agents/`
2. Check `agents.json` has correct agent definitions
3. Ensure file paths are relative to project root

### Tool Not Available

1. Restart Cursor after updating `mcp.json`
2. Check MCP server is running (Cursor should show it in status)
3. Verify agent files are readable

## Next Steps

- The server automatically loads agents from `.claude/agents/`
- Add new agents by creating `.md` files in that directory
- Update `agents.json` with new agent metadata
- Restart Cursor to pick up new agents






