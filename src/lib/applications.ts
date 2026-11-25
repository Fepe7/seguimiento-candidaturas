import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export const APPLICATION_STATUSES = [
  "pendiente",
  "enviada",
  "entrevista",
  "oferta",
  "rechazada",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pendiente: "Pendiente de enviar",
  enviada: "Enviada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

export type ApplicationInput = {
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  link: string;
  notes: string;
  followUp: string | null;
};

export type Application = ApplicationInput & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export type ApplicationField = keyof ApplicationInput;

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<ApplicationField, string>>;
};

export const LIMITS = {
  company: 100,
  role: 120,
  location: 100,
  link: 500,
  notes: 2000,
} as const;

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function normalizeApplication(input: ApplicationInput): ApplicationInput {
  const followUp = input.followUp === null ? null : input.followUp.trim();
  return {
    company: input.company.trim(),
    role: input.role.trim(),
    location: input.location.trim(),
    status: input.status,
    link: input.link.trim(),
    notes: input.notes.trim(),
    followUp: followUp === "" ? null : followUp,
  };
}

export function validateApplication(input: ApplicationInput): ValidationResult {
  const data = normalizeApplication(input);
  const errors: Partial<Record<ApplicationField, string>> = {};

  if (data.company.length === 0) errors.company = "La empresa es obligatoria.";
  else if (data.company.length > LIMITS.company)
    errors.company = `La empresa no puede superar los ${LIMITS.company} caracteres.`;

  if (data.role.length === 0) errors.role = "El puesto es obligatorio.";
  else if (data.role.length > LIMITS.role)
    errors.role = `El puesto no puede superar los ${LIMITS.role} caracteres.`;

  if (data.location.length > LIMITS.location)
    errors.location = `La ubicación no puede superar los ${LIMITS.location} caracteres.`;

  if (data.link.length > LIMITS.link)
    errors.link = `El enlace no puede superar los ${LIMITS.link} caracteres.`;
  else if (data.link.length > 0 && !/^https?:\/\//i.test(data.link))
    errors.link = "El enlace debe empezar por http:// o https://.";

  if (data.notes.length > LIMITS.notes)
    errors.notes = `Las notas no pueden superar los ${LIMITS.notes} caracteres.`;

  if (!isApplicationStatus(data.status)) errors.status = "El estado no es válido.";

  if (data.followUp !== null && !isValidDate(data.followUp))
    errors.followUp = "La fecha de seguimiento no es válida (AAAA-MM-DD).";

  return { valid: Object.keys(errors).length === 0, errors };
}

function assertValid(input: ApplicationInput): ApplicationInput {
  const result = validateApplication(input);
  if (!result.valid) {
    const first = Object.values(result.errors)[0];
    throw new Error(first ?? "La candidatura no es válida.");
  }
  return normalizeApplication(input);
}

function toApplication(id: string, data: DocumentData): Application {
  const str = (value: unknown): string => (typeof value === "string" ? value : "");
  const num = (value: unknown): number => (typeof value === "number" ? value : 0);
  return {
    id,
    company: str(data.company),
    role: str(data.role),
    location: str(data.location),
    status: isApplicationStatus(data.status) ? data.status : "pendiente",
    link: str(data.link),
    notes: str(data.notes),
    followUp: typeof data.followUp === "string" ? data.followUp : null,
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt),
  };
}

function applicationsCollection(uid: string) {
  return collection(db(), "users", uid, "applications");
}

export function subscribeApplications(
  uid: string,
  onChange: (apps: Application[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const q = query(applicationsCollection(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => toApplication(d.id, d.data()))),
    onError,
  );
}

export async function createApplication(uid: string, input: ApplicationInput): Promise<string> {
  const data = assertValid(input);
  const now = Date.now();
  const ref = await addDoc(applicationsCollection(uid), {
    company: data.company,
    role: data.role,
    location: data.location,
    status: data.status,
    link: data.link,
    notes: data.notes,
    followUp: data.followUp,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateApplication(
  uid: string,
  id: string,
  input: ApplicationInput,
): Promise<void> {
  const data = assertValid(input);
  await updateDoc(doc(db(), "users", uid, "applications", id), {
    company: data.company,
    role: data.role,
    location: data.location,
    status: data.status,
    link: data.link,
    notes: data.notes,
    followUp: data.followUp,
    updatedAt: Date.now(),
  });
}

export async function deleteApplication(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), "users", uid, "applications", id));
}
