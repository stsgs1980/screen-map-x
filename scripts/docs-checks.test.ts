import { describe, expect, it } from "vitest";
import { checkLinkTargets, checkPaths, checkScriptNames } from "./docs-checks";

describe("check-docs", () => {
  it("flags a source path that does not exist", () => {
    const failures: string[] = [];

    checkPaths("README.md", "Модуль `src/features/screen-map/data/missing.ts`.", failures);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("does not exist");
  });

  it("accepts a source path that exists", () => {
    const failures: string[] = [];

    checkPaths("README.md", "Модуль `src/features/screen-map/data/constants.ts`.", failures);

    expect(failures).toHaveLength(0);
  });

  it("ignores paths inside the generated husky shim directory", () => {
    const failures: string[] = [];

    checkPaths("README.md", "Хуки живут в каталоге `.husky/_`.", failures);

    expect(failures).toHaveLength(0);
  });

  it("ignores the local inspection profile that is not tracked", () => {
    const failures: string[] = [];

    checkPaths(
      "docs/webstorm.md",
      "Файл `.idea/inspectionProfiles/Project_Default.xml` живёт только локально.",
      failures,
    );

    expect(failures).toHaveLength(0);
  });

  it("flags a markdown link target that does not exist", () => {
    const failures: string[] = [];

    checkLinkTargets("README.md", "См. [гайд](docs/gone.md).", failures);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("does not exist");
  });

  it("accepts a markdown link to an existing file and ignores external links", () => {
    const failures: string[] = [];

    checkLinkTargets("README.md", "[README](README.md) [сеть](https://example.com/x)", failures);

    expect(failures).toHaveLength(0);
  });

  it("flags an npm script that does not exist", () => {
    const failures: string[] = [];

    checkScriptNames("README.md", "Запустите `npm run nosuchscript`.", {}, failures);

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("not in package.json scripts");
  });

  it("does not treat the dev script as a future script", () => {
    const failures: string[] = [];

    checkScriptNames("README.md", "Запустите `npm run dev`.", { dev: "vite" }, failures);

    expect(failures).toHaveLength(0);
  });
});
