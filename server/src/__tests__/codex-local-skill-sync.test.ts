import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCodexSkills,
  syncCodexSkills,
} from "@ai-ceo/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("codex local skill sync", () => {
  const aiCeoKey = "ai-ceo/ai-ceo/ai-ceo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured AI CEO skills for workspace injection on the next run", async () => {
    const codexHome = await makeTempDir("ai-ceo-codex-skill-sync-");
    cleanupDirs.add(codexHome);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    const before = await listCodexSkills(ctx);
    expect(before.mode).toBe("ephemeral");
    expect(before.desiredSkills).toContain(aiCeoKey);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("configured");
    expect(before.entries.find((entry) => entry.key === aiCeoKey)?.detail).toContain("CODEX_HOME/skills/");
  });

  it("does not persist AI CEO skills into CODEX_HOME during sync", async () => {
    const codexHome = await makeTempDir("ai-ceo-codex-skill-prune-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        aiCeoSkillSync: {
          desiredSkills: [aiCeoKey],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, [aiCeoKey]);
    expect(after.mode).toBe("ephemeral");
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("configured");
    await expect(fs.lstat(path.join(codexHome, "skills", "ai-ceo"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("keeps required bundled AI CEO skills configured even when the desired set is emptied", async () => {
    const codexHome = await makeTempDir("ai-ceo-codex-skill-required-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        aiCeoSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, []);
    expect(after.desiredSkills).toContain(aiCeoKey);
    expect(after.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("configured");
  });

  it("normalizes legacy flat AI CEO skill refs before reporting configured state", async () => {
    const codexHome = await makeTempDir("ai-ceo-codex-legacy-skill-sync-");
    cleanupDirs.add(codexHome);

    const snapshot = await listCodexSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        aiCeoSkillSync: {
          desiredSkills: ["ai-ceo"],
        },
      },
    });

    expect(snapshot.warnings).toEqual([]);
    expect(snapshot.desiredSkills).toContain(aiCeoKey);
    expect(snapshot.desiredSkills).not.toContain("ai-ceo");
    expect(snapshot.entries.find((entry) => entry.key === aiCeoKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === "ai-ceo")).toBeUndefined();
  });
});
