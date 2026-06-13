import { z } from "zod";
import {
  AnimationSchema,
  BlockSchema,
  BlockStyleSchema,
  FrameSchema,
  LayoutSchema,
  SlideSchema,
  ThemeSchema
} from "@pagestate/ir";

// 下面这些是命令层共用的小规则，不是具体命令。
const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens; start with a letter.");

const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema)
  ])
);

const JsonPointerSchema = z
  .string()
  .min(1)
  .regex(/^\/(?:[^/~]|~0|~1)*(?:\/(?:[^/~]|~0|~1)*)*$/, "Use an RFC 6901 JSON Pointer such as /slides/0/title.");

const CommandMetaSchema = z
  .object({
    commandId: IdSchema.optional(),
    actor: z.enum(["user", "ai", "system"]).optional(),
    reason: z.string().min(1).optional(),
    createdAt: z.string().datetime().optional()
  })
  .strict();

// 创建一页新的 slide。
// - slide: 新 slide 的完整结构，包括 id、layout、blocks 等。
// - index: 可选插入位置；不写时 executor 会把新 slide 放到最后。
export const CreateSlideCommandSchema = CommandMetaSchema.extend({
  type: z.literal("createSlide"),
  slide: SlideSchema,
  index: z.number().int().nonnegative().optional()
}).strict();

// 删除一页 slide。
// - slideId: 要删除的 slide 的 id。
export const DeleteSlideCommandSchema = CommandMetaSchema.extend({
  type: z.literal("deleteSlide"),
  slideId: IdSchema
}).strict();

// 重新排列所有 slide 的顺序。
// - slideIds: 新顺序下的 slide id 列表，必须包含当前 deck 里的全部 slide id。
export const ReorderSlidesCommandSchema = CommandMetaSchema.extend({
  type: z.literal("reorderSlides"),
  slideIds: z.array(IdSchema).min(1)
}).strict();

// 修改某一页 slide 的标题。
// - title: 新标题；传 null 表示删除这页的标题字段。
export const UpdateSlideTitleCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateSlideTitle"),
  slideId: IdSchema,
  title: z.string().min(1).nullable()
}).strict();

// 替换某一页 slide 的布局设置。
// - layout: 新的布局结构，决定页面上的区域、列数、背景等布局信息。
export const SetSlideLayoutCommandSchema = CommandMetaSchema.extend({
  type: z.literal("setSlideLayout"),
  slideId: IdSchema,
  layout: LayoutSchema
}).strict();

// 往某一页 slide 里插入一个 block。
// - block: 新 block 的完整结构，比如文本块、图片块、代码块等。
// - index: 可选插入位置；不写时 executor 会把 block 放到这页最后。
export const InsertBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("insertBlock"),
  slideId: IdSchema,
  block: BlockSchema,
  index: z.number().int().nonnegative().optional()
}).strict();

// 删除某一页里的一个 block。
// - slideId: block 所在的 slide。
// - blockId: 要删除的 block。
export const DeleteBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("deleteBlock"),
  slideId: IdSchema,
  blockId: IdSchema
}).strict();

// 用一个新的 block 整体替换旧 block。
// - blockId: 被替换的旧 block。
// - block: 替换进去的新 block 完整结构。
export const ReplaceBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("replaceBlock"),
  slideId: IdSchema,
  blockId: IdSchema,
  block: BlockSchema
}).strict();

// 修改 block 的文本内容。
// - text: 新文本；executor 会要求目标 block 本身必须有 text 字段。
export const UpdateBlockTextCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockText"),
  slideId: IdSchema,
  blockId: IdSchema,
  text: z.string().min(1)
}).strict();

// 修改 block 的位置和尺寸。
// - frame: 新的位置尺寸；传 null 表示删除这个 block 自己的 frame，让它回到布局默认规则。
export const UpdateBlockFrameCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockFrame"),
  slideId: IdSchema,
  blockId: IdSchema,
  frame: FrameSchema.nullable()
}).strict();

