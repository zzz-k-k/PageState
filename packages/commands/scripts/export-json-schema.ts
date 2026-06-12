import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { CommandSchema } from "../src/command-schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../schemas/command.schema.json");

const jsonSchema = z.toJSONSchema(CommandSchema, {
  io: "input"
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(jsonSchema, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
