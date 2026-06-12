import { Block, Deck, DeckSchema, Slide } from "@pagestate/ir";
import { Command, CommandSchema, PatchOperation } from "./command-schema.js";
import { commandError, CommandExecutionResult } from "./errors.js";

const BLOCK_PROP_FORBIDDEN_KEYS = new Set(["id", "type", "frame", "style"]);
const PATCH_FORBIDDEN_ROOTS = new Set(["schemaVersion", "type"]);

export function executeCommand(deckInput: unknown, commandInput: unknown): CommandExecutionResult<Deck> {
  const deckResult = DeckSchema.safeParse(deckInput);

  if (!deckResult.success) {
    return commandError("INVALID_DECK", "Input deck does not match DeckSchema.", {
      details: deckResult.error.issues
    });
  }

  const commandResult = CommandSchema.safeParse(commandInput);

  if (!commandResult.success) {
    return commandError("INVALID_COMMAND", "Command does not match CommandSchema.", {
      details: commandResult.error.issues
    });
  }

  const nextDeck = clone(deckResult.data);
  const mutationResult = mutateDeck(nextDeck, commandResult.data);

  if (!mutationResult.success) {
    return mutationResult;
  }

  const validationResult = DeckSchema.safeParse(nextDeck);

  if (!validationResult.success) {
    return commandError("SCHEMA_VIOLATION", "Command produced an invalid deck.", {
      details: validationResult.error.issues
    });
  }

  return {
    success: true,
    data: validationResult.data
  };
}

export function executeCommands(deckInput: unknown, commandInputs: unknown[]): CommandExecutionResult<Deck> {
  let current: unknown = deckInput;

  for (const commandInput of commandInputs) {
    const result = executeCommand(current, commandInput);

    if (!result.success) {
      return result;
    }

    current = result.data;
  }

  return {
    success: true,
    data: current as Deck
  };
}

function mutateDeck(deck: Deck, command: Command): CommandExecutionResult<Deck> {
  switch (command.type) {
    case "createSlide":
      return createSlide(deck, command.slide, command.index);
    case "deleteSlide":
      return deleteSlide(deck, command.slideId);
    case "reorderSlides":
      return reorderSlides(deck, command.slideIds);
    case "updateSlideTitle":
      return updateSlideTitle(deck, command.slideId, command.title);
    case "setSlideLayout":
      return setSlideLayout(deck, command.slideId, command.layout);
    case "insertBlock":
      return insertBlock(deck, command.slideId, command.block, command.index);
    case "deleteBlock":
      return deleteBlock(deck, command.slideId, command.blockId);
    case "replaceBlock":
      return replaceBlock(deck, command.slideId, command.blockId, command.block);
    case "updateBlockText":
      return updateBlockText(deck, command.slideId, command.blockId, command.text);
    case "updateBlockFrame":
      return updateBlockFrame(deck, command.slideId, command.blockId, command.frame);
    case "updateBlockStyle":
      return updateBlockStyle(deck, command.slideId, command.blockId, command.style);
    case "updateBlockProps":
      return updateBlockProps(deck, command.slideId, command.blockId, command.props);
    case "addAnimation":
      return addAnimation(deck, command.slideId, command.animation);
    case "removeAnimation":
      return removeAnimation(deck, command.slideId, command.animationIndex);
    case "applyTheme":
      deck.theme = command.theme;
      return ok(deck);
    case "convertSlideLayout":
      return convertSlideLayout(deck, command);
    case "patchDeck":
      return patchDeck(deck, command.operations);
  }
}

function createSlide(deck: Deck, slide: Slide, index: number | undefined): CommandExecutionResult<Deck> {
  if (deck.slides.some((existing) => existing.id === slide.id)) {
    return commandError("DUPLICATE_ID", `Slide "${slide.id}" already exists.`, { path: "slide.id" });
  }

  const insertionIndex = index ?? deck.slides.length;

  if (insertionIndex > deck.slides.length) {
    return commandError("INVALID_INDEX", `Slide index ${insertionIndex} is out of range.`, { path: "index" });
  }

  deck.slides.splice(insertionIndex, 0, slide);
  return ok(deck);
}

