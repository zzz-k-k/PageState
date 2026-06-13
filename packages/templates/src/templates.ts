import { Slide, SlideSchema } from "@pagestate/ir";
import {
  ArchitectureTemplateInput,
  ArchitectureTemplateInputSchema,
  ChartSlideTemplateInput,
  ChartSlideTemplateInputSchema,
  ClosingTemplateInput,
  ClosingTemplateInputSchema,
  ComparisonTemplateInput,
  ComparisonTemplateInputSchema,
  HeroTemplateInput,
  HeroTemplateInputSchema,
  ProductDemoTemplateInput,
  ProductDemoTemplateInputSchema,
  QuoteHeroTemplateInput,
  QuoteHeroTemplateInputSchema,
  SectionTemplateInput,
  SectionTemplateInputSchema,
  TemplateInput,
  TemplateInputSchema,
  TimelineTemplateInput,
  TimelineTemplateInputSchema,
  TwoColumnTemplateInput,
  TwoColumnTemplateInputSchema
} from "./template-schema.js";

type GeneratedBlock = Record<string, unknown> & { id: string };
type TextColumn = {
  heading: string;
  body?: string;
  items: string[];
};

export const TEMPLATE_IDS = [
  "hero",
  "section",
  "two-column",
  "comparison",
  "timeline",
  "chart-slide",
  "quote-hero",
  "architecture",
  "product-demo",
  "closing"
] as const;

export function createHeroSlide(rawInput: HeroTemplateInput): Slide {
  const input = HeroTemplateInputSchema.parse(rawInput);
  const blocks = compactBlocks([
    input.eyebrow === undefined
      ? undefined
      : {
          id: blockId(input.id, "eyebrow"),
          type: "paragraph",
          text: input.eyebrow,
          style: {
            align: "center",
            colorToken: "color.accent",
            emphasis: "strong"
          }
        },
    {
      id: blockId(input.id, "title"),
      type: "heading",
      level: 1,
      text: input.title,
      style: {
        align: "center",
        colorToken: "color.text.primary"
      }
    },
    input.subtitle === undefined
      ? undefined
      : {
          id: blockId(input.id, "subtitle"),
          type: "paragraph",
          text: input.subtitle,
          style: {
            align: "center",
            colorToken: "color.text.muted"
          }
        }
  ]);

  return finalizeSlide({
    id: input.id,
    type: "hero",
    title: input.title,
    layout: {
      type: "centered",
      gap: 28,
      padding: 112
    },
    blocks,
    animations: fragmentAnimations(blocks.map((block) => block.id)),
    notes: notes(input.speakerNotes),
    rendererHints: {
      reveal: {
        transition: "fade"
      }
    },
    sourceSkill: sourceSkill("hero")
  });
}

export function createSectionSlide(rawInput: SectionTemplateInput): Slide {
  const input = SectionTemplateInputSchema.parse(rawInput);
  const blocks = compactBlocks([
    input.sectionNumber === undefined
      ? undefined
      : {
          id: blockId(input.id, "number"),
          type: "paragraph",
          text: input.sectionNumber,
          style: {
            align: "center",
            colorToken: "color.accent",
            emphasis: "strong"
          }
        },
    {
      id: blockId(input.id, "title"),
      type: "heading",
      level: 1,
      text: input.title,
      style: {
        align: "center"
      }
    },
    input.subtitle === undefined
      ? undefined
      : {
          id: blockId(input.id, "subtitle"),
          type: "paragraph",
          text: input.subtitle,
          style: {
            align: "center",
            colorToken: "color.text.muted"
          }
        }
  ]);

  return finalizeSlide({
    id: input.id,
    type: "section",
    title: input.title,
    layout: {
      type: "centered",
      gap: 24,
      padding: 112
    },
    blocks,
    animations: fragmentAnimations(blocks.map((block) => block.id)),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("section")
  });
}

