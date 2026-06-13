import { z } from "zod";

const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens; start with a letter.");

const NonEmptyStringSchema = z.string().min(1);

const TemplateBaseSchema = z
  .object({
    id: IdSchema,
    speakerNotes: NonEmptyStringSchema.optional()
  })
  .strict();

const TextColumnSchema = z
  .object({
    heading: NonEmptyStringSchema,
    body: NonEmptyStringSchema.optional(),
    items: z.array(NonEmptyStringSchema).min(1).default([])
  })
  .strict();

const ComparisonItemSchema = z
  .object({
    label: NonEmptyStringSchema,
    points: z.array(NonEmptyStringSchema).min(1)
  })
  .strict();

const TimelineEventSchema = z
  .object({
    label: NonEmptyStringSchema,
    description: NonEmptyStringSchema
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
  eyebrow: NonEmptyStringSchema.optional(),
  title: NonEmptyStringSchema,
  subtitle: NonEmptyStringSchema.optional()
}).strict();

export const SectionTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("section"),
  sectionNumber: NonEmptyStringSchema.optional(),
  title: NonEmptyStringSchema,
  subtitle: NonEmptyStringSchema.optional()
}).strict();

export const TwoColumnTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("two-column"),
  title: NonEmptyStringSchema,
  left: TextColumnSchema,
  right: TextColumnSchema
}).strict();

export const ComparisonTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("comparison"),
  title: NonEmptyStringSchema,
  items: z.array(ComparisonItemSchema).min(2).max(3)
}).strict();

export const TimelineTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("timeline"),
  title: NonEmptyStringSchema,
  events: z.array(TimelineEventSchema).min(2).max(6)
}).strict();

export const ChartSlideTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("chart-slide"),
  title: NonEmptyStringSchema,
  chartTitle: NonEmptyStringSchema.optional(),
  chartType: z.enum(["bar", "line", "area", "pie", "scatter"]).default("bar"),
  columns: z.array(NonEmptyStringSchema).min(1),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1),
  insight: NonEmptyStringSchema.optional()
}).strict();

export const QuoteHeroTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("quote-hero"),
  quote: NonEmptyStringSchema,
  attribution: NonEmptyStringSchema.optional()
}).strict();

export const ArchitectureTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("architecture"),
  title: NonEmptyStringSchema,
  summary: NonEmptyStringSchema.optional(),
  steps: z.array(NonEmptyStringSchema).min(2).max(7)
}).strict();

export const ProductDemoTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("product-demo"),
  title: NonEmptyStringSchema,
  summary: NonEmptyStringSchema,
  steps: z.array(NonEmptyStringSchema).min(1).max(6),
  screenshotUrl: z.string().url().optional()
}).strict();

export const ClosingTemplateInputSchema = TemplateBaseSchema.extend({
  template: z.literal("closing"),
  title: NonEmptyStringSchema,
  subtitle: NonEmptyStringSchema.optional(),
  nextSteps: z.array(NonEmptyStringSchema).default([]),
  contact: NonEmptyStringSchema.optional()
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
