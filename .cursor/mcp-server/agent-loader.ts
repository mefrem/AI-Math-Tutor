import * as fs from "fs";
import * as path from "path";

export interface AgentDefinition {
  name: string;
  description: string;
  model?: string;
  content: string;
  filePath: string;
}

export interface AgentMetadata {
  name: string;
  alias: string[];
  file: string;
  persona: string;
  description: string;
  useWhen: string[];
}

/**
 * Loads an agent definition from a markdown file
 */
export function loadAgent(
  agentName: string,
  agentsDir: string = ".claude/agents"
): AgentDefinition | null {
  const agentFile = path.join(process.cwd(), agentsDir, `${agentName}.md`);

  if (!fs.existsSync(agentFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(agentFile, "utf-8");

    // Parse YAML frontmatter
    const frontmatterMatch = content.match(
      /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    );

    if (!frontmatterMatch) {
      // No frontmatter, return content as-is
      return {
        name: agentName,
        description: `Agent: ${agentName}`,
        content: content,
        filePath: agentFile,
      };
    }

    const [, frontmatter, body] = frontmatterMatch;
    const lines = frontmatter.split("\n");
    const metadata: Record<string, string> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key] = value.replace(/^["']|["']$/g, ""); // Remove quotes
      }
    }

    return {
      name: metadata.name || agentName,
      description: metadata.description || `Agent: ${agentName}`,
      model: metadata.model,
      content: body.trim(),
      filePath: agentFile,
    };
  } catch (error) {
    console.error(`Error loading agent ${agentName}:`, error);
    return null;
  }
}

/**
 * Loads all agents from the agents directory
 */
export function loadAllAgents(
  agentsDir: string = ".claude/agents"
): AgentDefinition[] {
  const agentsPath = path.join(process.cwd(), agentsDir);

  if (!fs.existsSync(agentsPath)) {
    return [];
  }

  const files = fs.readdirSync(agentsPath);
  const agents: AgentDefinition[] = [];

  for (const file of files) {
    if (file.endsWith(".md")) {
      const agentName = file.replace(".md", "");
      const agent = loadAgent(agentName, agentsDir);
      if (agent) {
        agents.push(agent);
      }
    }
  }

  return agents;
}

/**
 * Loads agent metadata from agents.json
 */
export function loadAgentMetadata(): Record<string, AgentMetadata> {
  const configFile = path.join(process.cwd(), ".cursor", "agents.json");

  if (!fs.existsSync(configFile)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configFile, "utf-8");
    const config = JSON.parse(content);
    return config.agents || {};
  } catch (error) {
    console.error("Error loading agent metadata:", error);
    return {};
  }
}

/**
 * Finds an agent by name or alias
 */
export function findAgentByNameOrAlias(
  query: string
): { name: string; metadata?: AgentMetadata } | null {
  const metadata = loadAgentMetadata();
  const queryLower = query.toLowerCase();

  // First check direct name match
  for (const [key, agentMeta] of Object.entries(metadata)) {
    if (agentMeta.name.toLowerCase() === queryLower) {
      return { name: agentMeta.name, metadata: agentMeta };
    }

    // Check aliases
    if (agentMeta.alias.some((alias) => alias.toLowerCase() === queryLower)) {
      return { name: agentMeta.name, metadata: agentMeta };
    }
  }

  // Fallback: try direct file name
  const agentsPath = path.join(process.cwd(), ".claude", "agents");
  const possibleFile = path.join(agentsPath, `${query}.md`);
  if (fs.existsSync(possibleFile)) {
    return { name: query };
  }

  return null;
}