export function createTwoColumnSlide(rawInput: TwoColumnTemplateInput): Slide {
  const input = TwoColumnTemplateInputSchema.parse(rawInput);

  return finalizeSlide({
    id: input.id,
    type: "two-column",
    title: input.title,
    layout: {
      type: "freeform",
      gap: 32,
      padding: 80,
      columns: 2
    },
    blocks: [
      heading(input.id, "title", input.title, 2, { x: 7, y: 8, width: 86, height: 12 }),
      heading(input.id, "left_heading", input.left.heading, 3, { x: 8, y: 25, width: 38, height: 8 }),
      columnContent(input.id, "left", input.left, { x: 8, y: 36, width: 38, height: 48 }),
      heading(input.id, "right_heading", input.right.heading, 3, { x: 54, y: 25, width: 38, height: 8 }),
      columnContent(input.id, "right", input.right, { x: 54, y: 36, width: 38, height: 48 })
    ],
    animations: fragmentAnimations([
      blockId(input.id, "left_heading"),
      blockId(input.id, "left_content"),
      blockId(input.id, "right_heading"),
      blockId(input.id, "right_content")
    ]),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("two-column")
  });
}

export function createComparisonSlide(rawInput: ComparisonTemplateInput): Slide {
  const input = ComparisonTemplateInputSchema.parse(rawInput);
  const width = input.items.length === 2 ? 38 : 27;
  const startX = input.items.length === 2 ? 8 : 6;
  const gap = input.items.length === 2 ? 8 : 4;

  return finalizeSlide({
    id: input.id,
    type: "comparison",
    title: input.title,
    layout: {
      type: "freeform",
      gap: 32,
      padding: 80
    },
    blocks: [
      heading(input.id, "title", input.title, 2, { x: 7, y: 8, width: 86, height: 12 }),
      ...input.items.flatMap((item, index) => {
        const x = startX + index * (width + gap);
        return [
          heading(input.id, `item_${index + 1}_heading`, item.label, 3, { x, y: 27, width, height: 8 }),
          list(input.id, `item_${index + 1}_points`, item.points, false, { x, y: 39, width, height: 42 })
        ];
      })
    ],
    animations: fragmentAnimations(input.items.map((_, index) => blockId(input.id, `item_${index + 1}_points`))),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("comparison")
  });
}

export function createTimelineSlide(rawInput: TimelineTemplateInput): Slide {
  const input = TimelineTemplateInputSchema.parse(rawInput);

  return finalizeSlide({
    id: input.id,
    type: "timeline",
    title: input.title,
    layout: {
      type: "stack",
      gap: 22,
      padding: 88
    },
    blocks: compactBlocks([
      {
        id: blockId(input.id, "title"),
        type: "heading",
        level: 2,
        text: input.title
      },
      {
        id: blockId(input.id, "events"),
        type: "list",
        ordered: true,
        items: input.events.map((event) => `${event.label}: ${event.description}`)
      }
    ]),
    animations: fragmentAnimations([blockId(input.id, "events")]),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("timeline")
  });
}

export function createChartSlide(rawInput: ChartSlideTemplateInput): Slide {
  const input = ChartSlideTemplateInputSchema.parse(rawInput);

  return finalizeSlide({
    id: input.id,
    type: "chart",
    title: input.title,
    layout: {
      type: "stack",
      gap: 24,
      padding: 84
    },
    blocks: compactBlocks([
      {
        id: blockId(input.id, "title"),
        type: "heading",
        level: 2,
        text: input.title
      },
      {
        id: blockId(input.id, "chart"),
        type: "chart",
        chartType: input.chartType,
        title: input.chartTitle,
        data: {
          columns: input.columns,
          rows: input.rows
        }
      },
      input.insight === undefined
        ? undefined
        : {
            id: blockId(input.id, "insight"),
            type: "paragraph",
            text: input.insight,
            style: {
              colorToken: "color.text.muted"
            }
          }
    ]),
    animations: fragmentAnimations([blockId(input.id, "chart"), blockId(input.id, "insight")]),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("chart-slide")
  });
}

