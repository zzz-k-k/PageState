import { Deck, DeckSchema } from "@pagestate/ir";
import { createWorkbenchDemoDeck } from "./sampleDeck.js";

const STORAGE_KEY = "pagestate.workbench.deck.v1";

export function loadWorkbenchDeck(): Deck {
  if (typeof window === "undefined") {
    return createWorkbenchDemoDeck();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    return createWorkbenchDemoDeck();
  }

  try {
    const parsed = DeckSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : createWorkbenchDemoDeck();
  } catch {
    return createWorkbenchDemoDeck();
  }
}

export function saveWorkbenchDeck(deck: Deck): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
}

export function clearWorkbenchDeck(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function downloadDeckJson(deck: Deck): void {
  const blob = new Blob([`${JSON.stringify(deck, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${deck.id || "deck"}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
}
