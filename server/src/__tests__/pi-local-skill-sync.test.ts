import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listPiSkills,
  syncPiSkills,
} from "@ai-ceo/adapter-pi-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("pi local skill sync", () => {
  const aiCeoKey = "ai-ceo/ai-ceo/ai-ceo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured AI CEO skills and installs them into the Pi skills home", async () => {
    const home = await makeTempDir("ai-ceo-pi-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    const before = await listPiSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(aiCeoKey);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("missing");

    const after = await syncPiSkills(ctx, [aiCeoKey]);
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "ai-ceo"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled AI CEO skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("ai-ceo-pi-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "pi_local",
      config: {
        env: {
          HOME: home,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    await syncPiSkills(configuredCtx, [aiCeoKey]);

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

    const after = await syncPiSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(aiCeoKey);
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".pi", "agent", "skills", "ai-ceo"))).isSymbolicLink()).toBe(true);
  });
});
