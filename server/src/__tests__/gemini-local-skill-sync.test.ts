import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listGeminiSkills,
  syncGeminiSkills,
} from "@ai-ceo/adapter-gemini-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("gemini local skill sync", () => {
  const aiCeoKey = "ai-ceo/ai-ceo/ai-ceo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured AI CEO skills and installs them into the Gemini skills home", async () => {
    const home = await makeTempDir("ai-ceo-gemini-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "gemini_local",
      config: {
        env: {
          HOME: home,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    const before = await listGeminiSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(aiCeoKey);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("missing");

    const after = await syncGeminiSkills(ctx, [aiCeoKey]);
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".gemini", "skills", "ai-ceo"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled AI CEO skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("ai-ceo-gemini-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "gemini_local",
      config: {
        env: {
          HOME: home,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    await syncGeminiSkills(configuredCtx, [aiCeoKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        aiCeoSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncGeminiSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(aiCeoKey);
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".gemini", "skills", "ai-ceo"))).isSymbolicLink()).toBe(true);
  });
});
