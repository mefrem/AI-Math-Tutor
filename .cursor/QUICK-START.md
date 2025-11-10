# Quick Start: Using Your Agents in Cursor

## TL;DR

Just mention the agent name in your conversation, and I'll automatically load and use that agent!

## Examples

### Using Bob (Scrum Master)

```
"Use Bob (scrum-story-master) to create a story for the login feature"
"@bob, help me draft a new user story"
"Activate scrum-story-master to review this story draft"
```

### Using James (Developer)

```
"Switch to James (dev-story-implementer) to implement story 2.1"
"@james, use *develop-story to implement the current story"
"Activate dev-story-implementer for bug fixes"
```

### Using Quinn (QA)

```
"Have Quinn (qa-test-architect) review this implementation"
"@qa, review the authentication feature"
"Activate qa-test-architect for quality gate review"
```

### Using Orca (Orchestrator)

```
"Use Orca to work through all stories in the payment epic"
"@orca, start the full development cycle"
"Activate orca-orchestrator to continue development"
```

## How It Works

1. **You mention an agent** - By name, alias, or description
2. **I load the agent file** - From `.claude/agents/[agent-name].md`
3. **I adopt the persona** - Follow the agent's instructions and constraints
4. **Commands work** - Agent-specific commands like `*help`, `*develop-story`, etc.

## Agent Aliases

- **Bob** = scrum-story-master = @bob = story-master
- **James** = dev-story-implementer = @james = developer = @dev
- **Quinn** = qa-test-architect = @quinn = @qa = tester
- **Orca** = orca-orchestrator = @orca = orchestrator

## Helper Script

You can also use the helper script:

```bash
node .cursor/agent-helper.js list          # List all agents
node .cursor/agent-helper.js show bob       # Show agent details
node .cursor/agent-helper.js find scrum     # Find agent by query
```

## That's It!

No complex setup needed. Just mention the agent you need, and I'll handle the rest!






