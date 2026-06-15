import { Command, executeCommand } from "@pagestate/commands";
import { Deck, DeckSchema } from "@pagestate/ir";
import { create } from "zustand";
import { createBlankSlide } from "./deckUtils.js";
import { createWorkbenchDemoDeck } from "./sampleDeck.js";
import { clearWorkbenchDeck, loadWorkbenchDeck, saveWorkbenchDeck } from "./storage.js";

interface CommandOptions {
  selectedSlideId?: string;
  selectedBlockId?: string | null;
  status?: string;
}

interface WorkbenchState {
  deck: Deck;
  selectedSlideId: string;
  selectedBlockId: string | null;
  past: Deck[];
  future: Deck[];
  status: string;
  selectSlide: (slideId: string) => void;
  selectBlock: (blockId: string | null) => void;
  executeDeckCommand: (command: Command, options?: CommandOptions) => boolean;
  createSlide: () => void;
  deleteSelectedSlide: () => void;
  moveSelectedSlide: (direction: -1 | 1) => void;
  undo: () => void;
  redo: () => void;
  resetDemo: () => void;
  importDeck: (deckInput: unknown) => boolean;
  validateDeck: () => boolean;
  setStatus: (status: string) => void;
}

const initialDeck = loadWorkbenchDeck();

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  deck: initialDeck,
  selectedSlideId: initialDeck.slides[0]!.id,
  selectedBlockId: initialDeck.slides[0]!.blocks[0]!.id,
  past: [],
  future: [],
  status: "Ready",

  selectSlide(slideId) {
    const slide = get().deck.slides.find((candidate) => candidate.id === slideId);

    if (slide === undefined) {
      return;
    }

    set({
      selectedSlideId: slideId,
      selectedBlockId: slide.blocks[0]?.id ?? null,
      status: `Selected ${slideId}`
    });
  },

  selectBlock(blockId) {
    set({
      selectedBlockId: blockId,
      status: blockId === null ? "Selected slide" : `Selected ${blockId}`
    });
  },

  executeDeckCommand(command, options) {
    const state = get();
    const result = executeCommand(state.deck, {
      ...command,
      actor: "user",
      createdAt: new Date().toISOString()
    });

    if (!result.success) {
      set({
        status: `${result.error.code}: ${result.error.message}`
      });
      return false;
    }

    saveWorkbenchDeck(result.data);

    set({
      deck: result.data,
      past: [...state.past.slice(-49), state.deck],
      future: [],
      selectedSlideId: options?.selectedSlideId ?? state.selectedSlideId,
      selectedBlockId: options?.selectedBlockId ?? state.selectedBlockId,
      status: options?.status ?? `Ran ${command.type}`
    });

    return true;
  },

  createSlide() {
    const state = get();
    const slide = createBlankSlide(state.deck);

    state.executeDeckCommand(
      {
        type: "createSlide",
        slide
      },
      {
        selectedSlideId: slide.id,
        selectedBlockId: slide.blocks[0]?.id ?? null,
        status: "Created slide"
      }
    );
  },

  deleteSelectedSlide() {
    const state = get();

    if (state.deck.slides.length <= 1) {
      set({ status: "A deck needs at least one slide." });
      return;
    }

    const currentIndex = state.deck.slides.findIndex((slide) => slide.id === state.selectedSlideId);
    const nextSlide = state.deck.slides[currentIndex + 1] ?? state.deck.slides[currentIndex - 1] ?? state.deck.slides[0]!;

    state.executeDeckCommand(
      {
        type: "deleteSlide",
        slideId: state.selectedSlideId
      },
      {
        selectedSlideId: nextSlide.id,
        selectedBlockId: nextSlide.blocks[0]?.id ?? null,
        status: "Deleted slide"
      }
    );
  },

  moveSelectedSlide(direction) {
    const state = get();
    const currentIndex = state.deck.slides.findIndex((slide) => slide.id === state.selectedSlideId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= state.deck.slides.length) {
      return;
    }

    const slideIds = state.deck.slides.map((slide) => slide.id);
    const [selectedId] = slideIds.splice(currentIndex, 1);
    slideIds.splice(targetIndex, 0, selectedId!);

    state.executeDeckCommand(
      {
        type: "reorderSlides",
        slideIds
      },
      {
        status: "Reordered slides"
      }
    );
  },

  undo() {
    const state = get();
    const previous = state.past.at(-1);

    if (previous === undefined) {
      return;
    }

    saveWorkbenchDeck(previous);
    set({
      deck: previous,
      past: state.past.slice(0, -1),
      future: [state.deck, ...state.future],
      selectedSlideId: previous.slides[0]!.id,
      selectedBlockId: previous.slides[0]!.blocks[0]!.id,
      status: "Undid last command"
    });
  },

  redo() {
    const state = get();
    const next = state.future[0];

    if (next === undefined) {
      return;
    }

    saveWorkbenchDeck(next);
    set({
      deck: next,
      past: [...state.past, state.deck],
      future: state.future.slice(1),
      selectedSlideId: next.slides[0]!.id,
      selectedBlockId: next.slides[0]!.blocks[0]!.id,
      status: "Redid command"
    });
  },

  resetDemo() {
    const deck = createWorkbenchDemoDeck();
    clearWorkbenchDeck();
    saveWorkbenchDeck(deck);

    set({
      deck,
      selectedSlideId: deck.slides[0]!.id,
      selectedBlockId: deck.slides[0]!.blocks[0]!.id,
      past: [],
      future: [],
      status: "Loaded demo deck"
    });
  },

  importDeck(deckInput) {
    const result = DeckSchema.safeParse(deckInput);

    if (!result.success) {
      set({ status: "Import failed: deck does not match DeckSchema." });
      return false;
    }

    saveWorkbenchDeck(result.data);
    set({
      deck: result.data,
      selectedSlideId: result.data.slides[0]!.id,
      selectedBlockId: result.data.slides[0]!.blocks[0]!.id,
      past: [],
      future: [],
      status: "Imported deck"
    });

    return true;
  },

  validateDeck() {
    const result = DeckSchema.safeParse(get().deck);
    set({
      status: result.success ? "Deck is valid" : "Deck validation failed"
    });
    return result.success;
  },

  setStatus(status) {
    set({ status });
  }
}));
