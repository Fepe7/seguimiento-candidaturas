export const MIN_PASSWORD_LENGTH = 6;

const INVALID_CREDENTIALS = "El email o la contraseña no son correctos.";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": INVALID_CREDENTIALS,
  "auth/invalid-login-credentials": INVALID_CREDENTIALS,
  "auth/wrong-password": INVALID_CREDENTIALS,
  "auth/user-not-found": INVALID_CREDENTIALS,
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/weak-password": `La contraseña es demasiado débil. Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  "auth/invalid-email": "El email no es válido.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos y vuelve a probar.",
  "auth/operation-not-allowed": "El inicio de sesión con email no está activado en Firebase.",
  "auth/network-request-failed": "No hay conexión. Revisa tu red y vuelve a probar.",
};

export const GENERIC_AUTH_ERROR = "No se ha podido completar la operación. Inténtalo de nuevo.";

export function authErrorMessage(code: string | undefined | null): string {
  if (!code) return GENERIC_AUTH_ERROR;
  return AUTH_ERROR_MESSAGES[code] ?? GENERIC_AUTH_ERROR;
}

export type CredentialErrors = Partial<Record<"email" | "password", string>>;

export function validateCredentials(email: string, password: string): CredentialErrors {
  const errors: CredentialErrors = {};
  const trimmed = email.trim();
  if (trimmed.length === 0) errors.email = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) errors.email = "El email no es válido.";
  if (password.length === 0) errors.password = "La contraseña es obligatoria.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  return errors;
}
