import { z } from "zod";

const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens; start with a letter.");

const NonEmptyStringSchema = z.string().min(1);
const ShortTextSchema = NonEmptyStringSchema.max(80);
const MediumTextSchema = NonEmptyStringSchema.max(160);
const LongTextSchema = NonEmptyStringSchema.max(260);
const BulletTextSchema = NonEmptyStringSchema.max(110);

const TemplateBaseSchema = z
  .object({
    id: IdSchema,
    speakerNotes: LongTextSchema.optional()
  })
  .strict();

const TextColumnSchema = z
  .object({
    heading: ShortTextSchema,
    body: MediumTextSchema.optional(),
    items: z.array(BulletTextSchema).min(1).max(5).default([])
  })
  .strict();

const ComparisonItemSchema = z
  .object({
    label: ShortTextSchema,
    points: z.array(BulletTextSchema).min(1).max(5)
  })
  .strict();

const TimelineEventSchema = z
  .object({
    label: ShortTextSchema,
    description: MediumTextSchema
  })
  .strict();

export const TemplateIdSchema = z.enum([
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
]);

export const HeroTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("hero"),
  eyebrow: ShortTextSchema.optional(),
  title: ShortTextSchema,
  subtitle: MediumTextSchema.optional()
}).strict();

export const SectionTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("section"),
  sectionNumber: ShortTextSchema.optional(),
  title: ShortTextSchema,
  subtitle: MediumTextSchema.optional()
}).strict();

export const TwoColumnTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("two-column"),
  title: ShortTextSchema,
  left: TextColumnSchema,
  right: TextColumnSchema
}).strict();

export const ComparisonTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("comparison"),
  title: ShortTextSchema,
  items: z.array(ComparisonItemSchema).min(2).max(3)
}).strict();

export const TimelineTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("timeline"),
  title: ShortTextSchema,
  events: z.array(TimelineEventSchema).min(2).max(6)
}).strict();

export const ChartSlideTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("chart-slide"),
  title: ShortTextSchema,
  chartTitle: ShortTextSchema.optional(),
  chartType: z.enum(["bar", "line", "area", "pie", "scatter"]).default("bar"),
  columns: z.array(ShortTextSchema).min(1).max(8),
  rows: z.array(z.array(z.union([z.string().max(80), z.number(), z.null()]))).min(1).max(12),
  insight: MediumTextSchema.optional()
}).strict();

export const QuoteHeroTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("quote-hero"),
  quote: MediumTextSchema,
  attribution: ShortTextSchema.optional()
}).strict();

export const ArchitectureTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("architecture"),
  title: ShortTextSchema,
  summary: MediumTextSchema.optional(),
  steps: z.array(BulletTextSchema).min(2).max(7)
}).strict();

export const ProductDemoTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("product-demo"),
  title: ShortTextSchema,
  summary: MediumTextSchema,
  steps: z.array(BulletTextSchema).min(1).max(6),
  screenshotUrl: z.string().url().optional()
}).strict();

export const ClosingTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("closing"),
  title: ShortTextSchema,
  subtitle: MediumTextSchema.optional(),
  nextSteps: z.array(BulletTextSchema).max(5).default([]),
  contact: ShortTextSchema.optional()
}).strict();

export const TemplateInputSchema = z.discriminatedUnion("template", [
  HeroTemplateInputSchema,
  SectionTemplateInputSchema,
  TwoColumnTemplateInputSchema,
  ComparisonTemplateInputSchema,
  TimelineTemplateInputSchema,
  ChartSlideTemplateInputSchema,
  QuoteHeroTemplateInputSchema,
  ArchitectureTemplateInputSchema,
  ProductDemoTemplateInputSchema,
  ClosingTemplateInputSchema
]);

export type TemplateId = z.infer<typeof TemplateIdSchema>;
export type HeroTemplateInput = z.input<typeof HeroTemplateInputSchema>;
export type SectionTemplateInput = z.input<typeof SectionTemplateInputSchema>;
export type TwoColumnTemplateInput = z.input<typeof TwoColumnTemplateInputSchema>;
export type ComparisonTemplateInput = z.input<typeof ComparisonTemplateInputSchema>;
export type TimelineTemplateInput = z.input<typeof TimelineTemplateInputSchema>;
export type ChartSlideTemplateInput = z.input<typeof ChartSlideTemplateInputSchema>;
export type QuoteHeroTemplateInput = z.input<typeof QuoteHeroTemplateInputSchema>;
export type ArchitectureTemplateInput = z.input<typeof ArchitectureTemplateInputSchema>;
export type ProductDemoTemplateInput = z.input<typeof ProductDemoTemplateInputSchema>;
export type ClosingTemplateInput = z.input<typeof ClosingTemplateInputSchema>;
export type TemplateInput = z.input<typeof TemplateInputSchema>;
export type ParsedTemplateInput = z.infer<typeof TemplateInputSchema>;
