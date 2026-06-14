import { Block, Deck, DeckSchema, Slide, Theme } from "@pagestate/ir";
import { escapeAttribute, escapeHtml, toKebabCase } from "./html.js";

export type RevealRenderOptions = {
  assetBase?: string;
  includeRevealInit?: boolean;
  title?: string;
};

const DEFAULT_ASSET_BASE = "./reveal";

export function renderRevealDeck(deckInput: unknown, options: RevealRenderOptions = {}): string {
  const parsed = DeckSchema.safeParse(deckInput);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Cannot render invalid Deck IR. ${issues}`);
  }

  const deck = parsed.data;
  const assetBase = options.assetBase ?? DEFAULT_ASSET_BASE;
  const title = options.title ?? deck.title;

  return [
    "<!doctype html>",
    `<html lang="${escapeAttribute(deck.metadata.locale)}">`,
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `  <title>${escapeHtml(title)}</title>`,
    `  <link rel="stylesheet" href="${escapeAttribute(assetBase)}/reset.css" />`,
    `  <link rel="stylesheet" href="${escapeAttribute(assetBase)}/reveal.css" />`,
    `  <link rel="stylesheet" href="${escapeAttribute(assetBase)}/theme/white.css" />`,
    "  <style>",
    renderDeckCss(deck),
    "  </style>",
    "</head>",
    "<body>",
    '  <div class="reveal pagestate-deck">',
    '    <div class="slides">',
    ...deck.slides.map((slide) => renderSlide(slide)),
    "    </div>",
    "  </div>",
    `  <script src="${escapeAttribute(assetBase)}/reveal.js"></script>`,
    options.includeRevealInit === false
      ? ""
      : [
          "  <script>",
          "    Reveal.initialize({",
          "      hash: true,",
          "      controls: true,",
          "      progress: true,",
          "      slideNumber: true,",
          "      center: false,",
          "      width: 1920,",
          "      height: 1080,",
          "      margin: 0.04",
          "    });",
          "  </script>"
        ].join("\n"),
    "</body>",
    "</html>"
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSlide(slide: Slide): string {
  const attributes = renderSlideAttributes(slide);
  const classNames = ["pagestate-slide", `pagestate-slide-${slide.type}`, `layout-${slide.layout.type}`];
  const style = renderSlideStyle(slide);

  return [
    `      <section${attributes} class="${classNames.map(escapeAttribute).join(" ")}" style="${escapeAttribute(style)}">`,
    ...slide.blocks.map((block) => renderBlock(block, slide)),
    renderNotes(slide),
    "      </section>"
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSlideAttributes(slide: Slide): string {
  const revealHints = slide.rendererHints?.reveal;
  const attributes: Record<string, string | number | boolean> = {
    "data-slide-id": slide.id,
    "data-slide-type": slide.type
  };

  if (revealHints?.transition !== undefined) {
    attributes["data-transition"] = revealHints.transition;
  }

  if (revealHints?.backgroundColor !== undefined) {
    attributes["data-background-color"] = revealHints.backgroundColor;
  }

  if (revealHints?.backgroundImage !== undefined) {
    attributes["data-background-image"] = revealHints.backgroundImage;
  }

  if (revealHints?.backgroundVideo !== undefined) {
    attributes["data-background-video"] = revealHints.backgroundVideo;
  }

  if (revealHints?.autoAnimate === true) {
    attributes["data-auto-animate"] = true;
  }

  for (const [key, value] of Object.entries(revealHints?.sectionAttributes ?? {})) {
    attributes[key] = value;
  }

  return Object.entries(attributes)
    .map(([key, value]) => {
      if (value === true) {
        return ` ${escapeAttribute(key)}`;
      }

      if (value === false) {
        return "";
      }

      return ` ${escapeAttribute(key)}="${escapeAttribute(value)}"`;
    })
    .join("");
}

function renderSlideStyle(slide: Slide): string {
  return [
    `--pagestate-layout-gap: ${slide.layout.gap ?? 24}px`,
    `--pagestate-layout-padding: ${slide.layout.padding ?? 72}px`,
    slide.layout.columns !== undefined ? `--pagestate-layout-columns: ${slide.layout.columns}` : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function renderBlock(block: Block, slide: Slide): string {
  const tag = getBlockTag(block);
  const attributes = renderBlockAttributes(block, slide);
  const content = renderBlockContent(block);

  return `        <${tag}${attributes}>${content}</${tag}>`;
}

function getBlockTag(block: Block): string {
  switch (block.type) {
    case "heading":
      return `h${block.level}`;
    case "paragraph":
      return "p";
    case "list":
      return block.ordered ? "ol" : "ul";
    case "image":
      return "figure";
    case "quote":
      return "blockquote";
    case "chart":
      return "figure";
    case "code":
      return "pre";
  }
}

function renderBlockAttributes(block: Block, slide: Slide): string {
  const classNames = ["pagestate-block", `block-${block.type}`];
  const animation = slide.animations.find((candidate) => candidate.targetBlockId === block.id);

  if (animation !== undefined && animation.trigger === "fragment") {
    classNames.push("fragment");
    if (animation.type !== "none") {
      classNames.push(`pagestate-anim-${animation.type}`);
    }
  }

  const style = renderBlockStyle(block);
  return [
    ` data-block-id="${escapeAttribute(block.id)}"`,
    ` class="${classNames.map(escapeAttribute).join(" ")}"`,
    style.length > 0 ? ` style="${escapeAttribute(style)}"` : ""
  ].join("");
}

function renderBlockStyle(block: Block): string {
  const styles: string[] = [];

  if (block.frame !== undefined) {
    const unit = block.frame.unit;
    styles.push("position: absolute");
    styles.push(`left: ${block.frame.x}${unit}`);
    styles.push(`top: ${block.frame.y}${unit}`);
    styles.push(`width: ${block.frame.width}${unit}`);
    styles.push(`height: ${block.frame.height}${unit}`);
  }

  if (block.style?.align !== undefined) {
    styles.push(`text-align: ${block.style.align}`);
  }

  if (block.style?.colorToken !== undefined) {
    styles.push(`color: var(--${toKebabCase(block.style.colorToken)})`);
  }

  if (block.style?.backgroundToken !== undefined) {
    styles.push(`background: var(--${toKebabCase(block.style.backgroundToken)})`);
  }

  return styles.join("; ");
}

function renderBlockContent(block: Block): string {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return escapeHtml(block.text);
    case "list":
      return block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    case "image": {
      const src = block.source.kind === "asset" ? block.source.path : block.source.url;
      const caption = block.caption === undefined ? "" : `<figcaption>${escapeHtml(block.caption)}</figcaption>`;
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(block.alt)}" />${caption}`;
    }
    case "quote":
      return [
        `<p>${escapeHtml(block.text)}</p>`,
        block.attribution === undefined ? "" : `<cite>${escapeHtml(block.attribution)}</cite>`
      ]
        .filter(Boolean)
        .join("");
    case "chart":
      return renderChart(block);
    case "code":
      return `<code class="language-${escapeAttribute(block.language)}">${escapeHtml(block.code)}</code>`;
  }
}

