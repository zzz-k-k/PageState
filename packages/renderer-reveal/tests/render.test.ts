import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Deck } from "@pagestate/ir";
import { renderRevealDeck } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function readValidDeck(): Promise<Deck> {
  const content = await readFile(resolve(__dirname, "../../ir/examples/valid-deck.json"), "utf8");
  return JSON.parse(content) as Deck;
}

describe("renderRevealDeck", () => {
  it("renders reveal.js document structure from Deck IR", async () => {
    const deck = await readValidDeck();
    const html = renderRevealDeck(deck);

    expect(html).toContain('<div class="reveal pagestate-deck">');
    expect(html).toContain('<div class="slides">');
    expect(html.match(/<section/g)).toHaveLength(3);
    expect(html).toContain('data-slide-id="slide_001"');
    expect(html).toContain('data-block-id="title"');
    expect(html).toContain("重新定义 AI 时代的演示文稿");
    expect(html).toContain('<aside class="notes">');
    expect(html).toContain("Reveal.initialize");
    expect(html).toContain("center: false,\n      width: 1920");
  });

  it("renders theme tokens as CSS variables", async () => {
    const deck = await readValidDeck();
    const html = renderRevealDeck(deck);

    expect(html).toContain("--color-text-primary: #0f172a;");
    expect(html).toContain("--font-heading: Inter;");
    expect(html).toContain("--space-slide-x: 96px;");
  });

  it("renders block frame into absolute positioning styles", async () => {
    const deck = await readValidDeck();
    deck.slides[0]!.blocks[0]!.frame = {
      x: 10,
      y: 8,
      width: 80,
      height: 14,
      unit: "%"
    };

    const html = renderRevealDeck(deck);

    expect(html).toContain("position: absolute");
    expect(html).toContain("left: 10%");
    expect(html).toContain("top: 8%");
    expect(html).toContain("width: 80%");
    expect(html).toContain("height: 14%");
  });

  it("renders reveal-specific slide hints without making them core layout fields", async () => {
    const deck = await readValidDeck();
    deck.slides[0]!.rendererHints = {
      reveal: {
        transition: "fade",
        backgroundColor: "#0f172a",
        autoAnimate: true,
        sectionAttributes: {
          "data-visibility": "uncounted"
        }
      }
    };

    const html = renderRevealDeck(deck);

    expect(html).toContain('data-transition="fade"');
    expect(html).toContain('data-background-color="#0f172a"');
    expect(html).toContain("data-auto-animate");
    expect(html).toContain('data-visibility="uncounted"');
  });

  it("rejects invalid deck input before rendering", () => {
    expect(() =>
      renderRevealDeck({
        type: "deck",
        title: "",
        slides: []
      })
    ).toThrow("Cannot render invalid Deck IR");
  });
});
