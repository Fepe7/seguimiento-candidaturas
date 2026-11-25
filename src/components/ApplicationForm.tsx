"use client";

import { useState, type FormEvent } from "react";
import {
  APPLICATION_STATUSES,
  LIMITS,
  STATUS_LABELS,
  validateApplication,
  type Application,
  type ApplicationField,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/lib/applications";
import { firestoreErrorMessage } from "@/lib/errors";
import { applicationToForm, EMPTY_FORM, formToInput, type ApplicationFormValues } from "@/lib/form";

type ApplicationFormProps = {
  editing: Application | null;
  onSubmit: (input: ApplicationInput) => Promise<void>;
  onCancel: () => void;
};

const baseInput =
  "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";

function FieldError({ field, message }: { field: ApplicationField; message?: string }) {
  if (!message) return null;
  return (
    <p id={`field-${field}-error`} className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export function ApplicationForm({ editing, onSubmit, onCancel }: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>(
    editing ? applicationToForm(editing) : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<Partial<Record<ApplicationField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = editing !== null;

  function update<K extends keyof ApplicationFormValues>(field: K, value: ApplicationFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const input = formToInput(values);
    const result = validateApplication(input);
    setErrors(result.errors);
    if (!result.valid) return;
    setSaving(true);
    try {
      await onSubmit(input);
      if (!isEditing) setValues(EMPTY_FORM);
    } catch (error) {
      setSubmitError(firestoreErrorMessage(error, "No se ha podido guardar la candidatura."));
    } finally {
      setSaving(false);
    }
  }

  function inputClass(field: ApplicationField) {
    return `${baseInput} ${errors[field] ? "border-red-500" : "border-stone-300"}`;
  }

  function a11y(field: ApplicationField) {
    return {
      id: `field-${field}`,
      "aria-invalid": errors[field] ? true : undefined,
      "aria-describedby": errors[field] ? `field-${field}-error` : undefined,
    };
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="form-title"
      className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="form-title" className="text-sm font-semibold">
          {isEditing ? "Editar candidatura" : "Nueva candidatura"}
        </h2>
        {isEditing && <span className="truncate text-xs text-stone-500">{editing.company}</span>}
      </div>

      <div>
        <label htmlFor="field-company" className="mb-1 block text-sm font-medium">
          Empresa <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          {...a11y("company")}
          type="text"
          required
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          className={inputClass("company")}
        />
        <FieldError field="company" message={errors.company} />
      </div>

      <div>
        <label htmlFor="field-role" className="mb-1 block text-sm font-medium">
          Puesto <span className="text-red-600" aria-hidden="true">*</span>
        </label>
        <input
          {...a11y("role")}
          type="text"
          required
          value={values.role}
          onChange={(e) => update("role", e.target.value)}
          className={inputClass("role")}
        />
        <FieldError field="role" message={errors.role} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="field-location" className="mb-1 block text-sm font-medium">
            Ubicación
          </label>
          <input
            {...a11y("location")}
            type="text"
            placeholder="Valencia, remoto…"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            className={inputClass("location")}
          />
          <FieldError field="location" message={errors.location} />
        </div>
        <div>
          <label htmlFor="field-status" className="mb-1 block text-sm font-medium">
            Estado
          </label>
          <select
            {...a11y("status")}
            value={values.status}
            onChange={(e) => update("status", e.target.value as ApplicationStatus)}
            className={inputClass("status")}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <FieldError field="status" message={errors.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="field-link" className="mb-1 block text-sm font-medium">
            Enlace a la oferta
          </label>
          <input
            {...a11y("link")}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={values.link}
            onChange={(e) => update("link", e.target.value)}
            className={inputClass("link")}
          />
          <FieldError field="link" message={errors.link} />
        </div>
        <div>
          <label htmlFor="field-followUp" className="mb-1 block text-sm font-medium">
            Fecha de seguimiento
          </label>
          <input
            {...a11y("followUp")}
            type="date"
            value={values.followUp}
            onChange={(e) => update("followUp", e.target.value)}
            className={inputClass("followUp")}
          />
          <FieldError field="followUp" message={errors.followUp} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor="field-notes" className="block text-sm font-medium">
            Notas
          </label>
          <span
            className={`font-mono text-xs tabular-nums ${values.notes.length > LIMITS.notes ? "text-red-600" : "text-stone-400"}`}
          >
            {values.notes.length}/{LIMITS.notes}
          </span>
        </div>
        <textarea
          {...a11y("notes")}
          rows={4}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass("notes")} resize-y`}
        />
        <FieldError field="notes" message={errors.notes} />
      </div>

      {submitError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando…" : isEditing ? "Guardar" : "Añadir candidatura"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
