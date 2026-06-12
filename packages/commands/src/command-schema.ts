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

export const CreateSlideCommandSchema = CommandMetaSchema.extend({
  type: z.literal("createSlide"),
  slide: SlideSchema,
  index: z.number().int().nonnegative().optional()
}).strict();

export const DeleteSlideCommandSchema = CommandMetaSchema.extend({
  type: z.literal("deleteSlide"),
  slideId: IdSchema
}).strict();

export const ReorderSlidesCommandSchema = CommandMetaSchema.extend({
  type: z.literal("reorderSlides"),
  slideIds: z.array(IdSchema).min(1)
}).strict();

export const UpdateSlideTitleCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateSlideTitle"),
  slideId: IdSchema,
  title: z.string().min(1).nullable()
}).strict();

export const SetSlideLayoutCommandSchema = CommandMetaSchema.extend({
  type: z.literal("setSlideLayout"),
  slideId: IdSchema,
  layout: LayoutSchema
}).strict();

export const InsertBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("insertBlock"),
  slideId: IdSchema,
  block: BlockSchema,
  index: z.number().int().nonnegative().optional()
}).strict();

export const DeleteBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("deleteBlock"),
  slideId: IdSchema,
  blockId: IdSchema
}).strict();

export const ReplaceBlockCommandSchema = CommandMetaSchema.extend({
  type: z.literal("replaceBlock"),
  slideId: IdSchema,
  blockId: IdSchema,
  block: BlockSchema
}).strict();

export const UpdateBlockTextCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockText"),
  slideId: IdSchema,
  blockId: IdSchema,
  text: z.string().min(1)
}).strict();

export const UpdateBlockFrameCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockFrame"),
  slideId: IdSchema,
  blockId: IdSchema,
  frame: FrameSchema.nullable()
}).strict();

export const UpdateBlockStyleCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockStyle"),
  slideId: IdSchema,
  blockId: IdSchema,
  style: BlockStyleSchema.nullable()
}).strict();

export const UpdateBlockPropsCommandSchema = CommandMetaSchema.extend({
  type: z.literal("updateBlockProps"),
  slideId: IdSchema,
  blockId: IdSchema,
  props: z.record(z.string(), JsonValueSchema)
}).strict();

export const AddAnimationCommandSchema = CommandMetaSchema.extend({
  type: z.literal("addAnimation"),
  slideId: IdSchema,
  animation: AnimationSchema
}).strict();

export const RemoveAnimationCommandSchema = CommandMetaSchema.extend({
  type: z.literal("removeAnimation"),
  slideId: IdSchema,
  animationIndex: z.number().int().nonnegative()
}).strict();

export const ApplyThemeCommandSchema = CommandMetaSchema.extend({
  type: z.literal("applyTheme"),
  theme: ThemeSchema
}).strict();

export const ConvertSlideLayoutCommandSchema = CommandMetaSchema.extend({
  type: z.literal("convertSlideLayout"),
  slideId: IdSchema,
  slideType: SlideSchema.shape.type.optional(),
  title: z.string().min(1).nullable().optional(),
  layout: LayoutSchema,
  blocks: z.array(BlockSchema).min(1).optional()
}).strict();

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

export const PatchDeckCommandSchema = CommandMetaSchema.extend({
  type: z.literal("patchDeck"),
  operations: z.array(PatchOperationSchema).min(1)
}).strict();

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
