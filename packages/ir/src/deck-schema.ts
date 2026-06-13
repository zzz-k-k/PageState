//核心代码，定义了各类组件的数据结构
import { z } from "zod";

// Deck IR 当前版本号。以后如果 Deck IR 的字段结构发生不兼容变化，可以升级这个版本。
export const DeckSchemaVersion = "0.1.0" as const;

// 通用 ID 规则。用于 deck、slide、block、skill 等对象的 id，保证它们适合被代码、DOM attribute 和命令系统引用。
const IdSchema = z
  .string()//字符串类型
  .min(1)//至少1个字符
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens; start with a letter.");//正则表达式，必须以字母开头，后面可以跟着字母、数字、下划线或连字符

// 主题 token 引用规则。用于类似 color.text.primary、font.heading 这样的设计 token 名称。
const TokenRefSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_.-]*$/, "Use token names such as color.text.primary.");

// 元素外框规则。描述一个 block 在页面里的位置和尺寸，后续渲染器会把它转换成 CSS left/top/width/height。
export const FrameSchema = z
  .object({//必需是对象类型
    //对象就是类似
    /*{
      "id": "slide_001",
      "title": "第一页"
    }*/
   //object中包的就是一个对象
    x: z.number(),//数字类型
    y: z.number(),
    width: z.number().positive(),//positive表示正数
    height: z.number().positive(),
    unit: z.enum(["px", "%"]).default("%")//枚举类型，只能是px或%
  })
  .strict();//strict表示严格模式，不能有额外的属性

// 内容块样式规则。描述 block 的轻量视觉样式，例如对齐方式、文字颜色 token、背景 token 和强调程度。
export const BlockStyleSchema = z
  .object({
    variant: z.string().min(1).optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    colorToken: TokenRefSchema.optional(),
    backgroundToken: TokenRefSchema.optional(),
    emphasis: z.enum(["normal", "muted", "strong"]).optional()
  })
  .strict();

// 所有 block 的公共基础字段。每种内容块都必须有 id，并且可以选择带 frame 和 style。
const BlockBaseSchema = z
  .object({
    id: IdSchema,
    frame: FrameSchema.optional(),
    style: BlockStyleSchema.optional()
  })
  .strict();

// 标题块。用于页面主标题、副标题或小标题，level 决定渲染成 h1/h2/h3。
export const HeadingBlockSchema = BlockBaseSchema.extend({
  type: z.literal("heading"),//literal表示字段只能是括号中的固定值，用于身份验证
  text: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1)//default表示如果没有输入level自动补成1
}).strict();//union表示允许符合任意一种规则

// 段落块。用于普通正文说明，是最基础的文本内容块。
export const ParagraphBlockSchema = BlockBaseSchema.extend({
  type: z.literal("paragraph"),
  text: z.string().min(1)
}).strict();

// 列表块。用于项目符号列表或有序列表，items 是列表中的每一条内容。
export const ListBlockSchema = BlockBaseSchema.extend({
  type: z.literal("list"),
  ordered: z.boolean().default(false),
  items: z.array(z.string().min(1)).min(1)
}).strict();

// 图片来源规则。图片可以来自本地 assets 路径，也可以来自远程 URL。
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
      url: z.string().url()//只能是url
    })
    .strict()
]);

// 图片块。用于在 slide 中放置图片，并要求提供 alt 文本，方便可访问性和 AI 理解图片含义。
export const ImageBlockSchema = BlockBaseSchema.extend({
  type: z.literal("image"),
  source: ImageSourceSchema,
  alt: z.string().min(1),
  caption: z.string().optional()//optional表示字段可以不写
}).strict();

// 引用块。用于展示一句话观点、人物引言或强调语，可选 attribution 表示出处或作者。
export const QuoteBlockSchema = BlockBaseSchema.extend({
  type: z.literal("quote"),
  text: z.string().min(1),
  attribution: z.string().optional()
}).strict();

// 图表数据规则。columns 是列名，rows 是数据行；单元格允许字符串、数字或 null。
export const ChartDataSchema = z
  .object({
    columns: z.array(z.string().min(1)).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).min(1)
  })
  .strict();

