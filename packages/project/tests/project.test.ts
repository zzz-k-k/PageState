import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DeckSchema } from "@pagestate/ir";
import { executeCommand } from "@pagestate/commands";
import { afterEach, describe, expect, it } from "vitest";
import {
  ProjectError,
  createProject,
  loadDeck,
  loadProject,
  parseDeckJson,
  saveProject
} from "../src/index.js";

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pagestate-project-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("@pagestate/project", () => {
  it("creates a local PageState project with deck.json and standard directories", async () => {
    const rootDir = await createTempDir();
    const project = await createProject({
      rootDir,
      title: "Investor Pitch",
      now: new Date("2026-06-15T00:00:00.000Z")
    });

    expect(project.paths.rootDir).toBe(resolve(rootDir));
    expect(project.deck.title).toBe("Investor Pitch");
    expect(DeckSchema.safeParse(project.deck).success).toBe(true);

    await expect(readFile(project.paths.deckFile, "utf8")).resolves.toContain('"type": "deck"');
    expect((await stat(project.paths.assetsDir)).isDirectory()).toBe(true);
    expect((await stat(project.paths.themesDir)).isDirectory()).toBe(true);
    expect((await stat(project.paths.skillsDir)).isDirectory()).toBe(true);
    expect((await stat(project.paths.exportsDir)).isDirectory()).toBe(true);
  });

  it("loads deck.json into an in-memory Deck object", async () => {
    const rootDir = await createTempDir();
    await createProject({
      rootDir,
      title: "Local Project"
    });

    const project = await loadProject(rootDir);

    expect(project.deck.title).toBe("Local Project");
    expect(project.deck.slides[0]?.id).toBe("slide_001");
  });

  it("saves a Deck modified by the existing command layer back to deck.json", async () => {
    const rootDir = await createTempDir();
    const project = await createProject({
      rootDir,
      title: "Command Save Flow"
    });

    const result = executeCommand(project.deck, {
      type: "updateBlockText",
      slideId: "slide_001",
      blockId: "subtitle",
      text: "Saved through the project layer."
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    await saveProject({
      ...project,
      deck: result.data
    });

    const reloaded = await loadProject(rootDir);

    expect(reloaded.deck.slides[0]?.blocks[1]).toMatchObject({
      id: "subtitle",
      type: "paragraph",
      text: "Saved through the project layer."
    });
  });

  it("rejects invalid JSON before DeckSchema validation", async () => {
    expect(() => parseDeckJson("{", "broken deck")).toThrow(ProjectError);

    try {
      parseDeckJson("{", "broken deck");
    } catch (error) {
      expect(error).toBeInstanceOf(ProjectError);
      expect((error as ProjectError).code).toBe("INVALID_JSON");
    }
  });

  it("rejects deck.json files that do not match DeckSchema", async () => {
    const rootDir = await createTempDir();
    const deckFile = join(rootDir, "deck.json");

    await writeFile(deckFile, JSON.stringify({ type: "deck" }), "utf8");

    await expect(loadDeck(deckFile)).rejects.toMatchObject({
      code: "INVALID_DECK"
    });
  });

  it("does not overwrite an existing deck unless explicitly requested", async () => {
    const rootDir = await createTempDir();

    await createProject({
      rootDir,
      title: "Original"
    });

    await expect(
      createProject({
        rootDir,
        title: "Replacement"
      })
    ).rejects.toMatchObject({
      code: "PROJECT_ALREADY_EXISTS"
    });

    const project = await createProject({
      rootDir,
      title: "Replacement",
      overwriteDeck: true
    });

    expect(project.deck.title).toBe("Replacement");
  });
});
