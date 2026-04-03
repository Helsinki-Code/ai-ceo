import fs from "node:fs";
import { aiCEOConfigSchema, type AICEOConfig } from "@ai-ceo/shared";
import { resolveAICEOConfigPath } from "./paths.js";

export function readConfigFile(): AICEOConfig | null {
  const configPath = resolveAICEOConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return aiCEOConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
