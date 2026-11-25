import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";

export const STATUS_STYLES: Record<ApplicationStatus, { badge: string; dot: string }> = {
  pendiente: { badge: "bg-stone-100 text-stone-700 ring-stone-300", dot: "bg-stone-400" },
  enviada: { badge: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  entrevista: { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  oferta: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  rechazada: { badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-400" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
