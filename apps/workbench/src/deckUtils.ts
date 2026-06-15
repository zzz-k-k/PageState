import { Block, Deck, Slide } from "@pagestate/ir";

export function getSlideTitle(slide: Slide): string {
  if (slide.title !== undefined) {
    return slide.title;
  }

  const firstHeading = slide.blocks.find((block): block is Extract<Block, { type: "heading" }> => block.type === "heading");
  return firstHeading?.text ?? slide.id;
}

export function getEditableText(block: Block): string | undefined {
  if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
    return block.text;
  }

  return undefined;
}

export function getBlockLabel(block: Block): string {
  switch (block.type) {
    case "heading":
      return `Heading: ${block.text}`;
    case "paragraph":
      return `Paragraph: ${block.text}`;
    case "list":
      return `List: ${block.items.length} items`;
    case "image":
      return `Image: ${block.alt}`;
    case "quote":
      return `Quote: ${block.text}`;
    case "chart":
      return `Chart: ${block.title ?? block.chartType}`;
    case "code":
      return `Code: ${block.language}`;
  }
}

export function createBlankSlide(deck: Deck): Slide {
  const id = nextSlideId(deck);

  return {
    id,
    type: "custom",
    title: "New Slide",
    layout: {
      type: "centered",
      gap: 24,
      padding: 72
    },
    blocks: [
      {
        id: `${id}_title`,
        type: "heading",
        text: "New Slide",
        level: 2,
        style: {
          align: "center"
        }
      },
      {
        id: `${id}_body`,
        type: "paragraph",
        text: "Add a clear message for this page.",
        style: {
          align: "center",
          emphasis: "muted"
        }
      }
    ],
    animations: []
  };
}

export function getSelectedSlide(deck: Deck, selectedSlideId: string): Slide {
  return deck.slides.find((slide) => slide.id === selectedSlideId) ?? deck.slides[0]!;
}

export function getSelectedBlock(slide: Slide, selectedBlockId: string | null): Block | undefined {
  return selectedBlockId === null ? undefined : slide.blocks.find((block) => block.id === selectedBlockId);
}

function nextSlideId(deck: Deck): string {
  const existingIds = new Set(deck.slides.map((slide) => slide.id));

  for (let index = deck.slides.length + 1; index < deck.slides.length + 1000; index += 1) {
    const id = `slide_${String(index).padStart(3, "0")}`;

    if (!existingIds.has(id)) {
      return id;
    }
  }

  return `slide_${Date.now()}`;
}