function deleteSlide(deck: Deck, slideId: string): CommandExecutionResult<Deck> {
  if (deck.slides.length === 1) {
    return commandError("INVALID_OPERATION", "Cannot delete the last slide.", { path: "slides" });
  }

  const slideIndex = deck.slides.findIndex((slide) => slide.id === slideId);

  if (slideIndex === -1) {
    return commandError("NOT_FOUND", `Slide "${slideId}" was not found.`, { path: "slideId" });
  }

  deck.slides.splice(slideIndex, 1);
  return ok(deck);
}

function reorderSlides(deck: Deck, slideIds: string[]): CommandExecutionResult<Deck> {
  const currentIds = deck.slides.map((slide) => slide.id);

  if (new Set(slideIds).size !== slideIds.length) {
    return commandError("DUPLICATE_ID", "slideIds contains duplicate slide IDs.", { path: "slideIds" });
  }

  if (slideIds.length !== currentIds.length || !currentIds.every((id) => slideIds.includes(id))) {
    return commandError("INVALID_OPERATION", "slideIds must contain exactly the current slide IDs.", {
      path: "slideIds"
    });
  }

  const slidesById = new Map(deck.slides.map((slide) => [slide.id, slide]));
  deck.slides = slideIds.map((id) => slidesById.get(id)!);
  return ok(deck);
}

function updateSlideTitle(deck: Deck, slideId: string, title: string | null): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  if (title === null) {
    delete slideResult.data.title;
  } else {
    slideResult.data.title = title;
  }

  return ok(deck);
}

function setSlideLayout(deck: Deck, slideId: string, layout: Slide["layout"]): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  slideResult.data.layout = layout;
  return ok(deck);
}

function insertBlock(deck: Deck, slideId: string, block: Block, index: number | undefined): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  const slide = slideResult.data;

  if (slide.blocks.some((existing) => existing.id === block.id)) {
    return commandError("DUPLICATE_ID", `Block "${block.id}" already exists.`, { path: "block.id" });
  }

  const insertionIndex = index ?? slide.blocks.length;

  if (insertionIndex > slide.blocks.length) {
    return commandError("INVALID_INDEX", `Block index ${insertionIndex} is out of range.`, { path: "index" });
  }

  slide.blocks.splice(insertionIndex, 0, block);
  return ok(deck);
}

function deleteBlock(deck: Deck, slideId: string, blockId: string): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  const slide = slideResult.data;

  if (slide.blocks.length === 1) {
    return commandError("INVALID_OPERATION", "Cannot delete the last block from a slide.", { path: "blocks" });
  }

  const blockIndex = slide.blocks.findIndex((block) => block.id === blockId);

  if (blockIndex === -1) {
    return commandError("NOT_FOUND", `Block "${blockId}" was not found.`, { path: "blockId" });
  }

  slide.blocks.splice(blockIndex, 1);
  return ok(deck);
}

function replaceBlock(deck: Deck, slideId: string, blockId: string, block: Block): CommandExecutionResult<Deck> {
  const blockResult = findBlock(deck, slideId, blockId);

  if (!blockResult.success) {
    return blockResult;
  }

  const { slide, blockIndex } = blockResult.data;

  if (block.id !== blockId && slide.blocks.some((existing) => existing.id === block.id)) {
    return commandError("DUPLICATE_ID", `Block "${block.id}" already exists.`, { path: "block.id" });
  }

  slide.blocks[blockIndex] = block;
  return ok(deck);
}

function updateBlockText(deck: Deck, slideId: string, blockId: string, text: string): CommandExecutionResult<Deck> {
  const blockResult = findBlock(deck, slideId, blockId);

  if (!blockResult.success) {
    return blockResult;
  }

  const block = blockResult.data.block;

  if (!("text" in block)) {
    return commandError("INVALID_OPERATION", `Block "${blockId}" does not have a text field.`, {
      path: "blockId"
    });
  }

  block.text = text;
  return ok(deck);
}

