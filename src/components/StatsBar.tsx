import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";
import { STATUS_STYLES } from "./StatusBadge";

type StatsBarProps = {
  total: number;
  counts: Record<ApplicationStatus, number>;
  overdue: number;
};

export function StatsBar({ total, counts, overdue }: StatsBarProps) {
  return (
    <section aria-label="Resumen" className="space-y-3">
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <div className="rounded-lg border border-stone-900 bg-stone-900 px-3 py-2.5 text-white">
          <dt className="text-xs text-stone-300">Total</dt>
          <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums">{total}</dd>
        </div>
        {APPLICATION_STATUSES.map((status) => (
          <div key={status} className="rounded-lg border border-stone-200 bg-white px-3 py-2.5">
            <dt className="flex items-center gap-1.5 truncate text-xs text-stone-500">
              <span className={`size-1.5 shrink-0 rounded-full ${STATUS_STYLES[status].dot}`} aria-hidden="true" />
              <span className="truncate">{STATUS_LABELS[status]}</span>
            </dt>
            <dd className="mt-0.5 font-mono text-xl font-semibold tabular-nums">{counts[status]}</dd>
          </div>
        ))}
      </dl>
      {overdue > 0 && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          <span className="size-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
          {overdue === 1
            ? "Tienes 1 seguimiento vencido."
            : `Tienes ${overdue} seguimientos vencidos.`}
        </p>
      )}
    </section>
  );
}
