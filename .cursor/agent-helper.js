#!/usr/bin/env node
/**
 * Agent Helper Script
 * Helps identify and load agents for Cursor integration
 */

const fs = require("fs");
const path = require("path");

const AGENTS_DIR = path.join(__dirname, "..", ".claude", "agents");
const AGENTS_CONFIG = path.join(__dirname, "agents.json");

function loadAgentsConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(AGENTS_CONFIG, "utf8"));
    return config.agents;
  } catch (error) {
    console.error("Error loading agents config:", error.message);
    return {};
  }
}

function listAgents() {
  const agents = loadAgentsConfig();
  console.log("\n📋 Available Agents:\n");

  Object.entries(agents).forEach(([key, agent]) => {
    console.log(`  ${agent.persona}`);
    console.log(`    Name: ${agent.name}`);
    console.log(`    Aliases: ${agent.alias.join(", ")}`);
    console.log(`    File: ${agent.file}`);
    console.log(`    Description: ${agent.description}`);
    console.log("");
  });
}

function findAgent(query) {
  const agents = loadAgentsConfig();
  const queryLower = query.toLowerCase();

  for (const [key, agent] of Object.entries(agents)) {
    if (
      agent.name.toLowerCase().includes(queryLower) ||
      agent.alias.some((a) => a.toLowerCase().includes(queryLower)) ||
      agent.persona.toLowerCase().includes(queryLower)
    ) {
      return agent;
    }
  }
  return null;
}

function showAgent(agentName) {
  const agent = findAgent(agentName);

  if (!agent) {
    console.error(`❌ Agent not found: ${agentName}`);
    console.log("\nUse: node agent-helper.js list");
    return;
  }

  const agentFile = path.join(__dirname, "..", agent.file);

  if (!fs.existsSync(agentFile)) {
    console.error(`❌ Agent file not found: ${agentFile}`);
    return;
  }

  const content = fs.readFileSync(agentFile, "utf8");

  console.log(`\n📄 Agent: ${agent.persona}`);
  console.log(`   File: ${agent.file}\n`);
  console.log("─".repeat(60));
  console.log(content);
  console.log("─".repeat(60));
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

if (command === "list") {
  listAgents();
} else if (command === "show" && arg) {
  showAgent(arg);
} else if (command === "find" && arg) {
  const agent = findAgent(arg);
  if (agent) {
    console.log(`✅ Found: ${agent.persona} (${agent.name})`);
    console.log(`   File: ${agent.file}`);
  } else {
    console.log(`❌ No agent found matching: ${arg}`);
  }
} else {
  console.log("Usage:");
  console.log("  node agent-helper.js list           - List all agents");
  console.log("  node agent-helper.js show <name>   - Show agent content");
  console.log(
    "  node agent-helper.js find <query>   - Find agent by name/alias"
  );
}

