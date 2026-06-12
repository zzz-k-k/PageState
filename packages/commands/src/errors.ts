export type CommandErrorCode =
  | "INVALID_DECK"
  | "INVALID_COMMAND"
  | "NOT_FOUND"
  | "DUPLICATE_ID"
  | "INVALID_INDEX"
  | "INVALID_OPERATION"
  | "SCHEMA_VIOLATION";

export type CommandExecutionError = {
  code: CommandErrorCode;
  message: string;
  path?: string;
  details?: unknown;
};

export type CommandExecutionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: CommandExecutionError;
    };

export function commandError(
  code: CommandErrorCode,
  message: string,
  options: { path?: string; details?: unknown } = {}
): CommandExecutionResult<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...options
    }
  };
}
