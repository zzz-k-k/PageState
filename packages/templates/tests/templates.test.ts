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
});
