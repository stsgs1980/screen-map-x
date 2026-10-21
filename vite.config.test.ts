import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import config from "./vite.config";

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };

describe("dev server posture", () => {
  it("binds the dev and preview servers to loopback by default", () => {
    expect(config.server?.host).toBe("127.0.0.1");
    expect(config.preview?.host).toBe("127.0.0.1");
  });

  it("keeps the host allow-list in place", () => {
    expect(config.server?.allowedHosts).not.toBe(true);
    expect(config.preview?.allowedHosts).not.toBe(true);
  });

  it("offers an explicit LAN opt-in script", () => {
    expect(pkg.scripts["dev:lan"]).toContain("--host 0.0.0.0");
  });
});

describe("ci workflow", () => {
  it("pins every GitHub Action to a commit SHA", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const actions = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((match) => match[1]);

    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(action).toMatch(/@[0-9a-f]{40}$/);
    }
  });
});
