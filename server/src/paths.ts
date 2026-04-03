import fs from "node:fs";
import path from "node:path";
import { resolveDefaultConfigPath } from "./home-paths.js";

const AI_CEO_CONFIG_BASENAME = "config.json";
const AI_CEO_ENV_FILENAME = ".env";

function findConfigFileFromAncestors(startDir: string): string | null {
  const absoluteStartDir = path.resolve(startDir);
  let currentDir = absoluteStartDir;

  while (true) {
    const candidate = path.resolve(currentDir, ".ai-ceo", AI_CEO_CONFIG_BASENAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nextDir = path.resolve(currentDir, "..");
    if (nextDir === currentDir) break;
    currentDir = nextDir;
  }

  return null;
}

export function resolveAICEOConfigPath(overridePath?: string): string {
  if (overridePath) return path.resolve(overridePath);
  if (process.env.AI_CEO_CONFIG) return path.resolve(process.env.AI_CEO_CONFIG);
  return findConfigFileFromAncestors(process.cwd()) ?? resolveDefaultConfigPath();
}

export function resolveAICEOEnvPath(overrideConfigPath?: string): string {
  return path.resolve(path.dirname(resolveAICEOConfigPath(overrideConfigPath)), AI_CEO_ENV_FILENAME);
}
