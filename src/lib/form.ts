import type { Application, ApplicationInput, ApplicationStatus } from "./applications";

export type ApplicationFormValues = {
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  link: string;
  notes: string;
  followUp: string;
};

export const EMPTY_FORM: ApplicationFormValues = {
  company: "",
  role: "",
  location: "",
  status: "pendiente",
  link: "",
  notes: "",
  followUp: "",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayISO(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formToInput(values: ApplicationFormValues): ApplicationInput {
  const followUp = values.followUp.trim();
  return {
    company: values.company,
    role: values.role,
    location: values.location,
    status: values.status,
    link: values.link,
    notes: values.notes,
    followUp: followUp === "" ? null : followUp,
  };
}

export function applicationToForm(app: Application): ApplicationFormValues {
  return {
    company: app.company,
    role: app.role,
    location: app.location,
    status: app.status,
    link: app.link,
    notes: app.notes,
    followUp: app.followUp ?? "",
  };
}

export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
