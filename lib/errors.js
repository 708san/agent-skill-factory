export const ERROR_CODES = new Set([
  'AUTH_INVALID','REPOSITORY_NOT_FOUND','REPOSITORY_PERMISSION_DENIED','REF_NOT_FOUND','REF_ALREADY_EXISTS',
  'FILE_NOT_FOUND','FILE_CONFLICT','STALE_SHA','RATE_LIMITED','UPSTREAM_TIMEOUT','UPSTREAM_5XX',
  'VALIDATION_FAILED','SECRET_DETECTED','DEPENDENCY_CONFLICT','INTERNAL_ERROR'
]);

export class FactoryError extends Error {
  constructor(code, message, { status = 500, githubStatus = null, githubRequestId = null, repo = null, ref = null, path = null, operation = null, stage = null, rateLimit = null, cause = null } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'FactoryError';
    this.code = ERROR_CODES.has(code) ? code : 'INTERNAL_ERROR';
    this.status = status;
    this.details = { githubStatus, githubRequestId, repo, ref, path, operation, stage, rateLimit };
  }
  toJSON() {
    const details = Object.fromEntries(Object.entries(this.details).filter(([, v]) => v !== null && v !== undefined));
    return { code: this.code, message: this.message, ...details };
  }
}

export function validationError(message, details = {}) { return new FactoryError('VALIDATION_FAILED', message, { status: 400, ...details }); }
export function dependencyConflict(message, details = {}) { return new FactoryError('DEPENDENCY_CONFLICT', message, { status: 409, ...details }); }
export function secretDetected(message, details = {}) { return new FactoryError('SECRET_DETECTED', message, { status: 400, ...details }); }

export function normalizeError(error) {
  if (error instanceof FactoryError) return error;
  const message = error?.message || String(error);
  if (/Unauthorized/i.test(message)) return new FactoryError('AUTH_INVALID', 'Authentication failed', { status: 401, cause: error });
  return new FactoryError('INTERNAL_ERROR', message, { status: 500, cause: error });
}
