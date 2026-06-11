import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DeckSchema } from "../src/deck-schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function readJson(path: string): Promise<unknown> {
  const content = await readFile(resolve(__dirname, "..", path), "utf8");
  return JSON.parse(content);
}

describe("DeckSchema", () => {
  it("accepts a valid deck and applies defaults", async () => {
    const deckJson = await readJson("examples/valid-deck.json");
    const result = DeckSchema.safeParse(deckJson);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe("deck");
      expect(result.data.slides).toHaveLength(3);
      expect(result.data.exportConfig.aspectRatio).toBe("16:9");
      expect(result.data.slides[0]?.animations[0]?.targetBlockId).toBe("title");
    }
  });

  it("rejects an invalid deck with actionable issue paths", async () => {
    const deckJson = await readJson("examples/invalid-deck.json");
    const result = DeckSchema.safeParse(deckJson);

    expect(result.success).toBe(false);

    if (!result.success) {
      const issuePaths = result.error.issues.map((issue) => issue.path.join("."));
      expect(issuePaths).toContain("id");
      expect(issuePaths).toContain("title");
      expect(issuePaths).toContain("theme");
      expect(issuePaths).toContain("slides.0.layout.type");
      expect(issuePaths).toContain("slides.0.blocks.0.text");
    }
  });
});
