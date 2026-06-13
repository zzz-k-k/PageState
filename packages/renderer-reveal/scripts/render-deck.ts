import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderRevealDeck } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const require = createRequire(import.meta.url);
const [deckPathArg, outputDirArg] = process.argv.slice(2);

if (deckPathArg === undefined || outputDirArg === undefined) {
  throw new Error("Usage: npm run render:deck -- <deck-json-path> <output-dir>");
}

const deckPath = resolve(repoRoot, deckPathArg);
const outputDir = resolve(repoRoot, outputDirArg);
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