function updateBlockFrame(
  deck: Deck,
  slideId: string,
  blockId: string,
  frame: Block["frame"] | null
): CommandExecutionResult<Deck> {
  const blockResult = findBlock(deck, slideId, blockId);

  if (!blockResult.success) {
    return blockResult;
  }

  if (frame === null) {
    delete blockResult.data.block.frame;
  } else {
    blockResult.data.block.frame = frame;
  }

  return ok(deck);
}

function updateBlockStyle(
  deck: Deck,
  slideId: string,
  blockId: string,
  style: Block["style"] | null
): CommandExecutionResult<Deck> {
  const blockResult = findBlock(deck, slideId, blockId);

  if (!blockResult.success) {
    return blockResult;
  }

  if (style === null) {
    delete blockResult.data.block.style;
  } else {
    blockResult.data.block.style = style;
  }

  return ok(deck);
}

function updateBlockProps(
  deck: Deck,
  slideId: string,
  blockId: string,
  props: Record<string, unknown>
): CommandExecutionResult<Deck> {
  const blockResult = findBlock(deck, slideId, blockId);

  if (!blockResult.success) {
    return blockResult;
  }

  for (const key of Object.keys(props)) {
    if (BLOCK_PROP_FORBIDDEN_KEYS.has(key)) {
      return commandError("INVALID_OPERATION", `updateBlockProps cannot modify "${key}".`, {
        path: `props.${key}`
      });
    }
  }

  Object.assign(blockResult.data.block, props);
  return ok(deck);
}

function addAnimation(
  deck: Deck,
  slideId: string,
  animation: Slide["animations"][number]
): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  if (!slideResult.data.blocks.some((block) => block.id === animation.targetBlockId)) {
    return commandError("NOT_FOUND", `Animation target "${animation.targetBlockId}" was not found.`, {
      path: "animation.targetBlockId"
    });
  }

  slideResult.data.animations.push(animation);
  return ok(deck);
}

function removeAnimation(deck: Deck, slideId: string, animationIndex: number): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  if (animationIndex >= slideResult.data.animations.length) {
    return commandError("INVALID_INDEX", `Animation index ${animationIndex} is out of range.`, {
      path: "animationIndex"
    });
  }

  slideResult.data.animations.splice(animationIndex, 1);
  return ok(deck);
}

