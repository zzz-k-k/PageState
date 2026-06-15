import { CSSProperties, PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { Block, Deck, Frame, Slide, Theme } from "@pagestate/ir";

interface SlideCanvasProps {
  deck: Deck;
  slide: Slide;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, frame: Frame) => void;
}

interface DragSession {
  blockId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startFrame: Frame;
  currentFrame: Frame;
  canvasRect: DOMRect;
  hasMoved: boolean;
}

export function SlideCanvas({ deck, slide, selectedBlockId, onSelectBlock, onMoveBlock }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const [dragFrame, setDragFrame] = useState<{ blockId: string; frame: Frame } | null>(null);

  function startDrag(block: Block, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || canvasRef.current === null) {
      return;
    }

    event.stopPropagation();
    onSelectBlock(block.id);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const blockRect = event.currentTarget.getBoundingClientRect();
    const startFrame = rectToPercentFrame(blockRect, canvasRect);

    dragSessionRef.current = {
      blockId: block.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startFrame,
      currentFrame: startFrame,
      canvasRect,
      hasMoved: false
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(block: Block, event: ReactPointerEvent<HTMLDivElement>) {
    const session = dragSessionRef.current;

    if (session === null || session.blockId !== block.id || session.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - session.startClientX;
    const deltaY = event.clientY - session.startClientY;

    if (!session.hasMoved && Math.abs(deltaX) + Math.abs(deltaY) < 3) {
      return;
    }

    const frame = movePercentFrame(session.startFrame, deltaX, deltaY, session.canvasRect);
    session.currentFrame = frame;
    session.hasMoved = true;
    setDragFrame({ blockId: block.id, frame });
  }

  function endDrag(block: Block, event: ReactPointerEvent<HTMLDivElement>) {
    const session = dragSessionRef.current;

    if (session === null || session.blockId !== block.id || session.pointerId !== event.pointerId) {
      return;
    }

    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragSessionRef.current = null;
    setDragFrame(null);

    if (session.hasMoved) {
      onMoveBlock(block.id, session.currentFrame);
    }
  }

  return (
    <div className="canvas-stage">
      <div className="slide-frame">
        <div ref={canvasRef} className={`slide-canvas layout-${slide.layout.type}`} style={getSlideStyle(deck.theme, slide)}>
          {slide.blocks.map((block) => (
            <BlockView
              key={block.id}
              block={block}
              theme={deck.theme}
              isSelected={block.id === selectedBlockId}
              draftFrame={dragFrame?.blockId === block.id ? dragFrame.frame : undefined}
              onSelect={() => onSelectBlock(block.id)}
              onPointerDown={(event) => startDrag(block, event)}
              onPointerMove={(event) => moveDrag(block, event)}
              onPointerUp={(event) => endDrag(block, event)}
              onPointerCancel={(event) => endDrag(block, event)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockView({
  block,
  theme,
  isSelected,
  draftFrame,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
}: {
  block: Block;
  theme: Theme;
  isSelected: boolean;
  draftFrame?: Frame;
  onSelect: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const className = `preview-block block-${block.type}${isSelected ? " is-selected" : ""}${
    draftFrame !== undefined ? " is-dragging" : ""
  }`;

  return (
    <div
      className={className}
      style={getBlockStyle(block, theme, draftFrame)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {renderBlockContent(block)}
    </div>
  );
}

function renderBlockContent(block: Block) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h1" | "h2" | "h3";
      return <Tag>{block.text}</Tag>;
    }
    case "paragraph":
      return <p>{block.text}</p>;
    case "list":
      return block.ordered ? (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "image": {
      const src = block.source.kind === "asset" ? block.source.path : block.source.url;
      return (
        <figure>
          <img src={src} alt={block.alt} />
          {block.caption !== undefined ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    }
    case "quote":
      return (
        <blockquote>
          <p>{block.text}</p>
          {block.attribution !== undefined ? <cite>{block.attribution}</cite> : null}
        </blockquote>
      );
    case "chart":
      return (
        <figure>
          {block.title !== undefined ? <figcaption>{block.title}</figcaption> : null}
          <table>
            <thead>
              <tr>
                {block.data.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    case "code":
      return (
        <pre>
          <code>{block.code}</code>
        </pre>
      );
  }
}

function getSlideStyle(theme: Theme, slide: Slide): CSSProperties {
  const colors = theme.tokens.colors;

  return {
    "--slide-background": colors["background.primary"] ?? "#f8fafc",
    "--slide-surface": colors["surface.primary"] ?? "#ffffff",
    "--slide-text": colors["text.primary"] ?? "#111827",
    "--slide-muted": colors["text.muted"] ?? "#4b5563",
    "--slide-accent": colors.accent ?? "#2563eb",
    "--layout-gap": `${slide.layout.gap ?? 24}px`,
    "--layout-padding": `${slide.layout.padding ?? 72}px`,
    "--layout-columns": slide.layout.columns ?? (slide.layout.type === "two-column" ? 2 : 3),
    fontFamily: theme.tokens.fonts.body ?? "Inter, system-ui, sans-serif"
  } as CSSProperties;
}

function getBlockStyle(block: Block, theme: Theme, draftFrame?: Frame): CSSProperties {
  const style: CSSProperties = {};
  const frame = draftFrame ?? block.frame;

  if (frame !== undefined) {
    const unit = frame.unit;
    style.position = "absolute";
    style.left = `${frame.x}${unit}`;
    style.top = `${frame.y}${unit}`;
    style.width = `${frame.width}${unit}`;
    style.height = `${frame.height}${unit}`;
    style.zIndex = 2;
  }

  if (block.style?.align !== undefined) {
    style.textAlign = block.style.align;
  }

  if (block.style?.colorToken !== undefined) {
    style.color = theme.tokens.colors[block.style.colorToken] ?? undefined;
  }

  if (block.style?.backgroundToken !== undefined) {
    style.background = theme.tokens.colors[block.style.backgroundToken] ?? undefined;
  }

  return style;
}

function rectToPercentFrame(blockRect: DOMRect, canvasRect: DOMRect): Frame {
  return {
    x: roundPercent(((blockRect.left - canvasRect.left) / canvasRect.width) * 100),
    y: roundPercent(((blockRect.top - canvasRect.top) / canvasRect.height) * 100),
    width: roundPercent((blockRect.width / canvasRect.width) * 100),
    height: roundPercent((blockRect.height / canvasRect.height) * 100),
    unit: "%"
  };
}

function movePercentFrame(startFrame: Frame, deltaX: number, deltaY: number, canvasRect: DOMRect): Frame {
  const deltaPercentX = (deltaX / canvasRect.width) * 100;
  const deltaPercentY = (deltaY / canvasRect.height) * 100;
  const width = startFrame.width;
  const height = startFrame.height;

  return {
    ...startFrame,
    x: roundPercent(clamp(startFrame.x + deltaPercentX, 0, Math.max(0, 100 - width))),
    y: roundPercent(clamp(startFrame.y + deltaPercentY, 0, Math.max(0, 100 - height)))
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
