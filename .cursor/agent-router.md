# Agent Router Guide for Cursor

This guide explains how to use your Claude Desktop agents within Cursor.

## Available Agents

1. **scrum-story-master** (Bob) - Creates user stories and manages epics
2. **dev-story-implementer** (James) - Implements development stories
3. **qa-test-architect** (Quinn) - Conducts QA reviews and testing
4. **orca-orchestrator** - Orchestrates complete development workflows

## How to Use Agents in Cursor

### Method 1: Direct Context Loading (Recommended)

When you need a specific agent, mention it in your conversation and I'll load the agent's context:

**Example:**

- "Use the scrum-story-master agent to create a story for the login feature"
- "Switch to dev-story-implementer agent to implement story 2.1"
- "Activate the qa-test-architect to review the authentication implementation"

### Method 2: Agent Selection Commands

Use these commands to invoke agents:

- `@scrum-master` or `@bob` - Activate scrum-story-master
- `@developer` or `@james` - Activate dev-story-implementer
- `@qa` or `@quinn` - Activate qa-test-architect
- `@orca` - Activate orca-orchestrator (full workflow)

### Method 3: Agent Descriptions

Each agent has a description block that explains when to use them. I'll automatically route to the right agent based on your request.

## Agent Details

### scrum-story-master (Bob 🏃)

**Location:** `.claude/agents/scrum-story-master.md`
**Use When:**

- Creating user stories
- Managing epics
- Conducting retrospectives
- Need agile process guidance

**Commands:**

- `*help` - Show available commands
- `*draft` - Create a new user story
- `*story-checklist` - Review story draft
- `*exit` - Exit agent mode

### dev-story-implementer (James 💻)

**Location:** `.claude/agents/dev-story-implementer.md`
**Use When:**

- Implementing stories
- Need to write code following BMAD framework
- Debugging story-related code

**Commands:**

- `*help` - Show available commands
- `*develop-story` - Execute story implementation workflow
- `*review-qa` - Apply QA feedback
- `*run-tests` - Run test suite
- `*exit` - Exit agent mode

### qa-test-architect (Quinn)

**Location:** `.claude/agents/qa-test-architect.md`
**Use When:**

- Conducting QA reviews
- Making quality gate decisions
- Assessing test coverage
- Analyzing code/story quality

**Primary Function:**

- Reviews implementations
- Provides PASS/CONCERNS/FAIL/WAIVED decisions
- Creates QA gate files

### orca-orchestrator

**Location:** `.claude/agents/orca-orchestrator.md`
**Use When:**

- Need complete development workflow
- Want automated story → implementation → QA cycles
- Building entire epics autonomously

**Workflow:**

1. Story Creation (Scrum Master)
2. Implementation (Developer)
3. QA Review (QA)
4. Bug Resolution (if needed)
5. Repeat until complete

## Integration Notes

- Agents are stored in `.claude/agents/` directory
- Each agent has a YAML frontmatter with description and model info
- Agents follow BMAD Core framework conventions
- In Cursor, agents are invoked by loading their context

## Next Steps

To use an agent, simply mention it in your conversation, and I'll load the appropriate agent context and adopt that persona.






