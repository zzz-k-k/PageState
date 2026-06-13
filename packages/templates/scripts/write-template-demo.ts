import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createTemplateDemoDeck } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../examples/template-demo-deck.json");
const deck = createTemplateDemoDeck();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(deck, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
