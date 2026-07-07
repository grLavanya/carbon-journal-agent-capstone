import * as readline from 'readline';
import * as path from 'path';
import { fileURLToPath } from 'url';
import emissionFactorsData from './emission-factors.json';

// Interface definitions
interface EmissionFactor {
  category: string;
  activity: string;
  co2eKg: number;
  note: string;
}

export interface ToolResponse {
  co2eKg: number;
  note: string;
  matched: boolean;
}

// Load dataset
let emissionFactors: EmissionFactor[] = emissionFactorsData as EmissionFactor[];

// Category defaults
const categoryDefaults: Record<string, { co2eKg: number; note: string }> = {
  "Transport": {
    co2eKg: 0.2,
    note: "No direct activity match found. Using a generic transport emission factor based on average passenger travel."
  },
  "Energy": {
    co2eKg: 2.0,
    note: "No direct activity match found. Using a generic household energy emission estimate."
  },
  "Food": {
    co2eKg: 1.5,
    note: "No direct activity match found. Using a generic meal emission estimate."
  },
  "Waste": {
    co2eKg: 0.5,
    note: "No direct activity match found. Using a generic municipal waste emission estimate."
  },
  "Water": {
    co2eKg: 0.1,
    note: "No direct activity match found. Using a generic water usage emission estimate."
  },
  "Lifestyle": {
    co2eKg: 1.0,
    note: "No direct activity match found. Using a generic consumer lifestyle emission estimate."
  }
};

// Normalize category input
function normalizeCategory(category: string): string | null {
  const categories = ["Transport", "Energy", "Food", "Waste", "Water", "Lifestyle"];
  const cleaned = category.trim().toLowerCase();
  const match = categories.find(c => c.toLowerCase() === cleaned);
  return match || null;
}

// Get tokens from string
function getTokens(str: string): Set<string> {
  return new Set(
    str.toLowerCase()
       .replace(/[^\w\s-]/g, '')
       .split(/\s+/)
       .filter(word => word.length > 0)
  );
}

// Fuzzy matching similarity function
function computeSimilarity(query: string, target: string): number {
  const queryLower = query.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();

  if (queryLower === targetLower) return 1.0;

  const queryTokens = getTokens(queryLower);
  const targetTokens = getTokens(targetLower);

  if (queryTokens.size === 0) return 0;

  let matchedTokens = 0;
  for (const qToken of queryTokens) {
    if (targetTokens.has(qToken)) {
      matchedTokens++;
    } else {
      // Check for partial substring match
      for (const tToken of targetTokens) {
        if (tToken.includes(qToken) || qToken.includes(tToken)) {
          matchedTokens += 0.8;
          break;
        }
      }
    }
  }

  const queryMatchRatio = matchedTokens / queryTokens.size;

  let intersectionSize = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) {
      intersectionSize++;
    }
  }
  const unionSize = queryTokens.size + targetTokens.size - intersectionSize;
  const jaccard = unionSize > 0 ? intersectionSize / unionSize : 0;

  return queryMatchRatio * 0.7 + jaccard * 0.3;
}

// Handle lookup of emission factor
export function handleGetEmissionFactor(categoryInput: string, activityInput: string): ToolResponse {
  const normalizedCategory = normalizeCategory(categoryInput);

  if (!normalizedCategory) {
    return {
      co2eKg: 1.0,
      note: "Unrecognized category. Using a generic lifestyle emission estimate.",
      matched: false
    };
  }

  const categoryFactors = emissionFactors.filter(
    f => f.category.toLowerCase() === normalizedCategory.toLowerCase()
  );

  if (categoryFactors.length === 0) {
    const fallback = categoryDefaults[normalizedCategory];
    return {
      co2eKg: fallback.co2eKg,
      note: fallback.note,
      matched: false
    };
  }

  let bestMatch: EmissionFactor | null = null;
  let bestScore = -1;

  for (const factor of categoryFactors) {
    const score = computeSimilarity(activityInput, factor.activity);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = factor;
    }
  }

  // Threshold of 0.3 is standard for a reasonable fuzzy match
  const threshold = 0.3;
  if (bestMatch && bestScore >= threshold) {
    return {
      co2eKg: bestMatch.co2eKg,
      note: bestMatch.note,
      matched: true
    };
  }

  const fallback = categoryDefaults[normalizedCategory];
  return {
    co2eKg: fallback.co2eKg,
    note: fallback.note,
    matched: false
  };
}

// Stdio JSON-RPC Communication Setup (only if run directly)
const isMain = !process.env.VERCEL && process.argv[1] && (
  path.resolve(fileURLToPath(import.meta.url)).replace(/\.[jt]s$/, '') === path.resolve(process.argv[1]).replace(/\.[jt]s$/, '')
);

let rl: readline.Interface | null = null;
if (isMain) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
}

function sendResponse(id: any, result: any) {
  const response = {
    jsonrpc: "2.0",
    id,
    result
  };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function sendError(id: any, code: number, message: string, data?: any) {
  const response = {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {})
    }
  };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function handleRequest(request: any) {
  const { jsonrpc, id, method, params } = request;

  if (jsonrpc !== "2.0") {
    sendError(id || null, -32600, "Invalid Request: expected jsonrpc: '2.0'");
    return;
  }

  switch (method) {
    case "initialize": {
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "carbon-journal-mcp-server",
          version: "1.0.0"
        }
      });
      break;
    }
    case "notifications/initialized": {
      // Notifications do not receive a response
      break;
    }
    case "ping": {
      sendResponse(id, {});
      break;
    }
    case "tools/list": {
      sendResponse(id, {
        tools: [
          {
            name: "get_emission_factor",
            description: "Look up realistic CO2e impact estimates (in kg) for a given activity category and description.",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["Transport", "Energy", "Food", "Waste", "Water", "Lifestyle"],
                  description: "The category of the activity (must be Transport, Energy, Food, Waste, Water, or Lifestyle)."
                },
                activity: {
                  type: "string",
                  description: "Free text description of the activity to search and match."
                }
              },
              required: ["category", "activity"]
            }
          }
        ]
      });
      break;
    }
    case "tools/call": {
      if (!params || params.name !== "get_emission_factor") {
        sendError(id, -32601, `Method not found or invalid tool name: ${params?.name}`);
        return;
      }

      const args = params.arguments;
      if (!args || typeof args.category !== 'string' || typeof args.activity !== 'string') {
        sendError(id, -32602, "Invalid params: category and activity are required string parameters.");
        return;
      }

      const result = handleGetEmissionFactor(args.category, args.activity);
      sendResponse(id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(result)
          }
        ]
      });
      break;
    }
    default: {
      if (id !== undefined && id !== null) {
        sendError(id, -32601, `Method not found: ${method}`);
      }
      break;
    }
  }
}

if (rl) {
  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const request = JSON.parse(trimmed);
      handleRequest(request);
    } catch (err) {
      console.error("Error parsing input line:", err, line);
      sendError(null, -32700, "Parse error");
    }
  });
}
