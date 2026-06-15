import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileUp,
  LayoutPanelLeft,
  Plus,
  Redo2,
  RefreshCw,
  Sparkles,
  Trash2,
  Undo2
} from "lucide-react";
import { ChangeEvent, ReactNode, useMemo, useRef } from "react";
import { Block, DeckSchema, Frame, Layout, Theme } from "@pagestate/ir";
import { Command } from "@pagestate/commands";
import { getBlockLabel, getEditableText, getSelectedBlock, getSelectedSlide, getSlideTitle } from "./deckUtils.js";
import { SlideCanvas } from "./SlideCanvas.js";
import { downloadDeckJson } from "./storage.js";
import { useWorkbenchStore } from "./store.js";
import { THEME_PRESETS } from "./themePresets.js";

const LAYOUT_TYPES: Layout["type"][] = ["centered", "stack", "two-column", "grid", "timeline", "chart", "freeform"];

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    deck,
    selectedSlideId,
    selectedBlockId,
    past,
    future,
    status,
    selectSlide,
    selectBlock,
    executeDeckCommand,
    createSlide,
    deleteSelectedSlide,
    moveSelectedSlide,
    undo,
    redo,
    resetDemo,
    importDeck,
    validateDeck,
    setStatus
  } = useWorkbenchStore();
  const selectedSlide = getSelectedSlide(deck, selectedSlideId);
  const selectedBlock = getSelectedBlock(selectedSlide, selectedBlockId);
  const selectedSlideIndex = deck.slides.findIndex((slide) => slide.id === selectedSlide.id);
  const validation = useMemo(() => DeckSchema.safeParse(deck), [deck]);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    const text = await file.text();

    try {
      importDeck(JSON.parse(text));
    } catch {
      importDeck(null);
    } finally {
      event.target.value = "";
    }
  }

  function run(command: Command, message: string, blockId = selectedBlockId) {
    executeDeckCommand(command, {
      selectedSlideId: selectedSlide.id,
      selectedBlockId: blockId,
      status: message
    });
  }

  return (
    <div className="workbench-shell">
      <header className="topbar">
        <div className="brand">
          <LayoutPanelLeft size={20} aria-hidden="true" />
          <div>
            <strong>PageState</strong>
            <span>{deck.title}</span>
          </div>
        </div>

        <div className="toolbar-group">
          <IconButton label="New slide" onClick={createSlide}>
            <Plus size={17} />
          </IconButton>
          <IconButton label="Undo" onClick={undo} disabled={past.length === 0}>
            <Undo2 size={17} />
          </IconButton>
          <IconButton label="Redo" onClick={redo} disabled={future.length === 0}>
            <Redo2 size={17} />
          </IconButton>
        </div>

        <div className="toolbar-group">
          <IconButton label="Validate deck" onClick={validateDeck}>
            <CheckCircle2 size={17} />
          </IconButton>
          <IconButton label="Import deck.json" onClick={() => fileInputRef.current?.click()}>
            <FileUp size={17} />
          </IconButton>
          <IconButton label="Download deck.json" onClick={() => downloadDeckJson(deck)}>
            <Download size={17} />
          </IconButton>
          <IconButton label="Reset demo" onClick={resetDemo}>
            <RefreshCw size={17} />
          </IconButton>
          <IconButton label="AI edit" onClick={() => setStatus("AI edit entry is reserved for Step 7.")}>
            <Sparkles size={17} />
          </IconButton>
        </div>

        <div className={`status-pill ${validation.success ? "is-ok" : "is-error"}`}>{status}</div>
        <input ref={fileInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={handleImport} />
      </header>

      <main className="workbench-grid">
        <aside className="slides-panel">
          <div className="panel-heading">
            <span>Slides</span>
            <span>{deck.slides.length}</span>
          </div>

          <div className="slide-list">
            {deck.slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`slide-card ${slide.id === selectedSlide.id ? "is-active" : ""}`}
                onClick={() => selectSlide(slide.id)}
              >
                <span className="slide-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="slide-name">{getSlideTitle(slide)}</span>
                <span className="slide-meta">{slide.layout.type}</span>
              </button>
            ))}
          </div>

          <div className="panel-actions">
            <IconButton label="Move slide up" onClick={() => moveSelectedSlide(-1)} disabled={selectedSlideIndex <= 0}>
              <ArrowUp size={17} />
            </IconButton>
            <IconButton
              label="Move slide down"
              onClick={() => moveSelectedSlide(1)}
              disabled={selectedSlideIndex === -1 || selectedSlideIndex >= deck.slides.length - 1}
            >
              <ArrowDown size={17} />
            </IconButton>
            <IconButton label="Delete slide" onClick={deleteSelectedSlide} disabled={deck.slides.length <= 1}>
              <Trash2 size={17} />
            </IconButton>
          </div>
        </aside>

        <section className="preview-panel" onClick={() => selectBlock(null)}>
          <div className="preview-heading">
            <div>
              <span>Preview</span>
              <strong>{getSlideTitle(selectedSlide)}</strong>
            </div>
            <span>{selectedSlide.type}</span>
          </div>
          <SlideCanvas
            deck={deck}
            slide={selectedSlide}
            selectedBlockId={selectedBlockId}
            onSelectBlock={selectBlock}
            onMoveBlock={(blockId: string, frame: Frame) =>
              run(
                {
                  type: "updateBlockFrame",
                  slideId: selectedSlide.id,
                  blockId,
                  frame
                },
                "Moved block",
                blockId
              )
            }
          />
        </section>

        <aside className="inspector-panel">
          <SlideInspector
            slide={selectedSlide}
            onCommand={(command, message) => run(command, message)}
            onTheme={(theme) =>
              executeDeckCommand(
                {
                  type: "applyTheme",
                  theme
                },
                {
                  status: `Applied ${theme.name}`
                }
              )
            }
          />
          <BlockInspector slideId={selectedSlide.id} block={selectedBlock} onCommand={(command, message, blockId) => run(command, message, blockId)} />
        </aside>
      </main>
    </div>
  );
}

