import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderRevealDeck } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const deckPath = resolve(__dirname, "../../ir/examples/valid-deck.json");
const outputDir = resolve(__dirname, "../../../exports/valid-deck");
const revealPackagePath = require.resolve("reveal.js/package.json");
const revealDistPath = resolve(dirname(revealPackagePath), "dist");

const deck = JSON.parse(await readFile(deckPath, "utf8"));
const html = renderRevealDeck(deck, {
  assetBase: "./reveal"
});

await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "index.html"), html, "utf8");
await cp(revealDistPath, resolve(outputDir, "reveal"), {
  recursive: true,
  force: true
});

console.log(`Wrote ${resolve(outputDir, "index.html")}`);
