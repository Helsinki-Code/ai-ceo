import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensureCodexSkillsInjected } from "@ai-ceo/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createAICEORepoSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "server"), { recursive: true });
  await fs.mkdir(path.join(root, "packages", "adapter-utils"), { recursive: true });
  await fs.mkdir(path.join(root, "skills", skillName), { recursive: true });
  await fs.writeFile(path.join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), '{"name":"ai-ceo"}\n', "utf8");
  await fs.writeFile(
    path.join(root, "skills", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

async function createCustomSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "custom", skillName), { recursive: true });
  await fs.writeFile(
    path.join(root, "custom", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

describe("codex local adapter skill injection", () => {
  const aiCeoKey = "ai-ceo/ai-ceo/ai-ceo";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("repairs a Codex AI CEO skill symlink that still points at another live checkout", async () => {
    const currentRepo = await makeTempDir("ai-ceo-codex-current-");
    const oldRepo = await makeTempDir("ai-ceo-codex-old-");
    const skillsHome = await makeTempDir("ai-ceo-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createAICEORepoSkill(currentRepo, "ai-ceo");
    await createAICEORepoSkill(oldRepo, "ai-ceo");
    await fs.symlink(path.join(oldRepo, "skills", "ai-ceo"), path.join(skillsHome, "ai-ceo"));

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [{
          key: aiCeoKey,
          runtimeName: "ai-ceo",
          source: path.join(currentRepo, "skills", "ai-ceo"),
        }],
      },
    );

    expect(await fs.realpath(path.join(skillsHome, "ai-ceo"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "ai-ceo")),
    );
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Repaired Codex skill "ai-ceo"'),
      }),
    );
  });

  it("preserves a custom Codex skill symlink outside AI CEO repo checkouts", async () => {
    const currentRepo = await makeTempDir("ai-ceo-codex-current-");
    const customRoot = await makeTempDir("ai-ceo-codex-custom-");
    const skillsHome = await makeTempDir("ai-ceo-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(customRoot);
    cleanupDirs.add(skillsHome);

    await createAICEORepoSkill(currentRepo, "ai-ceo");
    await createCustomSkill(customRoot, "ai-ceo");
    await fs.symlink(path.join(customRoot, "custom", "ai-ceo"), path.join(skillsHome, "ai-ceo"));

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: aiCeoKey,
        runtimeName: "ai-ceo",
        source: path.join(currentRepo, "skills", "ai-ceo"),
      }],
    });

    expect(await fs.realpath(path.join(skillsHome, "ai-ceo"))).toBe(
      await fs.realpath(path.join(customRoot, "custom", "ai-ceo")),
    );
  });

  it("prunes broken symlinks for unavailable AI CEO repo skills before Codex starts", async () => {
    const currentRepo = await makeTempDir("ai-ceo-codex-current-");
    const oldRepo = await makeTempDir("ai-ceo-codex-old-");
    const skillsHome = await makeTempDir("ai-ceo-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createAICEORepoSkill(currentRepo, "ai-ceo");
    await createAICEORepoSkill(oldRepo, "agent-browser");
    const staleTarget = path.join(oldRepo, "skills", "agent-browser");
    await fs.symlink(staleTarget, path.join(skillsHome, "agent-browser"));
    await fs.rm(staleTarget, { recursive: true, force: true });

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [{
          key: aiCeoKey,
          runtimeName: "ai-ceo",
          source: path.join(currentRepo, "skills", "ai-ceo"),
        }],
      },
    );

    await expect(fs.lstat(path.join(skillsHome, "agent-browser"))).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Removed stale Codex skill "agent-browser"'),
      }),
    );
  });

  it("preserves other live AI CEO skill symlinks in the shared workspace skill directory", async () => {
    const currentRepo = await makeTempDir("ai-ceo-codex-current-");
    const skillsHome = await makeTempDir("ai-ceo-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(skillsHome);

    await createAICEORepoSkill(currentRepo, "ai-ceo");
    await createAICEORepoSkill(currentRepo, "agent-browser");
    await fs.symlink(
      path.join(currentRepo, "skills", "agent-browser"),
      path.join(skillsHome, "agent-browser"),
    );

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: aiCeoKey,
        runtimeName: "ai-ceo",
        source: path.join(currentRepo, "skills", "ai-ceo"),
      }],
    });

    expect((await fs.lstat(path.join(skillsHome, "ai-ceo"))).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(path.join(skillsHome, "agent-browser"))).isSymbolicLink()).toBe(true);
    expect(await fs.realpath(path.join(skillsHome, "agent-browser"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "agent-browser")),
    );
  });
});