function SlideInspector({
  slide,
  onCommand,
  onTheme
}: {
  slide: ReturnType<typeof getSelectedSlide>;
  onCommand: (command: Command, message: string) => void;
  onTheme: (theme: Theme) => void;
}) {
  function updateLayout(partial: Partial<Layout>) {
    onCommand(
      {
        type: "setSlideLayout",
        slideId: slide.id,
        layout: {
          ...slide.layout,
          ...partial
        }
      },
      "Updated slide layout"
    );
  }

  return (
    <section className="inspector-section">
      <h2>Slide</h2>
      <label>
        Title
        <input
          value={slide.title ?? ""}
          onChange={(event) =>
            onCommand(
              {
                type: "updateSlideTitle",
                slideId: slide.id,
                title: event.target.value.trim().length === 0 ? null : event.target.value
              },
              "Updated slide title"
            )
          }
        />
      </label>

      <label>
        Layout
        <select value={slide.layout.type} onChange={(event) => updateLayout({ type: event.target.value as Layout["type"] })}>
          {LAYOUT_TYPES.map((layoutType) => (
            <option key={layoutType} value={layoutType}>
              {layoutType}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label>
          Gap
          <input
            type="number"
            min={0}
            value={slide.layout.gap ?? 24}
            onChange={(event) => updateLayout({ gap: Number(event.target.value) })}
          />
        </label>
        <label>
          Padding
          <input
            type="number"
            min={0}
            value={slide.layout.padding ?? 72}
            onChange={(event) => updateLayout({ padding: Number(event.target.value) })}
          />
        </label>
      </div>

      <label>
        Columns
        <input
          type="number"
          min={1}
          value={slide.layout.columns ?? 2}
          onChange={(event) => updateLayout({ columns: Math.max(1, Number(event.target.value)) })}
        />
      </label>

      <div className="theme-row">
        {THEME_PRESETS.map((theme) => (
          <button key={theme.id} className="theme-swatch" style={{ background: theme.tokens.colors["background.primary"], color: theme.tokens.colors["text.primary"] }} onClick={() => onTheme(theme)}>
            <span style={{ background: theme.tokens.colors.accent }} />
            {theme.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function BlockInspector({
  slideId,
  block,
  onCommand
}: {
  slideId: string;
  block: Block | undefined;
  onCommand: (command: Command, message: string, blockId?: string | null) => void;
}) {
  if (block === undefined) {
    return (
      <section className="inspector-section">
        <h2>Block</h2>
        <p className="empty-state">Select a block on the preview.</p>
      </section>
    );
  }

  const editableText = getEditableText(block);

  return (
    <section className="inspector-section">
      <h2>Block</h2>
      <div className="selected-block-name">{getBlockLabel(block)}</div>

      {editableText !== undefined ? (
        <label>
          Text
          <textarea
            value={editableText}
            onChange={(event) => {
              if (event.target.value.trim().length === 0) {
                return;
              }

              onCommand(
                {
                  type: "updateBlockText",
                  slideId,
                  blockId: block.id,
                  text: event.target.value
                },
                "Updated block text",
                block.id
              );
            }}
          />
        </label>
      ) : null}

      {block.type === "list" ? (
        <label>
          Items
          <textarea
            value={block.items.join("\n")}
            onChange={(event) => {
              const items = event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

              if (items.length === 0) {
                return;
              }

              onCommand(
                {
                  type: "updateBlockProps",
                  slideId,
                  blockId: block.id,
                  props: {
                    items
                  }
                },
                "Updated list items",
                block.id
              );
            }}
          />
        </label>
      ) : null}

      {block.type === "image" ? (
        <label>
          Image URL
          <input
            defaultValue={block.source.kind === "url" ? block.source.url : block.source.path}
            onBlur={(event) => {
              if (event.target.value.trim().length === 0) {
                return;
              }

              onCommand(
                {
                  type: "updateBlockProps",
                  slideId,
                  blockId: block.id,
                  props: {
                    source: {
                      kind: "url",
                      url: event.target.value
                    }
                  }
                },
                "Updated image source",
                block.id
              );
            }}
          />
        </label>
      ) : null}

      <label>
        Align
        <select
          value={block.style?.align ?? "left"}
          onChange={(event) =>
            onCommand(
              {
                type: "updateBlockStyle",
                slideId,
                blockId: block.id,
                style: {
                  ...(block.style ?? {}),
                  align: event.target.value as "left" | "center" | "right"
                }
              },
              "Updated block style",
              block.id
            )
          }
        >
          <option value="left">left</option>
          <option value="center">center</option>
          <option value="right">right</option>
        </select>
      </label>
    </section>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled = false
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="icon-button" type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
