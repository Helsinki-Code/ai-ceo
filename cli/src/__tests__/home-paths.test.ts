import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolveAICEOHomeDir,
  resolveAICEOInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.ai-ceo and default instance", () => {
    delete process.env.AI_CEO_HOME;
    delete process.env.AI_CEO_INSTANCE_ID;

    const paths = describeLocalInstancePaths();
    expect(paths.homeDir).toBe(path.resolve(os.homedir(), ".ai-ceo"));
    expect(paths.instanceId).toBe("default");
    expect(paths.configPath).toBe(path.resolve(os.homedir(), ".ai-ceo", "instances", "default", "config.json"));
  });

  it("supports AI_CEO_HOME and explicit instance ids", () => {
    process.env.AI_CEO_HOME = "~/ai-ceo-home";

    const home = resolveAICEOHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "ai-ceo-home"));
    expect(resolveAICEOInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolveAICEOInstanceId("bad/id")).toThrow(/Invalid instance id/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
