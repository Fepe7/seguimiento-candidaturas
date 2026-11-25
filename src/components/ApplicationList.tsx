import { APPLICATION_STATUSES, STATUS_LABELS, type Application } from "@/lib/applications";
import { formatDate } from "@/lib/form";
import { isFollowUpOverdue, type ApplicationFilters, type StatusFilter } from "@/lib/stats";
import { StatusBadge } from "./StatusBadge";

type ApplicationListProps = {
  apps: Application[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  today: string;
  filters: ApplicationFilters;
  onFiltersChange: (filters: ApplicationFilters) => void;
  editingId: string | null;
  deletingId: string | null;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
};

const controlClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

export function ApplicationList({
  apps,
  totalCount,
  loading,
  error,
  today,
  filters,
  onFiltersChange,
  editingId,
  deletingId,
  onEdit,
  onDelete,
}: ApplicationListProps) {
  return (
    <section aria-labelledby="list-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="list-title" className="text-sm font-semibold">
          Candidaturas
        </h2>
        {!loading && !error && totalCount > 0 && (
          <span className="font-mono text-xs tabular-nums text-stone-500">
            {apps.length} de {totalCount}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar por empresa, puesto o ubicación
          </label>
          <input
            id="search"
            type="search"
            placeholder="Buscar empresa, puesto o ubicación…"
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className={`${controlClass} w-full`}
          />
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filtrar por estado
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as StatusFilter })}
            className={`${controlClass} w-full sm:w-auto`}
          >
            <option value="todas">Todos los estados</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p role="status" className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Cargando candidaturas…
        </p>
      ) : error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </p>
      ) : totalCount === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium">Aún no tienes candidaturas.</p>
          <p className="mt-1 text-sm text-stone-500">Añade la primera con el formulario.</p>
        </div>
      ) : apps.length === 0 ? (
        <p className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Ninguna candidatura coincide con la búsqueda o el filtro.
        </p>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => {
            const overdue = isFollowUpOverdue(app, today);
            const isEditing = editingId === app.id;
            const isDeleting = deletingId === app.id;
            return (
              <li
                key={app.id}
                className={`rounded-lg border bg-white p-4 transition ${
                  isEditing ? "border-stone-900 ring-2 ring-stone-900/10" : "border-stone-200"
                } ${isDeleting ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold">{app.company}</h3>
                    <p className="break-words text-sm text-stone-700">{app.role}</p>
                    {app.location && <p className="break-words text-xs text-stone-500">{app.location}</p>}
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                {(app.followUp || app.link) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    {app.followUp && (
                      <span className={overdue ? "font-medium text-red-700" : "text-stone-600"}>
                        {overdue ? "Seguimiento vencido" : "Seguimiento"}:{" "}
                        <time dateTime={app.followUp} className="font-mono tabular-nums">
                          {formatDate(app.followUp)}
                        </time>
                      </span>
                    )}
                    {app.link && (
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600"
                      >
                        Ver oferta
                        <span className="sr-only"> de {app.company} (se abre en una pestaña nueva)</span>
                      </a>
                    )}
                  </div>
                )}

                {app.notes && (
                  <p className="mt-3 whitespace-pre-line break-words border-l-2 border-stone-200 pl-3 text-xs text-stone-600">
                    {app.notes}
                  </p>
                )}

                <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    disabled={isDeleting}
                    aria-label={`Editar candidatura de ${app.company}`}
                    className="rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(app)}
                    disabled={isDeleting}
                    aria-label={`Borrar candidatura de ${app.company}`}
                    className="rounded-md border border-transparent px-3 py-1 text-xs font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
                  >
                    {isDeleting ? "Borrando…" : "Borrar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
