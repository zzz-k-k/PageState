import { z } from "zod";

export const DeckSchemaVersion = "0.1.0" as const;

const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens; start with a letter.");

const TokenRefSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_.-]*$/, "Use token names such as color.text.primary.");

export const FrameSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["px", "%"]).default("%")
  })
  .strict();

export const BlockStyleSchema = z
  .object({
    variant: z.string().min(1).optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    colorToken: TokenRefSchema.optional(),
    backgroundToken: TokenRefSchema.optional(),
    emphasis: z.enum(["normal", "muted", "strong"]).optional()
  })
  .strict();

const BlockBaseSchema = z
  .object({
    id: IdSchema,
    frame: FrameSchema.optional(),
    style: BlockStyleSchema.optional()
  })
  .strict();

export const HeadingBlockSchema = BlockBaseSchema.extend({
  type: z.literal("heading"),
  text: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1)
}).strict();

export const ParagraphBlockSchema = BlockBaseSchema.extend({
  type: z.literal("paragraph"),
  text: z.string().min(1)
}).strict();

export const ListBlockSchema = BlockBaseSchema.extend({
  type: z.literal("list"),
  ordered: z.boolean().default(false),
  items: z.array(z.string().min(1)).min(1)
}).strict();

export const ImageSourceSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("asset"),
      path: z.string().min(1)
    })
    .strict(),
  z
    .object({
      kind: z.literal("url"),
      url: z.string().url()
    })
    .strict()
]);

export const ImageBlockSchema = BlockBaseSchema.extend({
  type: z.literal("image"),
  source: ImageSourceSchema,
  alt: z.string().min(1),
  caption: z.string().optional()
}).strict();

export const QuoteBlockSchema = BlockBaseSchema.extend({
  type: z.literal("quote"),
  text: z.string().min(1),
  attribution: z.string().optional()
}).strict();

export const ChartDataSchema = z
  .object({
    columns: z.array(z.string().min(1)).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1)
  })
  .strict();

export const ChartBlockSchema = BlockBaseSchema.extend({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "area", "pie", "scatter"]),
  title: z.string().optional(),
  data: ChartDataSchema
}).strict();

export const CodeBlockSchema = BlockBaseSchema.extend({
  type: z.literal("code"),
  language: z.string().min(1),
  code: z.string().min(1)
}).strict();

export const BlockSchema = z.discriminatedUnion("type", [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  ListBlockSchema,
  ImageBlockSchema,
  QuoteBlockSchema,
  ChartBlockSchema,
  CodeBlockSchema
]);

export const LayoutSchema = z
  .object({
    type: z.enum(["centered", "stack", "two-column", "grid", "timeline", "chart", "freeform"]),
    gap: z.number().nonnegative().optional(),
    padding: z.number().nonnegative().optional(),
    columns: z.number().int().positive().optional()
  })
  .strict();

export const AnimationSchema = z
  .object({
    targetBlockId: IdSchema,
    type: z.enum(["fade", "fade-up", "slide-left", "slide-right", "zoom", "none"]),
    trigger: z.enum(["enter", "fragment", "click"]).default("enter"),
    order: z.number().int().nonnegative().default(0)
  })
  .strict();

export const SpeakerNotesSchema = z
  .object({
    speaker: z.string().optional(),
    presenterOnly: z.string().optional()
  })
  .strict();

const RendererAttributeValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const RevealSlideHintsSchema = z
  .object({
    transition: z.enum(["none", "fade", "slide", "convex", "concave", "zoom"]).optional(),
    backgroundColor: z.string().min(1).optional(),
    backgroundImage: z.string().min(1).optional(),
    backgroundVideo: z.string().min(1).optional(),
    autoAnimate: z.boolean().optional(),
    sectionAttributes: z.record(z.string().min(1), RendererAttributeValueSchema).default({})
  })
  .strict();

export const RendererHintsSchema = z
  .object({
    reveal: RevealSlideHintsSchema.optional()
  })
  .strict();

export const SlideSchema = z
  .object({
    id: IdSchema,
    type: z.enum([
      "hero",
      "section",
      "two-column",
      "comparison",
      "timeline",
      "chart",
      "quote",
      "architecture",
      "product-demo",
      "closing",
      "custom"
    ]),
    title: z.string().min(1).optional(),
    layout: LayoutSchema,
    blocks: z.array(BlockSchema).min(1),
    animations: z.array(AnimationSchema).default([]),
    notes: SpeakerNotesSchema.optional(),
    rendererHints: RendererHintsSchema.optional(),
    sourceSkill: z
      .object({
        id: IdSchema,
        version: z.string().min(1).optional()
      })
      .strict()
      .optional()
  })
  .strict();

export const ThemeSchema = z
  .object({
    id: IdSchema,
    name: z.string().min(1),
    tokens: z
      .object({
        colors: z.record(TokenRefSchema, z.string().min(1)).default({}),
        fonts: z.record(TokenRefSchema, z.string().min(1)).default({}),
        spacing: z.record(TokenRefSchema, z.number().nonnegative()).default({}),
        radii: z.record(TokenRefSchema, z.number().nonnegative()).default({})
      })
      .strict()
  })
  .strict();

export const ExportConfigSchema = z
  .object({
    aspectRatio: z.enum(["16:9", "4:3", "custom"]).default("16:9"),
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080),
    formats: z.array(z.enum(["html", "pdf", "png"])).default(["html", "pdf"])
  })
  .strict();

export const DeckMetadataSchema = z
  .object({
    locale: z.string().min(2).default("zh-CN"),
    author: z.string().optional(),
    tags: z.array(z.string().min(1)).default([]),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
  })
  .strict();

export const DeckSchema = z
  .object({
    schemaVersion: z.literal(DeckSchemaVersion),
    type: z.literal("deck"),
    id: IdSchema,
    title: z.string().min(1),
    description: z.string().optional(),
    theme: ThemeSchema,
    slides: z.array(SlideSchema).min(1),
    exportConfig: ExportConfigSchema.default({
      aspectRatio: "16:9",
      width: 1920,
      height: 1080,
      formats: ["html", "pdf"]
    }),
    metadata: DeckMetadataSchema.default({
      locale: "zh-CN",
      tags: []
    })
  })
  .strict();

export type Deck = z.infer<typeof DeckSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ExportConfig = z.infer<typeof ExportConfigSchema>;
export type Frame = z.infer<typeof FrameSchema>;
export type BlockStyle = z.infer<typeof BlockStyleSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
export type Animation = z.infer<typeof AnimationSchema>;
export type RendererHints = z.infer<typeof RendererHintsSchema>;
export type RevealSlideHints = z.infer<typeof RevealSlideHintsSchema>;
