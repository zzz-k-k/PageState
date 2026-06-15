export { ProjectError } from "./errors.js";

export type { ProjectErrorCode } from "./errors.js";

export {
  PROJECT_DECK_FILENAME,
  PROJECT_SUBDIRECTORIES,
  createProject,
  createStarterDeck,
  ensureProjectStructure,
  loadDeck,
  loadProject,
  parseDeckJson,
  resolveProjectPaths,
  saveDeck,
  saveProject
} from "./project.js";

export type {
  CreateProjectOptions,
  PageStateProject,
  ProjectPaths,
  ProjectSubdirectory,
  StarterDeckOptions
} from "./project.js";