export function createQuoteHeroSlide(rawInput: QuoteHeroTemplateInput): Slide {
  const input = QuoteHeroTemplateInputSchema.parse(rawInput);

  return finalizeSlide({
    id: input.id,
    type: "quote",
    title: input.quote,
    layout: {
      type: "centered",
      gap: 24,
      padding: 120
    },
    blocks: [
      {
        id: blockId(input.id, "quote"),
        type: "quote",
        text: input.quote,
        attribution: input.attribution,
        style: {
          align: "center",
          colorToken: "color.text.primary"
        }
      }
    ],
    animations: fragmentAnimations([blockId(input.id, "quote")]),
    notes: notes(input.speakerNotes),
    rendererHints: {
      reveal: {
        transition: "fade"
      }
    },
    sourceSkill: sourceSkill("quote-hero")
  });
}

export function createArchitectureSlide(rawInput: ArchitectureTemplateInput): Slide {
  const input = ArchitectureTemplateInputSchema.parse(rawInput);
  const diagram = input.steps.map((step, index) => `${index + 1}. ${step}`).join("\n     -> ");

  return finalizeSlide({
    id: input.id,
    type: "architecture",
    title: input.title,
    layout: {
      type: "stack",
      gap: 24,
      padding: 84
    },
    blocks: compactBlocks([
      {
        id: blockId(input.id, "title"),
        type: "heading",
        level: 2,
        text: input.title
      },
      input.summary === undefined
        ? undefined
        : {
            id: blockId(input.id, "summary"),
            type: "paragraph",
            text: input.summary,
            style: {
              colorToken: "color.text.muted"
            }
          },
      {
        id: blockId(input.id, "diagram"),
        type: "code",
        language: "txt",
        code: diagram
      }
    ]),
    animations: fragmentAnimations([blockId(input.id, "diagram")]),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("architecture")
  });
}

export function createProductDemoSlide(rawInput: ProductDemoTemplateInput): Slide {
  const input = ProductDemoTemplateInputSchema.parse(rawInput);
  const blocks = compactBlocks([
    heading(input.id, "title", input.title, 2, { x: 7, y: 8, width: 86, height: 12 }),
    {
      id: blockId(input.id, "summary"),
      type: "paragraph",
      text: input.summary,
      frame: frame({ x: 8, y: 25, width: input.screenshotUrl === undefined ? 84 : 38, height: 18 }),
      style: {
        colorToken: "color.text.muted"
      }
    },
    list(input.id, "steps", input.steps, true, {
      x: 8,
      y: 48,
      width: input.screenshotUrl === undefined ? 84 : 38,
      height: 36
    }),
    input.screenshotUrl === undefined
      ? undefined
      : {
          id: blockId(input.id, "screenshot"),
          type: "image",
          source: {
            kind: "url",
            url: input.screenshotUrl
          },
          alt: `${input.title} screenshot`,
          frame: frame({ x: 54, y: 25, width: 38, height: 56 })
        }
  ]);

  return finalizeSlide({
    id: input.id,
    type: "product-demo",
    title: input.title,
    layout: {
      type: "freeform",
      gap: 28,
      padding: 80
    },
    blocks,
    animations: fragmentAnimations(blocks.map((block) => block.id).filter((id) => id !== blockId(input.id, "title"))),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("product-demo")
  });
}

