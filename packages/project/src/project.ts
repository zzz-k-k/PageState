import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { Deck, DeckSchema, DeckSchemaVersion } from "@pagestate/ir";
import { ProjectError } from "./errors.js";

export const PROJECT_DECK_FILENAME = "deck.json";
export const PROJECT_SUBDIRECTORIES = ["assets", "themes", "skills", "exports"] as const;

export type ProjectSubdirectory = (typeof PROJECT_SUBDIRECTORIES)[number];

export interface ProjectPaths {//interface表示接口
  rootDir: string;
  deckFile: string;
  assetsDir: string;
  themesDir: string;
  skillsDir: string;
  exportsDir: string;
}

export interface PageStateProject {
  rootDir: string;
  paths: ProjectPaths;
  deck: Deck;
}

export interface CreateProjectOptions {
  rootDir: string;
  title?: string;
  description?: string;
  deck?: Deck;
  overwriteDeck?: boolean;
  now?: Date;
}

export interface StarterDeckOptions {
  id?: string;
  title?: string;
  description?: string;
  now?: Date;
}

export function resolveProjectPaths(rootDir: string): ProjectPaths {
  const absoluteRoot = resolve(rootDir);

  return {
    rootDir: absoluteRoot,
    deckFile: resolve(absoluteRoot, PROJECT_DECK_FILENAME),
    assetsDir: resolve(absoluteRoot, "assets"),
    themesDir: resolve(absoluteRoot, "themes"),
    skillsDir: resolve(absoluteRoot, "skills"),
    exportsDir: resolve(absoluteRoot, "exports")
  };
}
//async表示异步，函数里面可以使用await
//promise表示承诺会给一个PageStateProject，就是等await之后创建一个PageStateProject
//c#中是Task<PageStateProject> CreateProject(CreateProjectOptions options)，ts相当于把要返回的东西写在冒号后面
export async function createProject(options: CreateProjectOptions): Promise<PageStateProject> {
  const paths = resolveProjectPaths(options.rootDir);

  await ensureProjectStructure(paths.rootDir);

  if (!options.overwriteDeck && (await pathExists(paths.deckFile))) {
    throw new ProjectError("PROJECT_ALREADY_EXISTS", `Project already has a ${PROJECT_DECK_FILENAME}.`, {
      deckFile: paths.deckFile
    });
  }

  const deck = options.deck ?? createStarterDeck({//options.deck有值使用他自己，没有值就使用createStarterDeck
    id: createProjectId(paths.rootDir),
    title: options.title ?? basename(paths.rootDir),
    description: options.description,
    now: options.now
  });

  await saveDeck(paths.deckFile, deck);

  return {
    rootDir: paths.rootDir,
    paths,
    deck
  };
}

export async function loadProject(rootDir: string): Promise<PageStateProject> {
  const paths = resolveProjectPaths(rootDir);

  if (!(await pathExists(paths.rootDir))) {
    throw new ProjectError("PROJECT_NOT_FOUND", `Project directory was not found: ${paths.rootDir}`);
  }

  const deck = await loadDeck(paths.deckFile);

  return {
    rootDir: paths.rootDir,
    paths,
    deck
  };
}

export async function saveProject(project: PageStateProject): Promise<PageStateProject> {
  const paths = resolveProjectPaths(project.rootDir);

  await ensureProjectStructure(paths.rootDir);
  const deck = await saveDeck(paths.deckFile, project.deck);

  return {
    rootDir: paths.rootDir,
    paths,
    deck
  };
}

export async function ensureProjectStructure(rootDir: string): Promise<ProjectPaths> {
  const paths = resolveProjectPaths(rootDir);

  await mkdir(paths.rootDir, { recursive: true });
  await Promise.all(PROJECT_SUBDIRECTORIES.map((directory) => mkdir(resolve(paths.rootDir, directory), { recursive: true })));

  return paths;
}

export async function loadDeck(deckFile: string): Promise<Deck> {
  if (!(await pathExists(deckFile))) {
    throw new ProjectError("DECK_NOT_FOUND", `Deck file was not found: ${deckFile}`, { deckFile });
  }

  const content = await readFile(deckFile, "utf8");
  return parseDeckJson(content, deckFile);
}

export async function saveDeck(deckFile: string, deckInput: unknown): Promise<Deck> {
  const result = DeckSchema.safeParse(deckInput);

  if (!result.success) {
    throw new ProjectError("INVALID_DECK", "Cannot save a deck that does not match DeckSchema.", {
      issues: result.error.issues
    });
  }

  await mkdir(dirname(resolve(deckFile)), { recursive: true });
  await writeFile(deckFile, `${JSON.stringify(result.data, null, 2)}\n`, "utf8");

  return result.data;
}

export function parseDeckJson(content: string, source = PROJECT_DECK_FILENAME): Deck {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new ProjectError("INVALID_JSON", `Could not parse ${source} as JSON.`, { cause: error });
  }

  const result = DeckSchema.safeParse(parsed);

  if (!result.success) {
    throw new ProjectError("INVALID_DECK", `${source} does not match DeckSchema.`, {
      issues: result.error.issues
    });
  }

  return result.data;
}

export function createStarterDeck(options: StarterDeckOptions = {}): Deck {
  const now = (options.now ?? new Date()).toISOString();
  const title = options.title?.trim() || "Untitled PageState Deck";
  const id = options.id ?? createProjectId(title);

  return {
    schemaVersion: DeckSchemaVersion,
    type: "deck",
    id,
    title,
    description: options.description,
    theme: {
      id: "default_theme",
      name: "Default Theme",
      tokens: {
        colors: {
          "background.primary": "#f8fafc",
          "text.primary": "#111827",
          "text.muted": "#4b5563",
          accent: "#2563eb"
        },
        fonts: {
          heading: "Inter, system-ui, sans-serif",
          body: "Inter, system-ui, sans-serif"
        },
        spacing: {
          slide: 48
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
        title,
        layout: {
          type: "centered",
          gap: 24,
          padding: 64
        },
        blocks: [
          {
            id: "title",
            type: "heading",
            text: title,
            level: 1,
            style: {
              align: "center"
            }
          },
          {
            id: "subtitle",
            type: "paragraph",
            text: "Start building a web-native presentation.",
            style: {
              align: "center",
              emphasis: "muted"
            }
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
      locale: "zh-CN",
      tags: [],
      createdAt: now,
      updatedAt: now
    }
  };
}

function createProjectId(value: string): string {
  const base = value
    .trim()
    .replace(/^[A-Za-z]:[\\/]/, "")
    .split(/[\\/]/)
    .filter(Boolean)
    .at(-1);
  const slug = (base || "deck")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const withPrefix = /^[a-zA-Z]/.test(slug) ? slug : `deck_${slug}`;

  return withPrefix || "deck";
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(isAbsolute(path) ? path : resolve(path));
    return true;
  } catch {
    return false;
  }
}
