"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createApplication,
  deleteApplication,
  subscribeApplications,
  updateApplication,
  type Application,
  type ApplicationInput,
} from "@/lib/applications";
import { firestoreErrorMessage } from "@/lib/errors";
import { todayISO } from "@/lib/form";
import {
  countByStatus,
  filterApplications,
  isFollowUpOverdue,
  sortByFollowUp,
  type ApplicationFilters,
} from "@/lib/stats";
import { AppHeader } from "./AppHeader";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationList } from "./ApplicationList";
import { StatsBar } from "./StatsBar";

type DashboardProps = {
  uid: string;
  email: string;
};

export function Dashboard({ uid, email }: DashboardProps) {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({ status: "todas", query: "" });
  const [today] = useState(() => todayISO());

  useEffect(() => {
    setLoading(true);
    setListError(null);
    try {
      return subscribeApplications(
        uid,
        (next) => {
          setApps(next);
          setLoading(false);
        },
        (error) => {
          setListError(firestoreErrorMessage(error, "No se han podido cargar tus candidaturas."));
          setLoading(false);
        },
      );
    } catch (error) {
      setListError(firestoreErrorMessage(error, "No se han podido cargar tus candidaturas."));
      setLoading(false);
      return undefined;
    }
  }, [uid]);

  const counts = useMemo(() => countByStatus(apps), [apps]);
  const overdue = useMemo(() => apps.filter((app) => isFollowUpOverdue(app, today)).length, [apps, today]);
  const visible = useMemo(() => sortByFollowUp(filterApplications(apps, filters)), [apps, filters]);

  async function handleSubmit(input: ApplicationInput) {
    setActionError(null);
    if (editing) {
      await updateApplication(uid, editing.id, input);
      setEditing(null);
    } else {
      await createApplication(uid, input);
    }
  }

  function handleEdit(app: Application) {
    setActionError(null);
    setEditing(app);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleDelete(app: Application) {
    const confirmed = window.confirm(
      `¿Seguro que quieres borrar la candidatura de ${app.company} (${app.role})? No se puede deshacer.`,
    );
    if (!confirmed) return;
    setActionError(null);
    setDeletingId(app.id);
    try {
      await deleteApplication(uid, app.id);
      if (editing?.id === app.id) setEditing(null);
    } catch (error) {
      setActionError(firestoreErrorMessage(error, "No se ha podido borrar la candidatura."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader email={email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <StatsBar total={apps.length} counts={counts} overdue={overdue} />

        {actionError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
          <div id="application-form" className="scroll-mt-4 lg:sticky lg:top-6">
            <ApplicationForm
              key={editing?.id ?? "nueva"}
              editing={editing}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>
          <ApplicationList
            apps={visible}
            totalCount={apps.length}
            loading={loading}
            error={listError}
            today={today}
            filters={filters}
            onFiltersChange={setFilters}
            editingId={editing?.id ?? null}
            deletingId={deletingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}
