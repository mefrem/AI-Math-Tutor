#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolResult,
  ListResourcesResult,
  ReadResourceResult,
  ListPromptsResult,
  GetPromptResult,
  Tool,
  Resource,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import {
  loadAgent,
  loadAllAgents,
  findAgentByNameOrAlias,
  loadAgentMetadata,
} from "./agent-loader.js";

const AGENTS_DIR = path.join(process.cwd(), ".claude", "agents");

interface AgentTool {
  name: string;
  description: string;
  agentName: string;
}

class AgentMCPServer {
  private server: Server;
  private agents: Map<string, any> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "agent-router",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: { listChanged: true },
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
    this.loadAgents();
  }

  private loadAgents() {
    const agents = loadAllAgents();
    for (const agent of agents) {
      this.agents.set(agent.name, agent);
    }
  }

  private setupHandlers() {
    // List available tools (agents)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [];

      // Add individual agent invocation tools
      for (const [agentName, agent] of this.agents.entries()) {
        tools.push({
          name: `invoke_${agentName.replace(/-/g, "_")}`,
          description: `Invoke the ${agent.name} agent: ${agent.description}`,
          inputSchema: {
            type: "object",
            properties: {
              task: {
                type: "string",
                description: "The task or request for this agent to handle",
              },
              context: {
                type: "object",
                description: "Additional context to pass to the agent",
                additionalProperties: true,
              },
            },
            required: ["task"],
          },
        });
      }

      // Add utility tools
      tools.push({
        name: "list_agents",
        description: "List all available agents with their descriptions",
        inputSchema: {
          type: "object",
          properties: {},
        },
      });

      tools.push({
        name: "get_agent_definition",
        description: "Get the full definition/content of a specific agent",
        inputSchema: {
          type: "object",
          properties: {
            agent_name: {
              type: "string",
              description: "Name or alias of the agent to retrieve",
            },
          },
          required: ["agent_name"],
        },
      });

      return { tools };
    });

    // Call tools (invoke agents)
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Handle utility tools
        if (name === "list_agents") {
          const agents = loadAllAgents();
          const metadata = loadAgentMetadata();

          const agentList = agents.map((agent) => {
            const meta = Object.values(metadata).find(
              (m) => m.name === agent.name
            );
            return {
              name: agent.name,
              alias: meta?.alias || [],
              persona: meta?.persona || agent.name,
              description: agent.description,
              file: `.claude/agents/${agent.name}.md`,
            };
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(agentList, null, 2),
              },
            ],
            isError: false,
          } as CallToolResult;
        }

        if (name === "get_agent_definition") {
          const agentQuery = (args as any).agent_name;
          const found = findAgentByNameOrAlias(agentQuery);

          if (!found) {
            return {
              content: [
                {
                  type: "text",
                  text: `Agent not found: ${agentQuery}`,
                },
              ],
              isError: true,
            } as CallToolResult;
          }

          const agent = loadAgent(found.name);
          if (!agent) {
            return {
              content: [
                {
                  type: "text",
                  text: `Could not load agent: ${found.name}`,
                },
              ],
              isError: true,
            } as CallToolResult;
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    name: agent.name,
                    description: agent.description,
                    model: agent.model,
                    content: agent.content,
                    filePath: agent.filePath,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: false,
          } as CallToolResult;
        }

        // Handle agent invocation tools
        if (name.startsWith("invoke_")) {
          const agentName = name.replace("invoke_", "").replace(/_/g, "-");
          const agent = this.agents.get(agentName);

          if (!agent) {
            return {
              content: [
                {
                  type: "text",
                  text: `Agent not found: ${agentName}`,
                },
              ],
              isError: true,
            } as CallToolResult;
          }

          const task = (args as any).task || "";
          const context = (args as any).context || {};

          // Return agent definition with task context
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    agent: agent.name,
                    description: agent.description,
                    model: agent.model,
                    task: task,
                    context: context,
                    agentContent: agent.content,
                    instructions: `You are now acting as the ${agent.name} agent. ${agent.description}\n\nTask: ${task}\n\nAgent Definition:\n${agent.content}`,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: false,
          } as CallToolResult;
        }

        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        } as CallToolResult;
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        } as CallToolResult;
      }
    });

    // List resources (agent definitions as resources)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const agents = loadAllAgents();
      const resources: Resource[] = agents.map((agent) => ({
        uri: `agent://${agent.name}`,
        name: agent.name,
        description: agent.description,
        mimeType: "text/markdown",
      }));

      return { resources } as ListResourcesResult;
    });

    // Read resources (agent definitions)
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;

        if (uri.startsWith("agent://")) {
          const agentName = uri.replace("agent://", "");
          const agent = loadAgent(agentName);

          if (!agent) {
            throw new Error(`Agent not found: ${agentName}`);
          }

          return {
            contents: [
              {
                uri: uri,
                mimeType: "text/markdown",
                text: agent.content,
              },
            ],
          } as ReadResourceResult;
        }

        throw new Error(`Unknown resource: ${uri}`);
      }
    );

    // List prompts (agent invocation prompts)
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      const agents = loadAllAgents();
      const prompts: Prompt[] = agents.map((agent) => ({
        name: `use_${agent.name.replace(/-/g, "_")}`,
        description: `Use the ${agent.name} agent to handle a task`,
        arguments: [
          {
            name: "task",
            description: "The task for the agent to handle",
            required: true,
          },
          {
            name: "context",
            description: "Additional context (optional)",
            required: false,
          },
        ],
      }));

      return { prompts } as ListPromptsResult;
    });

    // Get prompt (agent invocation)
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: promptArgs } = request.params;

      if (name.startsWith("use_")) {
        const agentName = name.replace("use_", "").replace(/_/g, "-");
        const agent = loadAgent(agentName);

        if (!agent) {
          throw new Error(`Agent not found: ${agentName}`);
        }

        const task = (promptArgs as any)?.task || "";
        const context = (promptArgs as any)?.context || {};

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `You are now acting as the ${agent.name} agent.\n\n${
                  agent.description
                }\n\nAgent Definition:\n${
                  agent.content
                }\n\nTask: ${task}\n\nContext: ${JSON.stringify(
                  context,
                  null,
                  2
                )}`,
              },
            },
          ],
        } as GetPromptResult;
      }

      throw new Error(`Unknown prompt: ${name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Agent Router MCP Server running on stdio");
  }
}

// Start the server
const server = new AgentMCPServer();
server.run().catch(console.error);




