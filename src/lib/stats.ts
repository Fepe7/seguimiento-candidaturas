import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "./applications";

export type StatusFilter = ApplicationStatus | "todas";

export type ApplicationFilters = {
  status: StatusFilter;
  query: string;
};

export function countByStatus(apps: readonly Application[]): Record<ApplicationStatus, number> {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<
    ApplicationStatus,
    number
  >;
  for (const app of apps) counts[app.status] += 1;
  return counts;
}

export function isFollowUpOverdue(app: Application, today: string): boolean {
  if (app.followUp === null) return false;
  if (app.status === "oferta" || app.status === "rechazada") return false;
  return app.followUp < today;
}

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function filterApplications(
  apps: readonly Application[],
  filters: ApplicationFilters,
): Application[] {
  const q = normalizeText(filters.query);
  return apps.filter((app) => {
    if (filters.status !== "todas" && app.status !== filters.status) return false;
    if (q === "") return true;
    return [app.company, app.role, app.location].some((field) => normalizeText(field).includes(q));
  });
}

export function sortByFollowUp(apps: readonly Application[]): Application[] {
  return [...apps].sort((a, b) => {
    if (a.followUp === null && b.followUp === null) return 0;
    if (a.followUp === null) return 1;
    if (b.followUp === null) return -1;
    return a.followUp.localeCompare(b.followUp);
  });
}