function convertSlideLayout(
  deck: Deck,
  command: Extract<Command, { type: "convertSlideLayout" }>
): CommandExecutionResult<Deck> {
  const slideResult = findSlide(deck, command.slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  const slide = slideResult.data;
  slide.layout = command.layout;

  if (command.slideType !== undefined) {
    slide.type = command.slideType;
  }

  if (command.title !== undefined) {
    if (command.title === null) {
      delete slide.title;
    } else {
      slide.title = command.title;
    }
  }

  if (command.blocks !== undefined) {
    const blockIds = command.blocks.map((block) => block.id);

    if (new Set(blockIds).size !== blockIds.length) {
      return commandError("DUPLICATE_ID", "Converted slide blocks contain duplicate IDs.", { path: "blocks" });
    }

    slide.blocks = command.blocks;
    slide.animations = slide.animations.filter((animation) =>
      command.blocks?.some((block) => block.id === animation.targetBlockId)
    );
  }

  return ok(deck);
}

function patchDeck(deck: Deck, operations: PatchOperation[]): CommandExecutionResult<Deck> {
  for (const operation of operations) {
    const root = decodePointer(operation.path)[0];

    if (root === undefined || PATCH_FORBIDDEN_ROOTS.has(root)) {
      return commandError("INVALID_OPERATION", `patchDeck cannot modify "${operation.path}".`, {
        path: operation.path
      });
    }

    const result = applyPatchOperation(deck, operation);

    if (!result.success) {
      return result;
    }
  }

  return ok(deck);
}

function applyPatchOperation(target: unknown, operation: PatchOperation): CommandExecutionResult<Deck> {
  const parts = decodePointer(operation.path);
  const parentResult = getPatchParent(target, parts);

  if (!parentResult.success) {
    return parentResult;
  }

  const { parent, key } = parentResult.data;

  if (Array.isArray(parent)) {
    return applyArrayPatch(parent, key, operation);
  }

  if (isRecord(parent)) {
    return applyObjectPatch(parent, key, operation);
  }

  return commandError("INVALID_OPERATION", `Cannot patch non-container path "${operation.path}".`, {
    path: operation.path
  });
}

function applyArrayPatch(parent: unknown[], key: string, operation: PatchOperation): CommandExecutionResult<Deck> {
  if (operation.op === "add" && key === "-") {
    parent.push(operation.value);
    return okPlaceholder();
  }

  const index = Number(key);

  if (!Number.isInteger(index) || index < 0) {
    return commandError("INVALID_INDEX", `Invalid array index "${key}".`);
  }

  if (operation.op === "add") {
    if (index > parent.length) {
      return commandError("INVALID_INDEX", `Array index ${index} is out of range.`);
    }

    parent.splice(index, 0, operation.value);
    return okPlaceholder();
  }

  if (index >= parent.length) {
    return commandError("INVALID_INDEX", `Array index ${index} is out of range.`);
  }

  if (operation.op === "replace") {
    parent[index] = operation.value;
  } else {
    parent.splice(index, 1);
  }

  return okPlaceholder();
}

function applyObjectPatch(
  parent: Record<string, unknown>,
  key: string,
  operation: PatchOperation
): CommandExecutionResult<Deck> {
  if (operation.op !== "add" && !(key in parent)) {
    return commandError("NOT_FOUND", `Object key "${key}" was not found.`);
  }

  if (operation.op === "remove") {
    delete parent[key];
  } else {
    parent[key] = operation.value;
  }

  return okPlaceholder();
}

function getPatchParent(target: unknown, parts: string[]): CommandExecutionResult<{ parent: unknown; key: string }> {
  if (parts.length === 0) {
    return commandError("INVALID_OPERATION", "Root-level patching is not allowed.");
  }

  let parent = target;

  for (const part of parts.slice(0, -1)) {
    if (Array.isArray(parent)) {
      const index = Number(part);

      if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
        return commandError("INVALID_INDEX", `Array index ${part} is out of range.`);
      }

      parent = parent[index];
      continue;
    }

    if (isRecord(parent) && part in parent) {
      parent = parent[part];
      continue;
    }

    return commandError("NOT_FOUND", `Patch path segment "${part}" was not found.`);
  }

  return {
    success: true,
    data: {
      parent,
      key: parts[parts.length - 1]!
    }
  };
}

function decodePointer(path: string): string[] {
  return path
    .slice(1)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function findSlide(deck: Deck, slideId: string): CommandExecutionResult<Slide> {
  const slide = deck.slides.find((candidate) => candidate.id === slideId);

  if (slide === undefined) {
    return commandError("NOT_FOUND", `Slide "${slideId}" was not found.`, { path: "slideId" });
  }

  return {
    success: true,
    data: slide
  };
}

function findBlock(
  deck: Deck,
  slideId: string,
  blockId: string
): CommandExecutionResult<{ slide: Slide; block: Block; blockIndex: number }> {
  const slideResult = findSlide(deck, slideId);

  if (!slideResult.success) {
    return slideResult;
  }

  const blockIndex = slideResult.data.blocks.findIndex((candidate) => candidate.id === blockId);

  if (blockIndex === -1) {
    return commandError("NOT_FOUND", `Block "${blockId}" was not found.`, { path: "blockId" });
  }

  return {
    success: true,
    data: {
      slide: slideResult.data,
      block: slideResult.data.blocks[blockIndex]!,
      blockIndex
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return globalThis.structuredClone(value);
}

function ok(deck: Deck): CommandExecutionResult<Deck> {
  return {
    success: true,
    data: deck
  };
}

function okPlaceholder(): CommandExecutionResult<Deck> {
  return {
    success: true,
    data: undefined as unknown as Deck
  };
}