export function createClosingSlide(rawInput: ClosingTemplateInput): Slide {
  const input = ClosingTemplateInputSchema.parse(rawInput);
  const blocks = compactBlocks([
    {
      id: blockId(input.id, "title"),
      type: "heading",
      level: 1,
      text: input.title,
      style: {
        align: "center"
      }
    },
    input.subtitle === undefined
      ? undefined
      : {
          id: blockId(input.id, "subtitle"),
          type: "paragraph",
          text: input.subtitle,
          style: {
            align: "center",
            colorToken: "color.text.muted"
          }
        },
    input.nextSteps.length === 0
      ? undefined
      : {
          id: blockId(input.id, "next_steps"),
          type: "list",
          ordered: false,
          items: input.nextSteps
        },
    input.contact === undefined
      ? undefined
      : {
          id: blockId(input.id, "contact"),
          type: "paragraph",
          text: input.contact,
          style: {
            align: "center",
            colorToken: "color.accent"
          }
        }
  ]);

  return finalizeSlide({
    id: input.id,
    type: "closing",
    title: input.title,
    layout: {
      type: "centered",
      gap: 24,
      padding: 112
    },
    blocks,
    animations: fragmentAnimations(blocks.map((block) => block.id)),
    notes: notes(input.speakerNotes),
    sourceSkill: sourceSkill("closing")
  });
}

export function createSlideFromTemplate(rawInput: TemplateInput): Slide {
  const input = TemplateInputSchema.parse(rawInput);

  switch (input.template) {
    case "hero":
      return createHeroSlide(input);
    case "section":
      return createSectionSlide(input);
    case "two-column":
      return createTwoColumnSlide(input);
    case "comparison":
      return createComparisonSlide(input);
    case "timeline":
      return createTimelineSlide(input);
    case "chart-slide":
      return createChartSlide(input);
    case "quote-hero":
      return createQuoteHeroSlide(input);
    case "architecture":
      return createArchitectureSlide(input);
    case "product-demo":
      return createProductDemoSlide(input);
    case "closing":
      return createClosingSlide(input);
  }
}

export function createSlidesFromTemplates(rawInputs: TemplateInput[]): Slide[] {
  return rawInputs.map((input) => createSlideFromTemplate(input));
}

function finalizeSlide(slide: unknown): Slide {
  return SlideSchema.parse(slide);
}

function heading(
  slideId: string,
  suffix: string,
  text: string,
  level: 1 | 2 | 3,
  blockFrame?: FrameInput
): GeneratedBlock {
  return {
    id: blockId(slideId, suffix),
    type: "heading",
    level,
    text,
    frame: blockFrame === undefined ? undefined : frame(blockFrame)
  };
}

function list(
  slideId: string,
  suffix: string,
  items: string[],
  ordered: boolean,
  blockFrame?: FrameInput
): GeneratedBlock {
  return {
    id: blockId(slideId, suffix),
    type: "list",
    ordered,
    items,
    frame: blockFrame === undefined ? undefined : frame(blockFrame)
  };
}

function columnContent(
  slideId: string,
  suffix: string,
  column: TextColumn,
  blockFrame: FrameInput
): GeneratedBlock {
  if (column.items.length > 0) {
    return list(slideId, `${suffix}_content`, column.items, false, blockFrame);
  }

  return {
    id: blockId(slideId, `${suffix}_content`),
    type: "paragraph",
    text: column.body ?? column.heading,
    frame: frame(blockFrame),
    style: {
      colorToken: "color.text.muted"
    }
  };
}

function frame(input: FrameInput): Record<string, unknown> {
  return {
    ...input,
    unit: "%"
  };
}

function fragmentAnimations(blockIds: string[]): Array<Record<string, unknown>> {
  return blockIds.map((targetBlockId, order) => ({
    targetBlockId,
    type: "fade-up",
    trigger: "fragment",
    order
  }));
}

function notes(speaker: string | undefined): Record<string, unknown> | undefined {
  return speaker === undefined ? undefined : { speaker };
}

function sourceSkill(id: string): Record<string, unknown> {
  return {
    id,
    version: "0.1.0"
  };
}

function blockId(slideId: string, suffix: string): string {
  return `${slideId}_${suffix}`;
}

function compactBlocks(blocks: Array<GeneratedBlock | undefined>): GeneratedBlock[] {
  return blocks.filter((block): block is GeneratedBlock => block !== undefined);
}

type FrameInput = {
  x: number;
  y: number;
  width: number;
  height: number;
};
