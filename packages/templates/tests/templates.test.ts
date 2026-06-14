import { DeckSchema, SlideSchema } from "@pagestate/ir";
import { describe, expect, it } from "vitest";
import {
  TEMPLATE_DEMO_INPUTS,
  TEMPLATE_IDS,
  TemplateInputSchema,
  createSlideFromTemplate,
  createTemplateDemoDeck
} from "../src/index.js";

describe("templates", () => {
  it("has demo input for every first-pass template", () => {
    expect(TEMPLATE_DEMO_INPUTS.map((input) => input.template)).toEqual([...TEMPLATE_IDS]);
  });

  it("validates every demo input", () => {
    for (const input of TEMPLATE_DEMO_INPUTS) {
      expect(TemplateInputSchema.safeParse(input).success).toBe(true);
    }
  });

  it("creates valid slides from every template", () => {
    for (const input of TEMPLATE_DEMO_INPUTS) {
      const slide = createSlideFromTemplate(input);
      expect(SlideSchema.safeParse(slide).success).toBe(true);
    }
  });

  it("creates a valid template demo deck", () => {
    const deck = createTemplateDemoDeck();
    const result = DeckSchema.safeParse(deck);

    expect(result.success).toBe(true);
    expect(deck.slides).toHaveLength(10);
  });

  it("rejects template inputs that exceed the template capacity", () => {
    const result = TemplateInputSchema.safeParse({
      template: "hero",
      id: "too_long_title",
      title: "x".repeat(81)
    });

    expect(result.success).toBe(false);
  });

  it("keeps text-heavy templates layout-first instead of fixed-frame", () => {
    const textHeavyTemplates = TEMPLATE_DEMO_INPUTS.filter((input) =>
      ["two-column", "comparison", "product-demo"].includes(input.template)
    );

    for (const input of textHeavyTemplates) {
      const slide = createSlideFromTemplate(input);

      expect(slide.layout.type).not.toBe("freeform");
      expect(slide.blocks.every((block) => block.frame === undefined)).toBe(true);
    }
  });

  it("keeps product demo screenshots in flow layout", () => {
    const slide = createSlideFromTemplate({
      template: "product-demo",
      id: "product_demo_with_image",
      title: "Product demo with image",
      summary: "This variant includes an image but still avoids absolute frame positioning.",
      steps: ["Explain the task", "Show the result"],
      screenshotUrl: "https://example.com/screenshot.png"
    });

    expect(slide.layout.type).toBe("grid");
    expect(slide.blocks.every((block) => block.frame === undefined)).toBe(true);
  });
});
