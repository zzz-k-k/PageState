export type ProjectErrorCode =
  | "PROJECT_ALREADY_EXISTS"
  | "PROJECT_NOT_FOUND"
  | "DECK_NOT_FOUND"
  | "INVALID_JSON"
  | "INVALID_DECK";

export class ProjectError extends Error {
  readonly code: ProjectErrorCode;
  readonly details?: unknown;

  constructor(code: ProjectErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ProjectError";
    this.code = code;
    this.details = details;
  }
}
