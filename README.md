# PageState

AI-native presentations, built as structured web projects instead of closed slide files.

[中文 README](README.zh-CN.md)

Live demo: [https://zzz-k-k.github.io/PageState/](https://zzz-k-k.github.io/PageState/)

PageState is an experimental local-first workbench for creating, editing, rendering, and eventually exporting web-native presentations. Its core idea is simple: the source of truth should be structured `deck.json` data, not hand-written HTML or a binary PowerPoint file.

## Why This Exists

Traditional presentation files are difficult for AI to inspect, edit, and repair reliably. Web documents, on the other hand, are naturally structured: they have components, styles, assets, state, and data.

PageState explores a different model:

```txt
Deck IR
  -> command-based editing
  -> renderer adapters
  -> HTML / PDF / future formats
```

The MVP currently focuses on turning structured Deck IR into a playable reveal.js presentation.

## Current Status

This project is in early MVP development.

Implemented so far:

- Deck IR schema with Zod validation
- Example valid and invalid deck data
- JSON Schema export for AI/tooling integration
- Command Layer for safe deck mutations
- Controlled JSON Patch fallback for AI edits
- reveal.js renderer
- Example HTML presentation export
- Unit tests for IR, commands, and rendering

Not implemented yet:

- Visual editor UI
- Local project manager
- AI generation pipeline
- Undo/redo history stack
- PDF export
- Screenshot QA
- PPTX export

## Architecture

```txt
packages/
  ir/                 # Deck IR schema, examples, JSON Schema export
  commands/           # Command schemas and command executor
  renderer-reveal/    # Deck IR -> reveal.js HTML renderer

exports/
  valid-deck/         # Generated demo presentation
```

The main data flow today is:

```txt
packages/ir/examples/valid-deck.json
  -> DeckSchema validation
  -> renderRevealDeck(deck)
  -> exports/valid-deck/index.html
```

## Packages

### `@pagestate/ir`

Defines the structured presentation model.

Key files:

- `packages/ir/src/deck-schema.ts`
- `packages/ir/examples/valid-deck.json`
- `packages/ir/schemas/deck.schema.json`

### `@pagestate/commands`

Defines safe operations for editing Deck IR.

Examples:

- `createSlide`
- `deleteSlide`
- `updateBlockText`
- `updateBlockFrame`
- `convertSlideLayout`
- `patchDeck`

Key files:

- `packages/commands/src/command-schema.ts`
- `packages/commands/src/executor.ts`
- `packages/commands/schemas/command.schema.json`

### `@pagestate/renderer-reveal`

Converts Deck IR into a playable reveal.js HTML presentation.

Key files:

- `packages/renderer-reveal/src/render.ts`
- `packages/renderer-reveal/scripts/render-valid-deck.ts`
- `exports/valid-deck/index.html`

## Getting Started

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build all packages:

```bash
npm run build
```

Generate JSON Schemas:

```bash
npm run build:schema
```

Render the example presentation:

```bash
npm run render:example
```

Then open:

```txt
exports/valid-deck/index.html
```

## Core Principle

PageState treats presentations as structured, editable, renderable projects:

```txt
AI and users edit Deck IR.
Renderers produce HTML and future export formats.
Generated HTML is output, not the source of truth.
```

## License

No license has been selected yet.
