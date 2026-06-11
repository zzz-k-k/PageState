import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { DeckSchema } from "../src/deck-schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../schemas/deck.schema.json");

const jsonSchema = z.toJSONSchema(DeckSchema, {
  io: "input"
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(jsonSchema, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