function renderChart(block: Extract<Block, { type: "chart" }>): string {
  const tableRows = block.data.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell === null ? "" : escapeHtml(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  return [
    block.title === undefined ? "" : `<figcaption>${escapeHtml(block.title)}</figcaption>`,
    '<table class="pagestate-chart-table">',
    `<thead><tr>${block.data.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>`,
    `<tbody>${tableRows}</tbody>`,
    "</table>"
  ]
    .filter(Boolean)
    .join("");
}

function renderNotes(slide: Slide): string {
  if (slide.notes?.speaker === undefined && slide.notes?.presenterOnly === undefined) {
    return "";
  }

  return [
    '        <aside class="notes">',
    slide.notes.speaker === undefined ? "" : escapeHtml(slide.notes.speaker),
    slide.notes.presenterOnly === undefined ? "" : `\n${escapeHtml(slide.notes.presenterOnly)}`,
    "        </aside>"
  ]
    .filter(Boolean)
    .join("\n");
}

function renderDeckCss(deck: Deck): string {
  return [
    "    :root {",
    ...renderThemeVariables(deck.theme).map((line) => `      ${line}`),
    "    }",
    "    .pagestate-deck { color: var(--color-text-primary, #0f172a); background: var(--color-background, #f8fafc); }",
    "    .pagestate-slide { position: relative; padding: var(--pagestate-layout-padding); box-sizing: border-box; }",
    "    .pagestate-slide.layout-centered { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--pagestate-layout-gap); text-align: center; }",
    "    .pagestate-slide.layout-stack { display: flex; flex-direction: column; justify-content: center; gap: var(--pagestate-layout-gap); }",
    "    .pagestate-slide.layout-two-column, .pagestate-slide.layout-grid { display: grid; grid-template-columns: repeat(var(--pagestate-layout-columns, 2), minmax(0, 1fr)); grid-auto-rows: min-content; gap: var(--pagestate-layout-gap); align-content: center; align-items: start; }",
    "    .pagestate-slide.layout-two-column > .pagestate-block:first-child, .pagestate-slide.layout-grid > .pagestate-block:first-child { grid-column: 1 / -1; }",
    "    .pagestate-slide.layout-centered > .pagestate-block, .pagestate-slide.layout-stack > .pagestate-block { max-width: min(100%, 1280px); }",
    "    .pagestate-block { box-sizing: border-box; margin: 0; min-width: 0; max-width: 100%; overflow-wrap: anywhere; }",
    "    .pagestate-block[style*='position: absolute'] { overflow: visible; }",
    "    .pagestate-block.block-heading, .pagestate-slide h1, .pagestate-slide h2, .pagestate-slide h3 { font-family: var(--font-heading, Inter, Arial, sans-serif); letter-spacing: 0; margin: 0; }",
    "    .pagestate-slide p, .pagestate-slide li, .pagestate-slide blockquote, .pagestate-slide table { font-family: var(--font-body, Inter, Arial, sans-serif); }",
    "    .pagestate-slide h1 { font-size: 2.4em; line-height: 1.05; }",
    "    .pagestate-slide h2 { font-size: 1.7em; line-height: 1.1; }",
    "    .pagestate-slide h3 { font-size: 1.25em; line-height: 1.2; }",
    "    .pagestate-slide p { color: var(--color-text-muted, #475569); }",
    "    .pagestate-slide p.pagestate-block { font-size: 0.78em; line-height: 1.35; }",
    "    .pagestate-slide ul.pagestate-block, .pagestate-slide ol.pagestate-block { margin: 0; padding-left: 1.15em; font-size: 0.7em; line-height: 1.32; }",
    "    .pagestate-slide li + li { margin-top: 0.28em; }",
    "    .pagestate-slide figure.pagestate-block, .pagestate-slide blockquote.pagestate-block, .pagestate-slide pre.pagestate-block { margin: 0; }",
    "    .pagestate-slide blockquote.pagestate-block { padding: 0; width: min(84%, 1400px); }",
    "    .pagestate-slide blockquote.pagestate-block p { margin: 0 0 0.4em; font-size: 1.45em; line-height: 1.16; color: var(--color-text-primary, #0f172a); }",
    "    .pagestate-slide blockquote.pagestate-block cite { display: block; font-size: 0.62em; color: var(--color-text-muted, #475569); }",
    "    .pagestate-slide pre.pagestate-block { padding: 0.85em; font-size: 0.52em; line-height: 1.35; white-space: pre-wrap; background: rgba(15, 23, 42, 0.06); border-radius: var(--radius-card, 8px); }",
    "    .pagestate-slide img { max-width: 100%; max-height: 100%; object-fit: contain; }",
    "    .pagestate-chart-table { width: 100%; border-collapse: collapse; font-size: 0.55em; }",
    "    .pagestate-chart-table th, .pagestate-chart-table td { border-bottom: 1px solid rgba(15, 23, 42, 0.16); padding: 0.45em 0.6em; text-align: left; }",
    "    .pagestate-chart-table th { color: var(--color-text-primary, #0f172a); font-weight: 700; }",
    "    .pagestate-anim-fade-up { transform: translateY(12px); }"
  ].join("\n");
}

function renderThemeVariables(theme: Theme): string[] {
  const variables: string[] = [];

  for (const [key, value] of Object.entries(theme.tokens.colors)) {
    variables.push(`--${toKebabCase(key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(theme.tokens.fonts)) {
    variables.push(`--${toKebabCase(key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(theme.tokens.spacing)) {
    variables.push(`--${toKebabCase(key)}: ${value}px;`);
  }

  for (const [key, value] of Object.entries(theme.tokens.radii)) {
    variables.push(`--${toKebabCase(key)}: ${value}px;`);
  }

  return variables;
}