// 修改 block 的样式。
// - style: 新样式；传 null 表示删除这个 block 自己的 style，让它回到默认样式。
export const UpdateBlockStyleCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockStyle"),
  slideId: IdSchema,
  blockId: IdSchema,
  style: BlockStyleSchema.nullable()
}).strict();

// 修改 block 的额外属性。
// - props: 要合并到 block 上的属性；executor 会禁止修改 id、type、frame、style 这些核心字段。
export const UpdateBlockPropsCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockProps"),
  slideId: IdSchema,
  blockId: IdSchema,
  props: z.record(z.string(), JsonValueSchema)
}).strict();

// 给某一页添加动画。
// - animation: 动画完整结构，包括作用目标 targetBlockId 和动画效果等信息。
export const AddAnimationCommandSchema = CommandMetaSchema.extend({
  type: z.literal("addAnimation"),
  slideId: IdSchema,
  animation: AnimationSchema
}).strict();

// 删除某一页的一个动画。
// - animationIndex: 动画在 slide.animations 数组里的位置，从 0 开始。
export const RemoveAnimationCommandSchema = CommandMetaSchema.extend({
  type: z.literal("removeAnimation"),
  slideId: IdSchema,
  animationIndex: z.number().int().nonnegative()
}).strict();

// 应用整份 deck 的主题。
// - theme: 新主题，会替换 deck.theme。
export const ApplyThemeCommandSchema = CommandMetaSchema.extend({
  type: z.literal("applyTheme"),
  theme: ThemeSchema
}).strict();

// 把一页 slide 转换成另一种布局形态。
// - layout: 必填，新的布局。
// - slideType、title、blocks: 可选，允许转换布局时顺便调整页面类型、标题和内容块。
export const ConvertSlideLayoutCommandSchema = CommandMetaSchema.extend({
  type: z.literal("convertSlideLayout"),
  slideId: IdSchema,
  slideType: SlideSchema.shape.type.optional(),
  title: z.string().min(1).nullable().optional(),
  layout: LayoutSchema,
  blocks: z.array(BlockSchema).min(1).optional()
}).strict();

// patchDeck 使用的单条 JSON Patch 操作。
// 它不是给普通编辑优先使用的命令，而是当专用命令不够用时的受控补充能力。
export const PatchOperationSchema = z.discriminatedUnion("op", [
  z
    .object({
      op: z.literal("add"),
      path: JsonPointerSchema,
      value: JsonValueSchema
    })
    .strict(),
  z
    .object({
      op: z.literal("replace"),
      path: JsonPointerSchema,
      value: JsonValueSchema
    })
    .strict(),
  z
    .object({
      op: z.literal("remove"),
      path: JsonPointerSchema
    })
    .strict()
]);

// 使用 JSON Pointer 对 deck 做受控 patch。
// - operations: 至少一条 add、replace 或 remove 操作；executor 会禁止修改 schemaVersion、type 等根字段。
export const PatchDeckCommandSchema = CommandMetaSchema.extend({
  type: z.literal("patchDeck"),
  operations: z.array(PatchOperationSchema).min(1)
}).strict();

// 所有命令的总入口。
// discriminatedUnion 会根据 type 字段自动判断当前 JSON 应该匹配哪一种命令。
export const CommandSchema = z.discriminatedUnion("type", [
  CreateSlideCommandSchema,
  DeleteSlideCommandSchema,
  ReorderSlidesCommandSchema,
  UpdateSlideTitleCommandSchema,
  SetSlideLayoutCommandSchema,
  InsertBlockCommandSchema,
  DeleteBlockCommandSchema,
  ReplaceBlockCommandSchema,
  UpdateBlockTextCommandSchema,
  UpdateBlockFrameCommandSchema,
  UpdateBlockStyleCommandSchema,
  UpdateBlockPropsCommandSchema,
  AddAnimationCommandSchema,
  RemoveAnimationCommandSchema,
  ApplyThemeCommandSchema,
  ConvertSlideLayoutCommandSchema,
  PatchDeckCommandSchema
]);

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type Command = z.infer<typeof CommandSchema>;
