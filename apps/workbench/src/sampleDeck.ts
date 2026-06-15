import { Deck, DeckSchemaVersion } from "@pagestate/ir";

export function createWorkbenchDemoDeck(): Deck {
  const now = new Date("2026-06-15T00:00:00.000Z").toISOString();

  return {
    schemaVersion: DeckSchemaVersion,
    type: "deck",
    id: "pagestate_workbench_demo",
    title: "PageState Workbench Demo",
    description: "A small deck used by the Workbench MVP.",
    theme: {
      id: "modern_light",
      name: "Modern Light",
      tokens: {
        colors: {
          "background.primary": "#f8fafc",
          "surface.primary": "#ffffff",
          "text.primary": "#111827",
          "text.muted": "#4b5563",
          accent: "#2563eb"
        },
        fonts: {
          heading: "Inter, ui-sans-serif, system-ui, sans-serif",
          body: "Inter, ui-sans-serif, system-ui, sans-serif"
        },
        spacing: {
          slide: 64
        },
        radii: {
          card: 8
        }
      }
    },
    slides: [
      {
        id: "slide_001",
        type: "hero",
        title: "PageState Workbench",
        layout: {
          type: "centered",
          gap: 24,
          padding: 72
        },
        blocks: [
          {
            id: "title",
            type: "heading",
            text: "PageState Workbench",
            level: 1,
            style: {
              align: "center"
            }
          },
          {
            id: "subtitle",
            type: "paragraph",
            text: "Edit structured deck data through commands, then preview the result instantly.",
            style: {
              align: "center",
              emphasis: "muted"
            }
          }
        ],
        animations: []
      },
      {
        id: "slide_002",
        type: "two-column",
        title: "Why Commands Matter",
        layout: {
          type: "two-column",
          gap: 32,
          padding: 72,
          columns: 2
        },
        blocks: [
          {
            id: "section_title",
            type: "heading",
            text: "Why Commands Matter",
            level: 2
          },
          {
            id: "human_heading",
            type: "heading",
            text: "Human editing",
            level: 3
          },
          {
            id: "ai_heading",
            type: "heading",
            text: "AI editing",
            level: 3
          },
          {
            id: "human_list",
            type: "list",
            ordered: false,
            items: ["Click buttons", "Edit fields", "Undo changes"]
          },
          {
            id: "ai_list",
            type: "list",
            ordered: false,
            items: ["Generate commands", "Validate output", "Replay changes"]
          }
        ],
        animations: []
      },
      {
        id: "slide_003",
        type: "chart",
        title: "MVP Flow",
        layout: {
          type: "grid",
          gap: 28,
          padding: 72,
          columns: 2
        },
        blocks: [
          {
            id: "flow_title",
            type: "heading",
            text: "MVP Flow",
            level: 2
          },
          {
            id: "flow_summary",
            type: "paragraph",
            text: "The Workbench keeps the deck in memory while commands update the structured data.",
            style: {
              emphasis: "muted"
            }
          },
          {
            id: "flow_steps",
            type: "list",
            ordered: false,
            items: ["Load deck.json", "Run command", "Update preview", "Save or export"]
          }
        ],
        animations: []
      }
    ],
    exportConfig: {
      aspectRatio: "16:9",
      width: 1920,
      height: 1080,
      formats: ["html", "pdf"]
    },
    metadata: {
      locale: "en-US",
      tags: ["workbench", "mvp"],
      createdAt: now,
      updatedAt: now
    }
  };
}
