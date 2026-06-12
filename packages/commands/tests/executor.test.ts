import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Deck } from "@pagestate/ir";
import { executeCommand, executeCommands } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function readValidDeck(): Promise<Deck> {
  const content = await readFile(resolve(__dirname, "../../ir/examples/valid-deck.json"), "utf8");
  return JSON.parse(content) as Deck;
}

describe("executeCommand", () => {
  it("updates text blocks without mutating the original deck", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "updateBlockText",
      slideId: "slide_001",
      blockId: "title",
      text: "Presentation as Code, Edited by AI"
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.slides[0]?.blocks[0]).toMatchObject({
        id: "title",
        type: "heading",
        text: "Presentation as Code, Edited by AI"
      });
    }

    expect(deck.slides[0]?.blocks[0]).toMatchObject({
      id: "title",
      type: "heading",
      text: "重新定义 AI 时代的演示文稿"
    });
  });

  it("creates a slide at a specific index", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "createSlide",
      slide: {
        id: "slide_004",
        type: "closing",
        title: "Next Steps",
        layout: {
          type: "centered"
        },
        blocks: [
          {
            id: "closing_title",
            type: "heading",
            text: "Build the workbench"
          }
        ],
        animations: []
      },
      index: 1
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.slides.map((slide) => slide.id)).toEqual([
        "slide_001",
        "slide_004",
        "slide_002",
        "slide_003"
      ]);
    }
  });

  it("runs command batches in order", async () => {
    const deck = await readValidDeck();
    const result = executeCommands(deck, [
      {
        type: "updateSlideTitle",
        slideId: "slide_002",
        title: "Web Native vs PPTX"
      },
      {
        type: "setSlideLayout",
        slideId: "slide_002",
        layout: {
          type: "grid",
          columns: 2,
          gap: 40
        }
      }
    ]);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.slides[1]?.title).toBe("Web Native vs PPTX");
      expect(result.data.slides[1]?.layout).toMatchObject({
        type: "grid",
        columns: 2
      });
    }
  });

  it("supports controlled JSON Patch edits", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "patchDeck",
      reason: "Fallback edit for an AI-generated localized subtitle.",
      operations: [
        {
          op: "replace",
          path: "/slides/0/blocks/1/text",
          value: "A local-first workbench for web-native presentations."
        }
      ]
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.slides[0]?.blocks[1]).toMatchObject({
        id: "subtitle",
        type: "paragraph",
        text: "A local-first workbench for web-native presentations."
      });
    }
  });

  it("rejects patch attempts against protected root fields", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "patchDeck",
      operations: [
        {
          op: "replace",
          path: "/schemaVersion",
          value: "999.0.0"
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("INVALID_OPERATION");
      expect(result.error.path).toBe("/schemaVersion");
    }
  });

  it("rejects commands that produce invalid Deck IR", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "patchDeck",
      operations: [
        {
          op: "remove",
          path: "/slides/0/blocks/0/text"
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("SCHEMA_VIOLATION");
    }
  });

  it("rejects block prop updates that try to change identity fields", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "updateBlockProps",
      slideId: "slide_001",
      blockId: "title",
      props: {
        type: "paragraph"
      }
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("INVALID_OPERATION");
      expect(result.error.path).toBe("props.type");
    }
  });

  it("returns not found errors for missing blocks", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "updateBlockText",
      slideId: "slide_001",
      blockId: "missing_block",
      text: "This should not apply"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.path).toBe("blockId");
    }
  });

  it("converts a slide layout and replaces blocks semantically", async () => {
    const deck = await readValidDeck();
    const result = executeCommand(deck, {
      type: "convertSlideLayout",
      slideId: "slide_002",
      slideType: "timeline",
      title: "Implementation Timeline",
      layout: {
        type: "timeline",
        gap: 24
      },
      blocks: [
        {
          id: "timeline_title",
          type: "heading",
          text: "MVP Roadmap"
        },
        {
          id: "timeline_items",
          type: "list",
          items: ["Deck IR", "Command Layer", "Reveal Renderer"]
        }
      ]
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.slides[1]).toMatchObject({
        id: "slide_002",
        type: "timeline",
        title: "Implementation Timeline",
        layout: {
          type: "timeline"
        }
      });
      expect(result.data.slides[1]?.blocks.map((block) => block.id)).toEqual(["timeline_title", "timeline_items"]);
    }
  });
});
