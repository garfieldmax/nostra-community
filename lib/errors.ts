export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BUDGET_EXCEEDED"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "INTERNAL";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BudgetExceededError extends AppError {
  constructor(details?: Record<string, unknown>) {
    super("Daily kudos budget exceeded", "BUDGET_EXCEEDED", details);
    this.name = "BudgetExceededError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized", details?: Record<string, unknown>) {
    super(message, "FORBIDDEN", details);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: Record<string, unknown>) {
    super(message, "VALIDATION_FAILED", details);
    this.name = "ValidationError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      ok: false as const,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return {
    ok: false as const,
    error: {
      code: "INTERNAL" as const,
      message,
    },
  };
}

/**
 * Maps an error code to the appropriate HTTP status code.
 */
export function getStatusFromError(error: unknown): number {
  const response = toErrorResponse(error);
  const codeToStatus: Record<ErrorCode, number> = {
    UNAUTHENTICATED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_FAILED: 400,
    CONFLICT: 409,
    BUDGET_EXCEEDED: 429,
    INTERNAL: 500,
  };
  return codeToStatus[response.error.code] ?? 500;
}