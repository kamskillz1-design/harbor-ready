// Stable, machine-readable error codes shared by all layers.
// The presentation layer translates codes; layers below never carry prose.
export const ErrorCodes = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  SAFETY_INTERRUPTION: "SAFETY_INTERRUPTION",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE",
  EXPORT_UNAVAILABLE: "EXPORT_UNAVAILABLE",
  DELETION_UNAVAILABLE: "DELETION_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR"
};

export class AppError extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = "AppError";
    this.code = Object.values(ErrorCodes).includes(code) ? code : ErrorCodes.INTERNAL_ERROR;
  }
}