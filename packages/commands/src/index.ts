export {
  AddAnimationCommandSchema,
  ApplyThemeCommandSchema,
  CommandSchema,
  ConvertSlideLayoutCommandSchema,
  CreateSlideCommandSchema,
  DeleteBlockCommandSchema,
  DeleteSlideCommandSchema,
  InsertBlockCommandSchema,
  PatchDeckCommandSchema,
  PatchOperationSchema,
  RemoveAnimationCommandSchema,
  ReorderSlidesCommandSchema,
  ReplaceBlockCommandSchema,
  SetSlideLayoutCommandSchema,
  UpdateBlockFrameCommandSchema,
  UpdateBlockPropsCommandSchema,
  UpdateBlockStyleCommandSchema,
  UpdateBlockTextCommandSchema,
  UpdateSlideTitleCommandSchema
} from "./command-schema.js";
export { executeCommand, executeCommands } from "./executor.js";

export type { Command, JsonValue, PatchOperation } from "./command-schema.js";
export type { CommandErrorCode, CommandExecutionError, CommandExecutionResult } from "./errors.js";
