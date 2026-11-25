export class ApplicationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationValidationError";
  }
}

export function errorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "No tienes permiso para esta operación o los datos no son válidos.",
  unavailable: "No hay conexión con la base de datos. Revisa tu red.",
  "not-found": "La candidatura ya no existe.",
  unauthenticated: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
  "failed-precondition": "Falta configurar la base de datos (índice o permisos).",
};

export function firestoreErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApplicationValidationError) return error.message;
  const code = errorCode(error);
  if (code && FIRESTORE_ERROR_MESSAGES[code]) return FIRESTORE_ERROR_MESSAGES[code];
  return fallback;
}