// 图表块。用于表达 bar、line、area、pie、scatter 等基础图表；当前 renderer 先把它渲染成表格。
export const ChartBlockSchema = BlockBaseSchema.extend({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "area", "pie", "scatter"]),
  title: z.string().optional(),
  data: ChartDataSchema
}).strict();

// 代码块。用于技术演示、API 示例或配置片段，language 用于后续语法高亮。
export const CodeBlockSchema = BlockBaseSchema.extend({
  type: z.literal("code"),
  language: z.string().min(1),
  code: z.string().min(1)
}).strict();

// 内容块总规则。根据 block.type 自动选择 heading、paragraph、image、chart 等具体 schema。
export const BlockSchema = z.discriminatedUnion("type", [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  ListBlockSchema,
  ImageBlockSchema,
  QuoteBlockSchema,
  ChartBlockSchema,
  CodeBlockSchema
]);

// 页面布局规则。描述 slide 上 blocks 的排列方式，例如居中、堆叠、双栏、网格、时间线或自由布局。
export const LayoutSchema = z
  .object({
    type: z.enum(["centered", "stack", "two-column", "grid", "timeline", "chart", "freeform"]),
    gap: z.number().nonnegative().optional(),
    padding: z.number().nonnegative().optional(),
    columns: z.number().int().positive().optional()
  })
  .strict();

// 动画规则。描述某个 block 在进入页面、作为 fragment 或点击时使用什么基础动画。
export const AnimationSchema = z
  .object({
    targetBlockId: IdSchema,
    type: z.enum(["fade", "fade-up", "slide-left", "slide-right", "zoom", "none"]),
    trigger: z.enum(["enter", "fragment", "click"]).default("enter"),
    order: z.number().int().nonnegative().default(0)
  })
  .strict();

// 演讲者备注规则。speaker 是演讲时可见的备注，presenterOnly 可用于更私人的提示。
export const SpeakerNotesSchema = z
  .object({
    speaker: z.string().optional(),
    presenterOnly: z.string().optional()
  })
  .strict();

// Renderer 扩展属性值规则。给 reveal.js 这类渲染器传 section attribute 时，值允许是字符串、数字或布尔值。
const RendererAttributeValueSchema = z.union([z.string(), z.number(), z.boolean()]);

// reveal.js 专用 slide 扩展规则。用于表达 reveal 独有能力，例如转场、背景、auto-animate 和 section attributes。
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

// 渲染器提示总规则。核心 IR 不绑定某一个渲染器，但可以在这里为特定渲染器保留扩展配置。
export const RendererHintsSchema = z
  .object({
    reveal: RevealSlideHintsSchema.optional()
  })
  .strict();

// 单页 slide 规则。slide 是 deck 的主要页面单位，包含布局、内容块、动画、备注和可选的渲染器提示。
export const SlideSchema = z
  .object({
    id: IdSchema,
    type: z.enum([//enum中是字符串选项
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

// 主题规则。定义一套设计 token，包括颜色、字体、间距和圆角，渲染器会把它们转换成 CSS variables。
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

// 导出配置规则。描述 deck 默认导出尺寸、比例和格式，目前支持 html、pdf、png。
export const ExportConfigSchema = z
  .object({
    aspectRatio: z.enum(["16:9", "4:3", "custom"]).default("16:9"),
    width: z.number().int().positive().default(1920),
    height: z.number().int().positive().default(1080),
    formats: z.array(z.enum(["html", "pdf", "png"])).default(["html", "pdf"])
  })
  .strict();

// Deck 元数据规则。保存语言、作者、标签、创建时间和更新时间等非页面内容信息。
export const DeckMetadataSchema = z
  .object({
    locale: z.string().min(2).default("zh-CN"),
    author: z.string().optional(),
    tags: z.array(z.string().min(1)).default([]),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
  })
  .strict();

// 整份演示文稿的总规则。DeckSchema 是整个 Deck IR 的入口，AI、命令层和渲染器都会先用它校验数据。
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

// 下面这些 type 是从 Zod schema 自动推导出来的 TypeScript 类型，供其他包在写代码时获得类型提示和类型检查。
export type Deck = z.infer<typeof DeckSchema>;//infer用于自动从zodschema推导成ts类型
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
//deckschema是校验器对象，通过DeckSchema.parse(data);来检验数据是否合法，deck才是真正的数据类型