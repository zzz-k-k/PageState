export {
  ArchitectureTemplateInputSchema,
  ChartSlideTemplateInputSchema,
  ClosingTemplateInputSchema,
  ComparisonTemplateInputSchema,
  HeroTemplateInputSchema,
  ProductDemoTemplateInputSchema,
  QuoteHeroTemplateInputSchema,
  SectionTemplateInputSchema,
  TemplateIdSchema,
  TemplateInputSchema,
  TimelineTemplateInputSchema,
  TwoColumnTemplateInputSchema
} from "./template-schema.js";

export type {
  ArchitectureTemplateInput,
  ChartSlideTemplateInput,
  ClosingTemplateInput,
  ComparisonTemplateInput,
  HeroTemplateInput,
  ParsedTemplateInput,
  ProductDemoTemplateInput,
  QuoteHeroTemplateInput,
  SectionTemplateInput,
  TemplateId,
  TemplateInput,
  TimelineTemplateInput,
  TwoColumnTemplateInput
} from "./template-schema.js";

export {
  TEMPLATE_IDS,
  createArchitectureSlide,
  createChartSlide,
  createClosingSlide,
  createComparisonSlide,
  createHeroSlide,
  createProductDemoSlide,
  createQuoteHeroSlide,
  createSectionSlide,
  createSlideFromTemplate,
  createSlidesFromTemplates,
  createTimelineSlide,
  createTwoColumnSlide
} from "./templates.js";

export { TEMPLATE_DEMO_INPUTS, createTemplateDemoDeck } from "./demo-deck.js";
